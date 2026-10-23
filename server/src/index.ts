import 'dotenv/config';
import { app } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const start = async () => {
  await connectDb();
  app.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT}`);
  });
};

start().catch((error) => {
  logger.error(error);
  process.exit(1);
});
