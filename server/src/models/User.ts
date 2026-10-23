import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'citizen' | 'admin';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  locality?: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ['citizen', 'admin'], default: 'citizen', index: true },
    locality: { type: String, trim: true }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(password: string) {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
