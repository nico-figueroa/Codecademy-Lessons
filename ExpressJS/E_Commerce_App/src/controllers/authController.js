import pool from '../db.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

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

  const token = generateToken(user.id, user.role);

  res.json({
    accessToken: token,
    tokenType: 'Bearer',
    expiresIn: 3600
  });
}
