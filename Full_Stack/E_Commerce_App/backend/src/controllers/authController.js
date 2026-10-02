import pool from "../db.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import { randomUUID } from "crypto";
import { githubOAuthClient } from "../utils/githubOAuthClient.js";

const oauthStates = new Map();
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

// OAuth state management for handling the state parameter during the OAuth flow
// This ensures that the OAuth process is secure and prevents CSRF attacks
function createAuthResponse(user) {
  return {
    accessToken: generateToken(user.id, user.role),
    tokenType: "Bearer",
    expiresIn: 3600,
  };
}

// Helper function to create a standardized authentication response containing the access token and its metadata
export async function register(req, res) {
  const { email, password } = req.body;

  const hashed = await hashPassword(password);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, 'customer')
     RETURNING
       id,
       email,
       role,
       is_active AS "isActive",
       created_at AS "createdAt",
       updated_at AS "updatedAt"`,
    [email, hashed],
  );

  res.status(201).json(result.rows[0]);
}

// User registration endpoint
export async function login(req, res) {
  const { email, password } = req.body;

  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1 AND is_active = TRUE`,
    [email],
  );

  if (result.rowCount === 0) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const user = result.rows[0];
  const valid = await verifyPassword(password, user.password_hash);

  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json(createAuthResponse(user));
}

// User login endpoint
// Validates user credentials and returns an authentication response containing the access token and its metadata

// Returns the profile of the currently authenticated user (used by the
// frontend to hydrate session state after login/OAuth or on page reload).
export async function getMe(req, res) {
  const result = await pool.query(
    `SELECT
       id,
       email,
       name,
       role,
       created_at AS "createdAt"
     FROM users
     WHERE id = $1`,
    [req.user.userId],
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(result.rows[0]);
}

// Initiates the real GitHub OAuth flow by generating a CSRF-protection
// `state` value, remembering it server-side, and redirecting the browser to
// GitHub's authorization page. The user's browser is expected to navigate
// here directly (not an XHR/fetch call).
export async function startOAuth(req, res) {
  const { provider } = req.params;
  const state = randomUUID();

  oauthStates.set(state, {
    provider,
    expiresAt: Date.now() + OAUTH_STATE_TTL_MS,
  });

  res.redirect(githubOAuthClient.buildAuthorizeUrl(state));
}

// Completes the OAuth flow: GitHub redirects the browser back here with
// `code`/`state` (or `error` if the user denied access). On success we
// exchange the code for a GitHub access token, fetch the user's profile and
// email, upsert the local user/oauth_accounts rows, and redirect back to the
// frontend with our own JWT in the URL fragment (never the query string, so
// it isn't logged by servers/proxies).
export async function completeOAuth(req, res) {
  const { provider } = req.params;
  const { code, state, error: oauthError } = req.query;
  const frontendUrl = process.env.FRONTEND_URL;

  function redirectWithError(message) {
    res.redirect(
      `${frontendUrl}/oauth/callback#error=${encodeURIComponent(message)}`,
    );
  }

  if (oauthError) {
    return redirectWithError("GitHub authorization was cancelled or denied");
  }

  if (!code || !state) {
    return redirectWithError("Missing OAuth code or state");
  }

  const flow = oauthStates.get(state);
  if (!flow || flow.provider !== provider || flow.expiresAt < Date.now()) {
    oauthStates.delete(state);
    return redirectWithError("OAuth state is invalid or expired");
  }
  oauthStates.delete(state);

  let githubAccessToken;
  let profile;
  let email;
  try {
    githubAccessToken = await githubOAuthClient.exchangeCodeForAccessToken(code);
    profile = await githubOAuthClient.fetchGithubUser(githubAccessToken);
    email =
      profile.email ||
      (await githubOAuthClient.fetchPrimaryEmail(githubAccessToken));
  } catch (err) {
    console.error("GitHub OAuth exchange failed:", err);
    return redirectWithError("Failed to authenticate with GitHub");
  }

  if (!email) {
    return redirectWithError(
      "Your GitHub account has no verified email address",
    );
  }

  const providerUserId = String(profile.id);
  const name = profile.name || profile.login || null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const accountRes = await client.query(
      `SELECT u.id, u.email, u.role
       FROM oauth_accounts oa
       JOIN users u ON u.id = oa.user_id
       WHERE oa.provider = $1 AND oa.provider_user_id = $2 AND u.is_active = TRUE`,
      [provider, providerUserId],
    );

    let user = accountRes.rows[0];
    if (!user) {
      // If a user already registered with this email (e.g. via
      // email/password), link the GitHub identity to that existing account
      // instead of erroring on the unique email constraint.
      const userRes = await client.query(
        `INSERT INTO users (email, name, role)
         VALUES ($1, $2, 'customer')
         ON CONFLICT (email) DO UPDATE SET name = COALESCE(users.name, EXCLUDED.name)
         RETURNING id, email, role`,
        [email, name],
      );
      user = userRes.rows[0];
      await client.query(
        `INSERT INTO oauth_accounts (user_id, provider, provider_user_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (provider, provider_user_id) DO NOTHING`,
        [user.id, provider, providerUserId],
      );
    }

    await client.query("COMMIT");
    const auth = createAuthResponse(user);
    res.redirect(`${frontendUrl}/oauth/callback#token=${auth.accessToken}`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("OAuth user upsert failed:", error);
    redirectWithError("Failed to complete sign in");
  } finally {
    client.release();
  }
}
