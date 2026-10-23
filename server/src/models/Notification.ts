import mongoose, { Schema, Types } from 'mongoose';

interface INotification {
  user: Types.ObjectId;
  complaint?: Types.ObjectId;
  type: 'submission' | 'assignment' | 'status_update' | 'info_request' | 'resolution' | 'reopen';
  message: string;
  read: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    complaint: { type: Schema.Types.ObjectId, ref: 'Complaint' },
    type: { type: String, enum: ['submission', 'assignment', 'status_update', 'info_request', 'resolution', 'reopen'], required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
