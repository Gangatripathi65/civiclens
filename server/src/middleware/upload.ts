import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/errors.js';

const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.UPLOAD_MAX_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMime.includes(file.mimetype)) {
      cb(new ApiError(400, 'Unsupported image type'));
      return;
    }
    cb(null, true);
  }
});
