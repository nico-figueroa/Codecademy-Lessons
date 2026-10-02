import pool from "../db.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import { randomUUID } from "crypto";
import { githubOAuthClient } from "../utils/githubOAuthClient.js";

const oauthStates = new Map();
const pendingSignIns = new Map();
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
  const { email, password, name } = req.body;

  const hashed = await hashPassword(password);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1, $2, $3, 'customer')
     RETURNING
       id,
       email,
       name,
       role,
       is_active AS "isActive",
       created_at AS "createdAt",
       updated_at AS "updatedAt"`,
    [email, hashed, name ?? null],
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

const PROFILE_COLUMNS = `
  id,
  email,
  name,
  phone,
  role,
  address_line1 AS "line1",
  address_line2 AS "line2",
  city,
  state,
  postal_code AS "postalCode",
  country,
  (password_hash IS NOT NULL) AS "hasPassword",
  created_at AS "createdAt"`;

function toProfile(row) {
  const { line1, line2, city, state, postalCode, country, ...rest } = row;
  return {
    ...rest,
    address: { line1, line2, city, state, postalCode, country },
  };
}

// Returns the profile of the currently authenticated user (used by the
// frontend to hydrate session state after login/OAuth or on page reload).
export async function getMe(req, res) {
  const result = await pool.query(
    `SELECT ${PROFILE_COLUMNS} FROM users WHERE id = $1`,
    [req.user.userId],
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(toProfile(result.rows[0]));
}

// Lets a signed-in user edit their own profile: display name, phone and
// default delivery address. Only provided fields are changed.
export async function updateMe(req, res) {
  const { name, phone, address = {} } = req.body;

  const result = await pool.query(
    `UPDATE users
     SET name = COALESCE($2, name),
         phone = COALESCE($3, phone),
         address_line1 = COALESCE($4, address_line1),
         address_line2 = COALESCE($5, address_line2),
         city = COALESCE($6, city),
         state = COALESCE($7, state),
         postal_code = COALESCE($8, postal_code),
         country = COALESCE($9, country),
         updated_at = NOW()
     WHERE id = $1
     RETURNING ${PROFILE_COLUMNS}`,
    [
      req.user.userId,
      name ?? null,
      phone ?? null,
      address.line1 ?? null,
      address.line2 ?? null,
      address.city ?? null,
      address.state ?? null,
      address.postalCode ?? null,
      address.country ?? null,
    ],
  );

  res.json(toProfile(result.rows[0]));
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

  res.redirect(
    githubOAuthClient.buildAuthorizeUrl(state, {
      selectAccount: req.query.select === "1",
    }),
  );
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

    // Don't sign in yet: hand the browser a short-lived ticket so the user
    // can confirm this is the account they want (or pick a different one).
    const ticket = randomUUID();
    pendingSignIns.set(ticket, {
      userId: user.id,
      expiresAt: Date.now() + OAUTH_STATE_TTL_MS,
      summary: {
        email: user.email,
        name: name,
        githubLogin: profile.login,
        avatarUrl: profile.avatar_url ?? null,
      },
    });
    res.redirect(`${frontendUrl}/oauth/confirm#ticket=${ticket}`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("OAuth user upsert failed:", error);
    redirectWithError("Failed to complete sign in");
  } finally {
    client.release();
  }
}

function takePending(ticket, { consume }) {
  const pending = pendingSignIns.get(ticket);
  if (!pending || pending.expiresAt < Date.now()) {
    pendingSignIns.delete(ticket);
    return null;
  }
  if (consume) pendingSignIns.delete(ticket);
  return pending;
}

// Describes who a pending GitHub sign-in would log in as, so the frontend can
// ask "continue as ...?".
export async function getPendingOAuth(req, res) {
  const pending = takePending(req.params.ticket, { consume: false });
  if (!pending) {
    return res.status(404).json({ error: "Sign-in request expired" });
  }
  res.json(pending.summary);
}

// Confirms a pending GitHub sign-in and returns our access token.
export async function confirmOAuth(req, res) {
  const pending = takePending(req.body.ticket, { consume: true });
  if (!pending) {
    return res.status(404).json({ error: "Sign-in request expired" });
  }

  const userRes = await pool.query(
    `SELECT id, role FROM users WHERE id = $1 AND is_active = TRUE`,
    [pending.userId],
  );
  if (userRes.rowCount === 0) {
    return res.status(401).json({ error: "Account unavailable" });
  }
  res.json(createAuthResponse(userRes.rows[0]));
}

// Discards a pending GitHub sign-in (user chose a different account).
export async function discardOAuth(req, res) {
  pendingSignIns.delete(req.body.ticket);
  res.status(204).send();
}