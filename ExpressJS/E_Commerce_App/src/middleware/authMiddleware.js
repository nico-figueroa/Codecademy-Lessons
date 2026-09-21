import { verifyToken } from "../utils/jwt.js";

// Middleware for handling authentication and authorization
// Provides functions to enforce authentication and restrict access to admin users only

// Enforces authentication by verifying the presence and validity of a JWT token in the request headers
export function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Missing token" });

  const token = header.split(" ")[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
// Restricts access to admin users only
export function adminOnly(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
}
