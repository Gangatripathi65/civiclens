import mongoose, { Schema, Types } from 'mongoose';

interface IResolutionEvidence {
  complaint: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  fileRef: string;
  note?: string;
}

const resolutionEvidenceSchema = new Schema<IResolutionEvidence>(
  {
    complaint: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileRef: { type: String, required: true },
    note: { type: String }
  },
  { timestamps: true }
);

export const ResolutionEvidence = mongoose.model<IResolutionEvidence>('ResolutionEvidence', resolutionEvidenceSchema);
