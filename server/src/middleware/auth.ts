import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthRequest } from '../types.js';
import { ApiError } from '../utils/errors.js';

interface JwtPayload {
  id: string;
  role: 'citizen' | 'admin';
  email: string;
}

export const requireAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const token = req.cookies?.token;
  if (!token) {
    return next(new ApiError(401, 'Authentication required'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = { id: payload.id, role: payload.role, email: payload.email };
    return next();
  } catch {
    return next(new ApiError(401, 'Invalid token'));
  }
};

export const requireRole = (role: 'admin' | 'citizen') => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required'));
    if (req.user.role !== role) return next(new ApiError(403, 'Forbidden'));
    return next();
  };
};
