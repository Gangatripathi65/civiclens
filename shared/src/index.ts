export const complaintCategories = [
  'roads',
  'sanitation',
  'streetlights',
  'drainage',
  'water_supply',
  'public_safety',
  'other'
] as const;

export const complaintStatuses = [
  'Reported',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected',
  'Reopened'
] as const;

export type ComplaintCategory = (typeof complaintCategories)[number];
export type ComplaintStatus = (typeof complaintStatuses)[number];

export const severityLevels = ['low', 'medium', 'high', 'critical'] as const;
export type SeverityLevel = (typeof severityLevels)[number];

export interface LocationPoint {
  type: 'Point';
  coordinates: [number, number];
}
