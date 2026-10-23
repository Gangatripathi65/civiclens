import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import authRouter from './routes/auth.js';
import complaintsRouter from './routes/complaints.js';
import adminRouter from './routes/admin.js';
import notificationsRouter from './routes/notifications.js';
import healthRouter from './routes/health.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export const app = express();

app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true
  })
);
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(compression());

app.get('/', (_req, res) => {
  res.json({
    name: 'CivicLens API',
    message: 'CivicLens backend is running',
    demoDataNotice: 'Records flagged isDemoData are demonstration-only and not real citizen reports.'
  });
});

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationsRouter);

app.use(notFound);
app.use(errorHandler);
