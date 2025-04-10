// server/models/Goal.ts
import mongoose from 'mongoose';

export interface IGoal {
  _id: mongoose.Types.ObjectId;
  name: string;
  targetValue: number;
  currentValue?: number;
  targetDate?: Date;
  category: 'handicap' | 'scoring' | 'fairways' | 'greens' | 'putts' | 'custom';
  achieved: boolean;
  completedAt?: Date;
  description?: string;
  addedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  targetValue: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number
  },
  targetDate: {
    type: Date
  },
  category: {
    type: String,
    enum: ['handicap', 'scoring', 'fairways', 'greens', 'putts', 'custom'],
    required: true
  },
  achieved: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  description: {
    type: String,
    trim: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Goal = mongoose.model<IGoal>('Goal', goalSchema);

export default Goal;