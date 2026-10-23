import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ message: 'Image required' });
    return;
  }

  res.json({
    storageProvider: 'local-memory-fallback',
    fileRef: `memory://${Date.now()}-${file.originalname}`,
    note: 'Configure cloud storage provider for persistent production uploads.'
  });
});

export default router;
