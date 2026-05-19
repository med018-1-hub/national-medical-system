import { Request, Response, NextFunction } from 'express';
import {
  getInventory,
  updateInventory,
  findDonors,
  recordDonation,
  createBloodRequest,
  getBloodRequests,
  updateRequestStatus
} from '../services/bloodService';
import { BloodType } from '@prisma/client';
import { CustomError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';

export const getBloodInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const inventory = await getInventory();
    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    next(error);
  }
};

export const updateBloodInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { hospitalId, bloodType } = req.params;
    const { units } = req.body;

    if (units === undefined || typeof units !== 'number') {
      const error = new Error('Valid units count is required') as CustomError;
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const updated = await updateInventory(hospitalId as string, bloodType as BloodType, units);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const getDonors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bloodType, region } = req.query;

    if (!bloodType) {
      const error = new Error('Blood type query parameter is required') as CustomError;
      error.statusCode = 400;
      error.code = 'MISSING_PARAM';
      throw error;
    }

    const donors = await findDonors(bloodType as BloodType, region as string | undefined);
    res.status(200).json({ success: true, data: donors });
  } catch (error) {
    next(error);
  }
};

export const donate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      const error = new Error('User ID is required to record donation') as CustomError;
      error.statusCode = 400;
      error.code = 'MISSING_PARAM';
      throw error;
    }

    const record = await recordDonation(userId);
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

export const requestBlood = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const request = await createBloodRequest(req.body);
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const getAllBloodRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.query;
    const requests = await getBloodRequests(typeof status === 'string' ? status : undefined);
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const patchRequestStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = typeof req.params['id'] === 'string' ? req.params['id'] : '';
    const { status } = req.body;

    if (!id || !status) {
      const error = new Error('Request ID and status are required') as CustomError;
      error.statusCode = 400;
      error.code = 'MISSING_PARAM';
      throw error;
    }

    const request = await updateRequestStatus(id, status as string);
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};
