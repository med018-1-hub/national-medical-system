import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../lib/jwt';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/**
 * Middleware to authenticate a user based on their JWT token.
 * Validates the 'Authorization: Bearer <token>' header.
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

/**
 * Middleware factory to enforce Role-Based Access Control (RBAC).
 * Ensures the authenticated user has one of the required roles.
 * 
 * @param allowedRoles Array of Roles permitted to access the route
 */
export const requireRole = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};
