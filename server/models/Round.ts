// server/models/Round.ts
import mongoose, { Schema } from 'mongoose';
import { Round } from 'shared';
import CourseModel from './Course';

export interface IRound extends Omit<Round, '_id' | 'course' | 'addedBy'> {
  _id: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  addedBy: mongoose.Types.ObjectId;
}

const roundSchema = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  tees: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  putts: {
    type: Number,
    required: true
  },
  fairways: {
    type: Number,
    required: true
  },
  greens: {
    type: Number,
    required: true
  },
  notes: {
    type: String
  },
  differential: {
    type: Number,
    required: true
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Add indexes for common queries
roundSchema.index({ addedBy: 1, date: -1 });
roundSchema.index({ course: 1, addedBy: 1 });

// Pre-save middleware to calculate differential
roundSchema.pre('save', async function(next) {
  if (this.isModified('score') || this.isModified('course') || this.isModified('tees')) {
    try {
      const course = await CourseModel.findById(this.course);
      if (!course) {
        throw new Error('Course not found');
      }

      const tee = course.tees.find(t => t.name === this.tees);
      if (!tee) {
        throw new Error('Tee not found');
      }

      // Calculate differential using USGA formula
      this.differential = ((this.score - tee.rating) * 113) / tee.slope;
      // Round to one decimal place
      this.differential = Math.round(this.differential * 10) / 10;
    } catch (error) {
      next(error as Error);
      return;
    }
  }
  next();
});

const Round = mongoose.model<IRound>('Round', roundSchema);
export default Round;