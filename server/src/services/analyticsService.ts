import { Complaint } from '../models/Complaint.js';

export const getAdminStats = async () => {
  const [total, pending, highPriority, resolved] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: { $in: ['Reported', 'Under Review', 'Assigned', 'In Progress', 'Reopened'] } }),
    Complaint.countDocuments({ priorityScore: { $gte: 75 } }),
    Complaint.countDocuments({ status: 'Resolved' })
  ]);

  const resolutionTime = await Complaint.aggregate([
    { $match: { status: 'Resolved' } },
    {
      $project: {
        hours: {
          $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 1000 * 60 * 60]
        }
      }
    },
    { $group: { _id: null, avgHours: { $avg: '$hours' } } }
  ]);

  const byCategory = await Complaint.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const byLocality = await Complaint.aggregate([
    { $group: { _id: '$locality', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 }
  ]);

  return {
    total,
    pending,
    highPriority,
    resolved,
    averageResolutionHours: Number((resolutionTime[0]?.avgHours ?? 0).toFixed(1)),
    byCategory,
    byLocality
  };
};
