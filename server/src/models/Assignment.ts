import mongoose, { Schema, Types } from 'mongoose';

export interface IAssignment {
  complaint: Types.ObjectId;
  department: Types.ObjectId;
  officer?: Types.ObjectId;
  assignedBy: Types.ObjectId;
  note?: string;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    complaint: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true, index: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    officer: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String }
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);
