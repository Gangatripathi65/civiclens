import { AuditLog } from '../models/AuditLog.js';

export const createAuditLog = async (
  actor: string,
  action: string,
  targetType: string,
  targetId?: string,
  details?: Record<string, unknown>
) => {
  await AuditLog.create({ actor, action, targetType, targetId, details });
};
