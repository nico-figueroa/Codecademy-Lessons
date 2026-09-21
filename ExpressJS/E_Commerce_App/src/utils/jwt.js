import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

export function generateToken(userId, role) {
  return jwt.sign({ userId, role }, SECRET, { expiresIn: '1h' });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
