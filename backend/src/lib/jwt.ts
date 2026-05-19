import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export interface JwtPayload {
  userId: string;
  role: Role;
}

/**
 * Creates a signed JWT token
 * @param payload The user information to encode
 * @returns The signed JWT token string
 */
export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Verifies a JWT token and returns its decoded payload
 * @param token The JWT token to verify
 * @returns The decoded payload or null if invalid
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
