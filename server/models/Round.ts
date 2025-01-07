// server/models/Round.ts
import mongoose from 'mongoose';
import { Round } from 'shared';

export interface IRound extends Omit<Round, '_id' | 'course' | 'addedBy'> {
  _id: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  addedBy: mongoose.Types.ObjectId;
  calculateDifferential(): Promise<number>;
}

const roundSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
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
  notes: {
    type: String
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Add indexes for common queries
roundSchema.index({ addedBy: 1, date: -1 });
roundSchema.index({ course: 1, addedBy: 1 });

// Calculate differential for handicap index
roundSchema.methods.calculateDifferential = async function(): Promise<number> {
  const course = await mongoose.model('Course').findById(this.course);
  if (!course) throw new Error('Course not found');
  
  const tee = course.tees.find((t: { name: string; }) => t.name === this.tees);
  if (!tee) throw new Error('Tee not found');
  
  return ((this.score - tee.rating) * 113) / tee.slope;
};

const Round = mongoose.model<IRound>('Round', roundSchema);
export default Round;