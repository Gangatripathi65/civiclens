import { Complaint } from '../models/Complaint.js';
import { complaintCategories, SeverityLevel } from '@civiclens/shared';

const categoryKeywords: Record<string, (typeof complaintCategories)[number]> = {
  pothole: 'roads',
  road: 'roads',
  garbage: 'sanitation',
  waste: 'sanitation',
  light: 'streetlights',
  drainage: 'drainage',
  waterlogging: 'drainage',
  water: 'water_supply',
  safety: 'public_safety',
  theft: 'public_safety'
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const toWordSet = (value: string) => new Set(normalize(value).split(' ').filter(Boolean));

export const classifyIssue = (title: string, description: string) => {
  const merged = normalize(`${title} ${description}`);
  for (const [keyword, category] of Object.entries(categoryKeywords)) {
    if (merged.includes(keyword)) {
      return { category, confidence: 0.78, source: 'fallback-rule-based' as const };
    }
  }
  return { category: 'other' as const, confidence: 0.5, source: 'fallback-rule-based' as const };
};

export const summarizeComplaint = (title: string, description: string) => {
  const normalized = `${title.trim()}: ${description.trim()}`;
  return normalized.length <= 180 ? normalized : `${normalized.slice(0, 177)}...`;
};

export const scorePriority = (severity: SeverityLevel, category: string, createdAt?: Date) => {
  const severityScore: Record<SeverityLevel, number> = { low: 25, medium: 50, high: 75, critical: 90 };
  const safetyBoost = category === 'public_safety' ? 8 : 0;
  const ageHours = createdAt ? Math.max(0, (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)) : 0;
  const ageBoost = Math.min(10, Math.floor(ageHours / 24));
  const score = Math.min(100, severityScore[severity] + safetyBoost + ageBoost);
  const explanation = `Severity ${severity} baseline with ${safetyBoost > 0 ? 'public safety' : 'standard'} weighting and age factor ${ageBoost}.`;
  return { score, explanation, source: 'fallback-rule-based' as const };
};

export const detectDuplicates = async (
  complaintId: string,
  title: string,
  description: string,
  category: string,
  coordinates: [number, number]
) => {
  const [lng, lat] = coordinates;
  const windowStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const nearby = await Complaint.find({
    _id: { $ne: complaintId },
    category,
    createdAt: { $gte: windowStart },
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: 1000
      }
    }
  })
    .limit(10)
    .lean();

  const sourceSet = toWordSet(`${title} ${description}`);
  return nearby
    .map((candidate) => {
      const candidateSet = toWordSet(`${candidate.title} ${candidate.description}`);
      const intersection = [...sourceSet].filter((word) => candidateSet.has(word)).length;
      const union = new Set([...sourceSet, ...candidateSet]).size || 1;
      const similarity = intersection / union;
      return {
        complaintId: candidate._id.toString(),
        publicId: candidate.publicId,
        score: Number(similarity.toFixed(2)),
        explanation: `Text similarity ${similarity.toFixed(2)} with matching category and nearby coordinates.`
      };
    })
    .sort((a, b) => b.score - a.score);
};

export const hotspotInsights = async () => {
  const hotspots = await Complaint.aggregate([
    { $match: { status: { $ne: 'Resolved' } } },
    { $group: { _id: '$locality', count: { $sum: 1 }, avgPriority: { $avg: '$priorityScore' } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  return hotspots.map((hotspot) => ({
    locality: hotspot._id || 'Unknown locality',
    unresolvedComplaints: hotspot.count,
    averagePriority: Number((hotspot.avgPriority ?? 0).toFixed(1)),
    insight: `Area has ${hotspot.count} unresolved complaints requiring intervention.`
  }));
};
