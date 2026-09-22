import pool from "../db.js";
import { hashPassword } from "../utils/password.js";
// Controller for managing users in the e-commerce application
// Provides functions to list users, create a new user, retrieve a specific user, update a user, and delete a user
// Ensures that only active users are listed
// Maintains data integrity when creating, updating, or deleting users

// Lists all active users, ensuring only active users are returned
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
     WHERE is_active = TRUE
     ORDER BY created_at DESC`,
  );
  res.json(result.rows);
}

// Creates a new user with the provided details
export async function createUser(req, res) {
  const { email, password, role = "customer" } = req.body;

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
    [email, passwordHash, role],
  );

  res.status(201).json(result.rows[0]);
}

// Retrieves a specific user by ID
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
    [userId],
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(result.rows[0]);
}

// Updates an existing user with the provided details
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
    [userId, email, role, isActive],
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(result.rows[0]);
}

// Soft deletes a user by setting its active status to false
export async function deleteUser(req, res) {
  const { userId } = req.params;

  const result = await pool.query(
    `UPDATE users
     SET is_active = FALSE,
         updated_at = NOW()
     WHERE id = $1`,
    [userId],
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(204).send();
}
