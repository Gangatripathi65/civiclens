import mongoose, { Schema, Types } from 'mongoose';

interface IAuditLog {
  actor: Types.ObjectId;
  action: string;
  targetType: string;
  targetId?: Types.ObjectId;
  details?: Record<string, unknown>;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, index: true },
    targetType: { type: String, required: true },
    targetId: { type: Schema.Types.ObjectId },
    details: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
