import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './testUtils.js';
import { User } from '../src/models/User.js';

beforeAll(connectTestDb);
afterAll(disconnectTestDb);
beforeEach(clearTestDb);

const login = async (email: string, password: string) => {
  const response = await request(app).post('/api/auth/login').send({ email, password });
  return response.headers['set-cookie'];
};

describe('complaint ownership and status transitions', () => {
  it('allows creator to view complaint and blocks other citizen', async () => {
    await User.create([
      { name: 'Citizen One', email: 'c1@example.com', password: 'Password123!', role: 'citizen' },
      { name: 'Citizen Two', email: 'c2@example.com', password: 'Password123!', role: 'citizen' },
      { name: 'Admin', email: 'admin@example.com', password: 'Password123!', role: 'admin' }
    ]);

    const cookie1 = await login('c1@example.com', 'Password123!');
    const createRes = await request(app)
      .post('/api/complaints')
      .set('Cookie', cookie1)
      .send({
        title: 'Broken road lane',
        description: 'The road has a deep pothole and vehicles are swerving.',
        latitude: 17.4,
        longitude: 78.48,
        severity: 'high'
      });

    expect(createRes.status).toBe(201);
    const id = createRes.body.complaint._id;

    const ownRead = await request(app).get(`/api/complaints/${id}`).set('Cookie', cookie1);
    expect(ownRead.status).toBe(200);

    const cookie2 = await login('c2@example.com', 'Password123!');
    const blockedRead = await request(app).get(`/api/complaints/${id}`).set('Cookie', cookie2);
    expect(blockedRead.status).toBe(403);
  });

  it('enforces valid status transitions for admins', async () => {
    await User.create([
      { name: 'Citizen One', email: 'citizen@example.com', password: 'Password123!', role: 'citizen' },
      { name: 'Admin', email: 'admin@example.com', password: 'Password123!', role: 'admin' }
    ]);

    const citizenCookie = await login('citizen@example.com', 'Password123!');
    const createRes = await request(app)
      .post('/api/complaints')
      .set('Cookie', citizenCookie)
      .send({
        title: 'Streetlight outage',
        description: 'The entire lane is dark and unsafe at night.',
        latitude: 17.39,
        longitude: 78.47,
        severity: 'critical'
      });
    const id = createRes.body.complaint._id;

    const adminCookie = await login('admin@example.com', 'Password123!');
    const invalid = await request(app)
      .patch(`/api/complaints/${id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'Resolved' });
    expect(invalid.status).toBe(400);

    const valid = await request(app)
      .patch(`/api/complaints/${id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'Under Review' });
    expect(valid.status).toBe(200);
    expect(valid.body.status).toBe('Under Review');
  });

  it('rejects unsupported upload mime types', async () => {
    await User.create({ name: 'Citizen', email: 'mime@example.com', password: 'Password123!', role: 'citizen' });
    const cookie = await login('mime@example.com', 'Password123!');

    const res = await request(app)
      .post('/api/complaints')
      .set('Cookie', cookie)
      .field('title', 'Water leakage')
      .field('description', 'Continuous leakage on the street since yesterday.')
      .field('latitude', '17.38')
      .field('longitude', '78.49')
      .field('severity', 'medium')
      .attach('images', Buffer.from('not-an-image'), { filename: 'note.txt', contentType: 'text/plain' });

    expect(res.status).toBe(400);
  });
});
