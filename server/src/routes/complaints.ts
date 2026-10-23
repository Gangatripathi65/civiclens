import { Router } from 'express';
import { z } from 'zod';
import { complaintCategories, complaintStatuses, severityLevels } from '@civiclens/shared';
import { Complaint } from '../models/Complaint.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AuthRequest } from '../types.js';
import { ApiError } from '../utils/errors.js';
import { canTransition, toPublicComplaintId } from '../utils/workflow.js';
import { classifyIssue, detectDuplicates, scorePriority, summarizeComplaint } from '../services/aiService.js';
import { ComplaintStatusHistory } from '../models/ComplaintStatusHistory.js';
import { Assignment } from '../models/Assignment.js';
import { createNotification } from '../services/notificationService.js';
import { createAuditLog } from '../services/auditService.js';
import { upload } from '../middleware/upload.js';

const router = Router();
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createSchema = z.object({
  title: z.string().min(4).max(160),
  description: z.string().min(10).max(2000),
  category: z.enum(complaintCategories).optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  address: z.string().optional(),
  locality: z.string().optional(),
  severity: z.enum(severityLevels),
  additionalNotes: z.string().max(1000).optional()
});

router.post('/', requireAuth, upload.array('images', 3), async (req: AuthRequest, res, next) => {
  try {
    const payload = createSchema.parse(req.body);
    const aiClassification = classifyIssue(payload.title, payload.description);
    const category = payload.category ?? aiClassification.category;
    const priority = scorePriority(payload.severity, category);
    const imageRefs = (req.files as Express.Multer.File[] | undefined)?.map((file) => `memory://${file.originalname}`) ?? [];

    const complaint = await Complaint.create({
      publicId: toPublicComplaintId(),
      creator: req.user!.id,
      title: payload.title,
      description: payload.description,
      aiSummary: summarizeComplaint(payload.title, payload.description),
      category,
      categoryConfidence: aiClassification.confidence,
      imageRefs,
      location: { type: 'Point', coordinates: [payload.longitude, payload.latitude] },
      address: payload.address,
      locality: payload.locality,
      severity: payload.severity,
      priorityScore: priority.score,
      priorityExplanation: `${priority.explanation} (${priority.source})`,
      status: 'Reported',
      additionalNotes: payload.additionalNotes
    });

    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      previousStatus: 'Reported',
      newStatus: 'Reported',
      changedBy: req.user!.id,
      publicNote: 'Complaint submitted'
    });

    await createNotification({
      user: req.user!.id,
      complaint: complaint.id,
      type: 'submission',
      message: `Complaint ${complaint.publicId} submitted successfully.`
    });

    const duplicates = await detectDuplicates(complaint.id, payload.title, payload.description, category, [payload.longitude, payload.latitude]);

    res.status(201).json({
      complaint,
      ai: {
        classificationSource: aiClassification.source,
        prioritySource: priority.source,
        duplicates
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Math.min(Number(req.query.limit ?? 10), 50);
    const query: Record<string, unknown> = {};
    const status = req.query.status ? complaintStatuses.find((s) => s === req.query.status) : undefined;
    const category = req.query.category ? complaintCategories.find((c) => c === req.query.category) : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 80) : undefined;

    if (req.user!.role === 'citizen') query.creator = req.user!.id;
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) query.title = { $regex: escapeRegex(search), $options: 'i' };

    const [items, total] = await Promise.all([
      Complaint.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Complaint.countDocuments(query)
    ]);

    res.json({ items, pagination: { page, limit, total } });
  } catch (error) {
    next(error);
  }
});

