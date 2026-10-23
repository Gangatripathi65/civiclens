import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './testUtils.js';

beforeAll(connectTestDb);
afterAll(disconnectTestDb);
beforeEach(clearTestDb);

describe('health and auth', () => {
  it('returns health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('registers citizen and persists auth cookie', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      locality: 'Central'
    });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe('citizen');
    expect(res.headers['set-cookie']).toBeDefined();
  });
});
