import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, getUserProfile } from '../services/authService';
import { AuthRequest } from '../middleware/authenticate';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error); // Pass to errorHandler
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await loginUser(req.body);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error); // Pass to errorHandler
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } 
      });
      return;
    }
    const result = await getUserProfile(req.user.userId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error); // Pass to errorHandler
  }
};
