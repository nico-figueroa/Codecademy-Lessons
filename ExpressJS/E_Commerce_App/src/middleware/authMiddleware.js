import pool from "../db.js";
import { verifyToken } from "../utils/jwt.js";

// Middleware for handling authentication and authorization
// Provides functions to enforce authentication and restrict access to admin users only

// Enforces authentication by verifying the presence and validity of a JWT token in the request headers
export async function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = header.split(" ")[1];
  try {
    const payload = verifyToken(token);
    const userRes = await pool.query(
      `SELECT id, role, is_active AS "isActive"
       FROM users
       WHERE id = $1`,
      [payload.userId],
    );

    if (userRes.rowCount === 0 || !userRes.rows[0].isActive) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = {
      userId: userRes.rows[0].id,
      role: userRes.rows[0].role,
    };
    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({ error: "Invalid token" });
    }
    next(error);
  }
}
// Restricts access to admin users only
export function adminOnly(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
}
