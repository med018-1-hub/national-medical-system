import { Request, Response, NextFunction } from 'express';
import { getEmergencyProfileByNationalId, getEmergencyProfileByUserId, upsertEmergencyProfile } from '../services/emergencyService';
import { AuthRequest } from '../middleware/authenticate';
import { CustomError } from '../middleware/errorHandler';

export const getByNationalId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { nationalId } = req.params;
    if (!nationalId) {
      const error = new Error('National ID is required') as CustomError;
      error.statusCode = 400;
      error.code = 'MISSING_PARAM';
      throw error;
    }

    const profile = await getEmergencyProfileByNationalId(nationalId);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      const error = new Error('User not authenticated') as CustomError;
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    const profile = await getEmergencyProfileByUserId(req.user.userId);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      const error = new Error('User not authenticated') as CustomError;
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    const profile = await upsertEmergencyProfile(req.user.userId, req.body);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const updateById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params; // this is the user's ID
    if (!id) {
      const error = new Error('User ID is required') as CustomError;
      error.statusCode = 400;
      error.code = 'MISSING_PARAM';
      throw error;
    }

    const profile = await upsertEmergencyProfile(id, req.body);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};
