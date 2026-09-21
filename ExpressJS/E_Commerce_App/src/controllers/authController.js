import pool from '../db.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { randomUUID } from 'crypto';

const oauthStates = new Map();
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

function createAuthResponse(user) {
  return {
    accessToken: generateToken(user.id, user.role),
    tokenType: 'Bearer',
    expiresIn: 3600
  };
}

export async function register(req, res) {
  const { email, password } = req.body;

  const hashed = await hashPassword(password);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, 'customer')
     RETURNING id, email, role, is_active, created_at, updated_at`,
    [email, hashed]
  );

  res.status(201).json(result.rows[0]);
}

export async function login(req, res) {
  const { email, password } = req.body;

  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1 AND is_active = TRUE`,
    [email]
  );

  if (result.rowCount === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = result.rows[0];
  const valid = await verifyPassword(password, user.password_hash);

  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json(createAuthResponse(user));
}

export async function startOAuth(req, res) {
  const { provider } = req.params;
  const state = randomUUID();

  oauthStates.set(state, {
    provider,
    expiresAt: Date.now() + OAUTH_STATE_TTL_MS
  });

  const callbackUrl = `${req.protocol}://${req.get('host')}/auth/oauth/${provider}/callback`;
  res.json({
    authorizationUrl: `${callbackUrl}?state=${state}`,
    state,
    expiresIn: OAUTH_STATE_TTL_MS / 1000,
    mode: 'dummy'
  });
}

export async function completeOAuth(req, res) {
  const { provider } = req.params;
  const { state, mockSubject = 'demo-user' } = req.body;
  const flow = oauthStates.get(state);

  if (!flow || flow.provider !== provider || flow.expiresAt < Date.now()) {
    oauthStates.delete(state);
    return res.status(400).json({ error: 'OAuth state is invalid or expired' });
  }
  oauthStates.delete(state);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const accountRes = await client.query(
      `SELECT u.id, u.email, u.role
       FROM oauth_accounts oa
       JOIN users u ON u.id = oa.user_id
       WHERE oa.provider = $1 AND oa.provider_user_id = $2 AND u.is_active = TRUE`,
      [provider, mockSubject]
    );

    let user = accountRes.rows[0];
    if (!user) {
      const email = `${provider}-${mockSubject}@oauth.local`;
      const userRes = await client.query(
        `INSERT INTO users (email, password_hash, role)
         VALUES ($1, $2, 'customer')
         RETURNING id, email, role`,
        [email, await hashPassword(randomUUID())]
      );
      user = userRes.rows[0];
      await client.query(
        `INSERT INTO oauth_accounts (user_id, provider, provider_user_id)
         VALUES ($1, $2, $3)`,
        [user.id, provider, mockSubject]
      );
    }

    await client.query('COMMIT');
    res.json(createAuthResponse(user));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
