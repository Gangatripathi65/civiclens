import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { upload } from '../src/middleware/upload.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

const app = express();
app.post('/upload', upload.single('image'), (_req, res) => res.status(200).json({ ok: true }));
app.use(errorHandler as any);

describe('upload validation', () => {
  it('rejects unsupported mime types', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('image', Buffer.from('not-image'), { filename: 'notes.txt', contentType: 'text/plain' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Unsupported image type');
  });
});
