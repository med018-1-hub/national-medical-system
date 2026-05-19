import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error for debugging purposes (can be expanded to use a proper logger)
  console.error(`[ErrorHandler] ${err.name}: ${err.message}`);

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = statusCode === 500 && process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred' 
    : err.message || 'Something went wrong';

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message
    }
  });
};
