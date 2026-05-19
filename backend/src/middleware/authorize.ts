import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { Role } from '@prisma/client';

export const authorize = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' }
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
      });
      return;
    }

    next();
  };
};
