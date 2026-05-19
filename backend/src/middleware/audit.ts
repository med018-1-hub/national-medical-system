import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import prisma from '../lib/prisma';

/**
 * Middleware to asynchronously log user actions for audit purposes.
 * It does not block the request lifecycle.
 * 
 * @param action Description of the action (e.g., 'UPDATE', 'DELETE')
 * @param entity The entity being affected (e.g., 'EmergencyProfile', 'BloodInventory')
 */
export const auditLog = (action: string, entity: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // Continue with the request immediately to avoid performance hits
    next();

    // Perform logging in the background
    if (req.user) {
      try {
        const entityId = req.params.id || req.params.nationalId || req.body.id || null;
        const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

        await prisma.auditLog.create({
          data: {
            userId: req.user.userId,
            action,
            entity,
            entityId,
            ipAddress,
          }
        });
      } catch (error) {
        console.error('[Audit Log Error]: Failed to create audit log', error);
      }
    }
  };
};
