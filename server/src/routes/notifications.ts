import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { AuthRequest } from '../types.js';
import { Notification } from '../models/Notification.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user!.id }).sort({ createdAt: -1 }).limit(100);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', async (req: AuthRequest, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user!.id },
      { $set: { read: true } },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    next(error);
  }
});

export default router;
