import pool from '../db.js';
import { hashPassword } from '../utils/password.js';

export async function listUsers(req, res) {
  const result = await pool.query(
    `SELECT
       id,
       email,
       role,
       is_active AS "isActive",
       created_at AS "createdAt",
       updated_at AS "updatedAt"
     FROM users
     ORDER BY created_at DESC`
  );
  res.json(result.rows);
}

export async function createUser(req, res) {
  const { email, password, role = 'customer' } = req.body;

  const passwordHash = await hashPassword(password);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, $3)
     RETURNING
       id,
       email,
       role,
       is_active AS "isActive",
       created_at AS "createdAt",
       updated_at AS "updatedAt"`,
    [email, passwordHash, role]
  );

  res.status(201).json(result.rows[0]);
}

export async function getUser(req, res) {
  const { userId } = req.params;

  const result = await pool.query(
    `SELECT
       id,
       email,
       role,
       is_active AS "isActive",
       created_at AS "createdAt",
       updated_at AS "updatedAt"
     FROM users
     WHERE id = $1`,
    [userId]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(result.rows[0]);
}

export async function updateUser(req, res) {
  const { userId } = req.params;
  const { email, role, isActive } = req.body;

  const result = await pool.query(
    `UPDATE users
     SET
       email = COALESCE($2, email),
       role = COALESCE($3, role),
       is_active = COALESCE($4, is_active),
       updated_at = NOW()
     WHERE id = $1
     RETURNING
       id,
       email,
       role,
       is_active AS "isActive",
       created_at AS "createdAt",
       updated_at AS "updatedAt"`,
    [userId, email, role, isActive]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(result.rows[0]);
}

export async function deleteUser(req, res) {
  const { userId } = req.params;

  const result = await pool.query(
    `UPDATE users
     SET is_active = FALSE,
         updated_at = NOW()
     WHERE id = $1`,
    [userId]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(204).send();
}
