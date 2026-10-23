import mongoose, { Schema, Types } from 'mongoose';
import { complaintCategories, complaintStatuses, severityLevels } from '@civiclens/shared';

export interface IComplaint {
  publicId: string;
  creator: Types.ObjectId;
  title: string;
  description: string;
  aiSummary?: string;
  category: (typeof complaintCategories)[number];
  categoryConfidence?: number;
  imageRefs: string[];
  location: { type: 'Point'; coordinates: [number, number] };
  address?: string;
  locality?: string;
  severity: (typeof severityLevels)[number];
  priorityScore: number;
  priorityExplanation: string;
  status: (typeof complaintStatuses)[number];
  assignedDepartment?: Types.ObjectId;
  assignedOfficer?: Types.ObjectId;
  additionalNotes?: string;
  resolutionNotes?: string;
  isDemoData: boolean;
  reopenedCount: number;
}

const complaintSchema = new Schema<IComplaint>(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    aiSummary: { type: String },
    category: { type: String, enum: complaintCategories, default: 'other', index: true },
    categoryConfidence: { type: Number, min: 0, max: 1, default: 0 },
    imageRefs: { type: [String], default: [] },
    location: {
      type: { type: String, enum: ['Point'], required: true, default: 'Point' },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (coords: number[]) => coords.length === 2 && coords[0] >= -180 && coords[0] <= 180 && coords[1] >= -90 && coords[1] <= 90,
          message: 'Invalid coordinates'
        }
      }
    },
    address: { type: String },
    locality: { type: String, index: true },
    severity: { type: String, enum: severityLevels, default: 'medium', index: true },
    priorityScore: { type: Number, default: 50, index: true },
    priorityExplanation: { type: String, default: 'Default priority while awaiting assessment.' },
    status: { type: String, enum: complaintStatuses, default: 'Reported', index: true },
    assignedDepartment: { type: Schema.Types.ObjectId, ref: 'Department' },
    assignedOfficer: { type: Schema.Types.ObjectId, ref: 'User' },
    additionalNotes: { type: String },
    resolutionNotes: { type: String },
    isDemoData: { type: Boolean, default: false, index: true },
    reopenedCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

complaintSchema.index({ location: '2dsphere' });
complaintSchema.index({ status: 1, category: 1, severity: 1, createdAt: -1 });

export const Complaint = mongoose.model<IComplaint>('Complaint', complaintSchema);
