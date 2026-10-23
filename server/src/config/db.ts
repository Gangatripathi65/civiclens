import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export const connectDb = async () => {
  await mongoose.connect(env.MONGODB_URI);
  logger.info('MongoDB connected');
};

export const disconnectDb = async () => {
  await mongoose.disconnect();
};
