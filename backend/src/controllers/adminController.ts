import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { getAllUsers, updateUserRole, getAuditLogs } from '../services/adminService';
import { CustomError } from '../middleware/errorHandler';

// ─── User Management ────────────────────────────────────────────────────────────

export const listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawPage = typeof req.query['page'] === 'string' ? parseInt(req.query['page'], 10) : undefined;
    const rawLimit = typeof req.query['limit'] === 'string' ? parseInt(req.query['limit'], 10) : undefined;
    const rawRole = typeof req.query['role'] === 'string' ? req.query['role'] : undefined;

    const page = rawPage !== undefined && !isNaN(rawPage) ? rawPage : undefined;
    const limit = rawLimit !== undefined && !isNaN(rawLimit) ? rawLimit : undefined;

    const validRoles = Object.values(Role);
    const role = rawRole !== undefined && validRoles.includes(rawRole as Role)
      ? (rawRole as Role)
      : undefined;

    const result = await getAllUsers({ page, limit, role });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const changeUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = typeof req.params['id'] === 'string' ? req.params['id'] : '';

    if (!userId) {
      const error = new Error('User ID is required') as CustomError;
      error.statusCode = 400;
      error.code = 'MISSING_PARAM';
      throw error;
    }

    const { role } = req.body as { role: string };

    if (!role) {
      const error = new Error('role is required in request body') as CustomError;
      error.statusCode = 400;
      error.code = 'MISSING_PARAM';
      throw error;
    }

    const validRoles = Object.values(Role);
    if (!validRoles.includes(role as Role)) {
      const error = new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`) as CustomError;
      error.statusCode = 400;
      error.code = 'INVALID_ROLE';
      throw error;
    }

    const updatedUser = await updateUserRole(userId, role as Role);
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

// ─── Audit Logs ─────────────────────────────────────────────────────────────────

export const listAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawPage = typeof req.query['page'] === 'string' ? parseInt(req.query['page'], 10) : undefined;
    const rawLimit = typeof req.query['limit'] === 'string' ? parseInt(req.query['limit'], 10) : undefined;

    const page = rawPage !== undefined && !isNaN(rawPage) ? rawPage : undefined;
    const limit = rawLimit !== undefined && !isNaN(rawLimit) ? rawLimit : undefined;

    const userId = typeof req.query['userId'] === 'string' ? req.query['userId'] : undefined;
    const entity = typeof req.query['entity'] === 'string' ? req.query['entity'] : undefined;

    const result = await getAuditLogs({ page, limit, userId, entity });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
