import mongoose, { Schema, Types } from 'mongoose';
import { complaintStatuses } from '@civiclens/shared';

interface IComplaintStatusHistory {
  complaint: Types.ObjectId;
  previousStatus: (typeof complaintStatuses)[number];
  newStatus: (typeof complaintStatuses)[number];
  changedBy: Types.ObjectId;
  publicNote?: string;
  internalNote?: string;
}

const complaintStatusHistorySchema = new Schema<IComplaintStatusHistory>(
  {
    complaint: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true, index: true },
    previousStatus: { type: String, enum: complaintStatuses, required: true },
    newStatus: { type: String, enum: complaintStatuses, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    publicNote: { type: String },
    internalNote: { type: String }
  },
  { timestamps: true }
);

export const ComplaintStatusHistory = mongoose.model<IComplaintStatusHistory>('ComplaintStatusHistory', complaintStatusHistorySchema);
