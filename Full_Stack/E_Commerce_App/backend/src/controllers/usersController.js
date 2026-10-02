import pool from "../db.js";
import { hashPassword } from "../utils/password.js";
// Admin-only user management (CRUD). Deletion is a soft delete so order
// history stays intact; inactive users can be listed and reactivated.

const USER_COLUMNS = `
  id,
  email,
  name,
  role,
  phone,
  address_line1 AS "line1",
  address_line2 AS "line2",
  city,
  state,
  postal_code AS "postalCode",
  country,
  is_active AS "isActive",
  created_at AS "createdAt",
  updated_at AS "updatedAt"`;

function shapeUser(row) {
  const { line1, line2, city, state, postalCode, country, ...rest } = row;
  return { ...rest, address: { line1, line2, city, state, postalCode, country } };
}

// Lists users; inactive ones only when ?includeInactive=true
export async function listUsers(req, res) {
  const includeInactive = req.query.includeInactive === "true";
  const result = await pool.query(
    `SELECT ${USER_COLUMNS}
     FROM users
     ${includeInactive ? "" : "WHERE is_active = TRUE"}
     ORDER BY created_at DESC`,
  );
  res.json(result.rows.map(shapeUser));
}

// Staff: id/name/email/phone/address of active users, for assigning orders
export async function lookupUsers(req, res) {
  const result = await pool.query(
    `SELECT id, name, email FROM users WHERE is_active = TRUE ORDER BY name, email`,
  );
  res.json(result.rows);
}

// Creates a new user with the provided details
export async function createUser(req, res) {
  const { email, password, role = "customer", name, phone, address = {} } =
    req.body;

  const passwordHash = await hashPassword(password);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash, role, name, phone,
       address_line1, address_line2, city, state, postal_code, country)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING ${USER_COLUMNS}`,
    [
      email,
      passwordHash,
      role,
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

  res.status(201).json(shapeUser(result.rows[0]));
}

// Retrieves a specific user by ID
export async function getUser(req, res) {
  const { userId } = req.params;

  const result = await pool.query(
    `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
    [userId],
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(shapeUser(result.rows[0]));
}

// Updates an existing user with the provided details
export async function updateUser(req, res) {
  const { userId } = req.params;
  const { email, role, isActive, password, name, phone, address = {} } =
    req.body;

  // Prevent an admin from locking themself out
  if (
    userId === req.user.userId &&
    (isActive === false || (role !== undefined && role !== "admin"))
  ) {
    return res
      .status(400)
      .json({ error: "You cannot deactivate or demote your own account" });
  }

  const passwordHash = password ? await hashPassword(password) : null;

  const result = await pool.query(
    `UPDATE users
     SET
       email = COALESCE($2, email),
       role = COALESCE($3, role),
       is_active = COALESCE($4, is_active),
       password_hash = COALESCE($5, password_hash),
       name = COALESCE($6, name),
       phone = COALESCE($7, phone),
       address_line1 = COALESCE($8, address_line1),
       address_line2 = COALESCE($9, address_line2),
       city = COALESCE($10, city),
       state = COALESCE($11, state),
       postal_code = COALESCE($12, postal_code),
       country = COALESCE($13, country),
       updated_at = NOW()
     WHERE id = $1
     RETURNING ${USER_COLUMNS}`,
    [
      userId,
      email ?? null,
      role ?? null,
      isActive ?? null,
      passwordHash,
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

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(shapeUser(result.rows[0]));
}

// Soft deletes a user by setting its active status to false
export async function deleteUser(req, res) {
  const { userId } = req.params;

  if (userId === req.user.userId) {
    return res.status(400).json({ error: "You cannot delete your own account" });
  }

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