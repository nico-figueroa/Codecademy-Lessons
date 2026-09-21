import bcrypt from "bcrypt";

// Utility functions for hashing and verifying passwords
// Function to hash a given password
export function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// Function to verify a given password against a hash
export function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
