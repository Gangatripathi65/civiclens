import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { AuthRequest } from '../types.js';
import { ApiError } from '../utils/errors.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  locality: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const issueToken = (res: any, user: { _id: string; email: string; role: 'citizen' | 'admin' }) => {
  const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

router.post('/register', async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    const exists = await User.findOne({ email: payload.email });
    if (exists) throw new ApiError(409, 'Email already in use');

    const user = await User.create({ ...payload, role: 'citizen' });
    issueToken(res, user as any);
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const user = await User.findOne({ email: payload.email });
    if (!user || !(await (user as any).comparePassword(payload.password))) {
      throw new ApiError(401, 'Invalid credentials');
    }
    issueToken(res, user as any);
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.status(204).send();
});

router.get('/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) throw new ApiError(404, 'User not found');
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
