import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("JWT_SECRET must be set");
}

// Utility functions for generating and verifying JSON Web Tokens (JWTs)

// Function to generate a JWT for a given user ID and role
export function generateToken(userId, role) {
  return jwt.sign({ userId, role }, SECRET, { expiresIn: "1h" });
}

// Function to verify a given JWT and return the decoded payload
export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
