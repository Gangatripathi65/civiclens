import { Request } from 'express';

export interface AuthUser {
  id: string;
  role: 'citizen' | 'admin';
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
