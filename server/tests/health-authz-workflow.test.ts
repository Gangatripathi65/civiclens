import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import { requireAuth, requireRole } from '../src/middleware/auth.js';
import { env } from '../src/config/env.js';
import { canTransition } from '../src/utils/workflow.js';

const mockNext = vi.fn();

describe('health, auth middleware, and workflow guards', () => {
  it('returns health endpoint status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('allows valid JWT and blocks invalid role', () => {
    const token = jwt.sign({ id: 'u1', role: 'citizen', email: 'a@b.com' }, env.JWT_SECRET);
    const req: any = { cookies: { token } };
    requireAuth(req, {} as any, mockNext);
    expect(req.user.id).toBe('u1');

    const roleNext = vi.fn();
    requireRole('admin')(req, {} as any, roleNext);
    expect(roleNext.mock.calls[0][0].statusCode).toBe(403);
  });

  it('validates status transition rules', () => {
    expect(canTransition('Reported', 'Under Review')).toBe(true);
    expect(canTransition('Reported', 'Resolved')).toBe(false);
    expect(canTransition('Resolved', 'Reopened')).toBe(true);
  });
});
