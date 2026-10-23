import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/errors.js';

export const notFound = (_req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(404, 'Resource not found'));
};

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      details: err.issues
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  return res.status(500).json({ message: 'Internal server error' });
};
