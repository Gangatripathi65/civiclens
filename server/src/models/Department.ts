import mongoose, { Schema } from 'mongoose';

export interface IDepartment {
  name: string;
  code: string;
  description?: string;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String }
  },
  { timestamps: true }
);

export const Department = mongoose.model<IDepartment>('Department', departmentSchema);
