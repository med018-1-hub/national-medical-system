import { Request, Response, NextFunction } from 'express';
import { AlertSeverity } from '@prisma/client';
import {
  getAllCases,
  createCase,
  getAllCapacity,
  updateCapacity,
  getAllAlerts,
  createAlert,
  patchAlert
} from '../services/pandemicService';
import { CustomError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';

// ─── Pandemic Cases ─────────────────────────────────────────────────────────────

export const getCases = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cases = await getAllCases();
    res.status(200).json({ success: true, data: cases });
  } catch (error) {
    next(error);
  }
};

export const addCase = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      outbreakName,
      region,
      confirmedCount,
      activeCount,
      recoveredCount,
      deathCount
    } = req.body as {
      outbreakName: string;
      region: string;
      confirmedCount: number;
      activeCount: number;
      recoveredCount: number;
      deathCount: number;
    };

    if (!req.user) {
      const error = new Error('User not authenticated') as CustomError;
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    const newCase = await createCase({
      outbreakName,
      region,
      confirmedCount,
      activeCount,
      recoveredCount,
      deathCount,
      reportedBy: req.user.userId
    });

    res.status(201).json({ success: true, data: newCase });
  } catch (error) {
    next(error);
  }
};

// ─── Hospital Capacity ──────────────────────────────────────────────────────────

export const getCapacity = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const capacity = await getAllCapacity();
    res.status(200).json({ success: true, data: capacity });
  } catch (error) {
    next(error);
  }
};

export const updateHospitalCapacity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = typeof req.params['id'] === 'string' ? req.params['id'] : '';

    if (!id) {
      const error = new Error('Hospital ID is required') as CustomError;
      error.statusCode = 400;
      error.code = 'MISSING_PARAM';
      throw error;
    }

    const { totalBeds, occupiedBeds, icuTotal, icuOccupied } = req.body as {
      totalBeds?: number;
      occupiedBeds?: number;
      icuTotal?: number;
      icuOccupied?: number;
    };

    const updated = await updateCapacity(id, { totalBeds, occupiedBeds, icuTotal, icuOccupied });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// ─── Outbreak Alerts ────────────────────────────────────────────────────────────

export const getAlerts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const alerts = await getAllAlerts();
    res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};

export const addAlert = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      const error = new Error('User not authenticated') as CustomError;
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    const { title, description, severity, region } = req.body as {
      title: string;
      description: string;
      severity: AlertSeverity;
      region?: string;
    };

    const alert = await createAlert({
      title,
      description,
      severity,
      region,
      publishedBy: req.user.userId
    });

    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

export const updateAlert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = typeof req.params['id'] === 'string' ? req.params['id'] : '';

    if (!id) {
      const error = new Error('Alert ID is required') as CustomError;
      error.statusCode = 400;
      error.code = 'MISSING_PARAM';
      throw error;
    }

    const { title, description, severity, region, isActive } = req.body as {
      title?: string;
      description?: string;
      severity?: AlertSeverity;
      region?: string;
      isActive?: boolean;
    };

    const updated = await patchAlert(id, { title, description, severity, region, isActive });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
