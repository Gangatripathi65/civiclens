import mongoose, { Schema, Types } from 'mongoose';

interface IDuplicateRelationship {
  complaint: Types.ObjectId;
  potentialDuplicate: Types.ObjectId;
  score: number;
  explanation: string;
}

const duplicateRelationshipSchema = new Schema<IDuplicateRelationship>(
  {
    complaint: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true, index: true },
    potentialDuplicate: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true, index: true },
    score: { type: Number, min: 0, max: 1, required: true },
    explanation: { type: String, required: true }
  },
  { timestamps: true }
);

duplicateRelationshipSchema.index({ complaint: 1, potentialDuplicate: 1 }, { unique: true });

export const DuplicateRelationship = mongoose.model<IDuplicateRelationship>('DuplicateRelationship', duplicateRelationshipSchema);