router.get('/map', async (req, res, next) => {
  try {
    const filter: Record<string, unknown> = {};
    const status = req.query.status ? complaintStatuses.find((s) => s === req.query.status) : undefined;
    const category = req.query.category ? complaintCategories.find((c) => c === req.query.category) : undefined;
    if (status) filter.status = status;
    if (category) filter.category = category;
    const records = await Complaint.find(filter)
      .select('publicId title category severity status location locality isDemoData createdAt')
      .limit(500)
      .lean();

    const valid = records.filter((r) => Array.isArray(r.location?.coordinates) && r.location.coordinates.length === 2);
    res.json({ items: valid });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('assignedDepartment', 'name code')
      .populate('assignedOfficer', 'name email');
    if (!complaint) throw new ApiError(404, 'Complaint not found');
    if (req.user!.role !== 'admin' && complaint.creator.toString() !== req.user!.id) {
      throw new ApiError(403, 'Forbidden');
    }
    const history = await ComplaintStatusHistory.find({ complaint: complaint._id }).sort({ createdAt: 1 });
    res.json({ complaint, history });
  } catch (error) {
    next(error);
  }
});

const statusSchema = z.object({
  status: z.enum(complaintStatuses),
  publicNote: z.string().optional(),
  internalNote: z.string().optional(),
  resolutionNotes: z.string().optional()
});

router.patch('/:id/status', requireAuth, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const payload = statusSchema.parse(req.body);
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw new ApiError(404, 'Complaint not found');
    if (!canTransition(complaint.status as any, payload.status as any)) {
      throw new ApiError(400, `Invalid transition from ${complaint.status} to ${payload.status}`);
    }

    const previous = complaint.status;
    complaint.status = payload.status;
    if (payload.resolutionNotes) complaint.resolutionNotes = payload.resolutionNotes;
    if (payload.status === 'Reopened') complaint.reopenedCount += 1;
    await complaint.save();

    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      previousStatus: previous,
      newStatus: payload.status,
      changedBy: req.user!.id,
      publicNote: payload.publicNote,
      internalNote: payload.internalNote
    });

    await createNotification({
      user: complaint.creator.toString(),
      complaint: complaint.id,
      type: payload.status === 'Resolved' ? 'resolution' : payload.status === 'Reopened' ? 'reopen' : 'status_update',
      message: `Complaint ${complaint.publicId} is now ${payload.status}.`
    });

    await createAuditLog(req.user!.id, 'complaint.status.update', 'Complaint', complaint.id, {
      previous,
      next: payload.status
    });

    res.json(complaint);
  } catch (error) {
    next(error);
  }
});

const assignSchema = z.object({
  departmentId: z.string(),
  officerId: z.string().optional(),
  note: z.string().optional()
});

router.patch('/:id/assign', requireAuth, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const payload = assignSchema.parse(req.body);
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw new ApiError(404, 'Complaint not found');

    complaint.assignedDepartment = payload.departmentId as any;
    complaint.assignedOfficer = payload.officerId as any;
    if (canTransition(complaint.status as any, 'Assigned')) complaint.status = 'Assigned';
    await complaint.save();

    await Assignment.create({
      complaint: complaint._id,
      department: payload.departmentId,
      officer: payload.officerId,
      assignedBy: req.user!.id,
      note: payload.note
    });

    await createNotification({
      user: complaint.creator.toString(),
      complaint: complaint.id,
      type: 'assignment',
      message: `Complaint ${complaint.publicId} was assigned for action.`
    });

    await createAuditLog(req.user!.id, 'complaint.assignment', 'Complaint', complaint.id, payload as Record<string, unknown>);
    res.json(complaint);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/suggestions', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw new ApiError(404, 'Complaint not found');
    if (req.user!.role !== 'admin' && complaint.creator.toString() !== req.user!.id) throw new ApiError(403, 'Forbidden');

    const classification = classifyIssue(complaint.title, complaint.description);
    const priority = scorePriority(complaint.severity as any, complaint.category);

    res.json({
      classification,
      summary: summarizeComplaint(complaint.title, complaint.description),
      priority,
      fallbackNotice: 'Deterministic fallback logic active unless external AI provider is configured.'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
