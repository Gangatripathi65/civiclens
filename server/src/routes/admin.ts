import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Complaint } from '../models/Complaint.js';
import { getAdminStats } from '../services/analyticsService.js';
import { hotspotInsights } from '../services/aiService.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/dashboard', async (_req, res, next) => {
  try {
    const stats = await getAdminStats();
    const hotspots = await hotspotInsights();
    const overdue = await Complaint.find({
      status: { $in: ['Reported', 'Under Review', 'Assigned', 'In Progress', 'Reopened'] },
      createdAt: { $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
      .select('publicId title status locality priorityScore createdAt')
      .limit(20);

    res.json({ stats, hotspots, overdue });
  } catch (error) {
    next(error);
  }
});

router.get('/complaints', async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Math.min(Number(req.query.limit ?? 20), 100);
    const query: Record<string, unknown> = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.category) query.category = req.query.category;
    if (req.query.locality) query.locality = { $regex: String(req.query.locality), $options: 'i' };
    if (req.query.search) query.$or = [
      { title: { $regex: String(req.query.search), $options: 'i' } },
      { publicId: { $regex: String(req.query.search), $options: 'i' } }
    ];

    const [items, total] = await Promise.all([
      Complaint.find(query).sort({ priorityScore: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Complaint.countDocuments(query)
    ]);

    res.json({ items, pagination: { page, limit, total } });
  } catch (error) {
    next(error);
  }
});

router.get('/analytics', async (req, res, next) => {
  try {
    const start = req.query.start ? new Date(String(req.query.start)) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = req.query.end ? new Date(String(req.query.end)) : new Date();
    const match: Record<string, unknown> = { createdAt: { $gte: start, $lte: end } };
    if (req.query.category) match.category = req.query.category;
    if (req.query.status) match.status = req.query.status;
    if (req.query.locality) match.locality = req.query.locality;

    const volume = await Complaint.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const byPriority = await Complaint.aggregate([
      { $match: match },
      { $bucket: { groupBy: '$priorityScore', boundaries: [0, 35, 65, 85, 101], default: 'other', output: { count: { $sum: 1 } } } }
    ]);

    res.json({
      volume,
      byPriority,
      exportNotice: 'CSV exports should not include personal contact information.'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/activity', async (_req, res, next) => {
  try {
    const [notifications, auditLogs] = await Promise.all([
      Notification.find().sort({ createdAt: -1 }).limit(50),
      AuditLog.find().sort({ createdAt: -1 }).limit(50)
    ]);
    res.json({ notifications, auditLogs });
  } catch (error) {
    next(error);
  }
});

export default router;
