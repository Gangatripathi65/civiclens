import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/civiclens'),
  JWT_SECRET: z.string().min(16).default('change-me-in-production-please'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(200),
  UPLOAD_MAX_MB: z.coerce.number().default(5),
  AI_PROVIDER: z.string().default('rule-based'),
  AI_API_KEY: z.string().optional(),
  EMAIL_PROVIDER: z.string().optional(),
  EMAIL_API_KEY: z.string().optional()
});

export const env = envSchema.parse(process.env);
