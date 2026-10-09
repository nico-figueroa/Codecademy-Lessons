import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export async function register(req, res) {
  const { email, password, timezone } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash, timezone)
     VALUES ($1, $2, $3)
     RETURNING id, email, timezone`,
    [email, hashed, timezone || null]
  );

  res.json(result.rows[0]);
}

export async function login(req, res) {
  const { email, password } = req.body;

  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
}

export async function me(req, res) {
  const result = await pool.query(
    `SELECT id, email, timezone FROM users WHERE id = $1`,
    [req.user.id]
  );

  res.json(result.rows[0]);
}
