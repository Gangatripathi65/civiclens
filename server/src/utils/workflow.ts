import { ComplaintStatus } from '@civiclens/shared';

export const validTransitions: Record<ComplaintStatus, ComplaintStatus[]> = {
  Reported: ['Under Review', 'Rejected'],
  'Under Review': ['Assigned', 'Rejected'],
  Assigned: ['In Progress', 'Rejected'],
  'In Progress': ['Resolved', 'Rejected'],
  Resolved: ['Reopened'],
  Rejected: ['Reopened'],
  Reopened: ['Under Review', 'Assigned']
};

export const canTransition = (from: ComplaintStatus, to: ComplaintStatus) => {
  return validTransitions[from].includes(to);
};

export const toPublicComplaintId = () => `CL-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
