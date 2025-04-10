// server/models/User.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ICourse } from './Course';
import { IRound } from './Round';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name?: string;
  savedCourses: mongoose.Types.ObjectId[] | ICourse[];
  rounds: mongoose.Types.ObjectId[] | IRound[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toObject(): any;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: String,
  savedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  rounds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Round'
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;