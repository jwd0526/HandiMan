// server/models/Round.ts
import mongoose, { Schema } from 'mongoose';

const roundSchema = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  date: {
    type: Date,
    required: true
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

export interface IRound extends mongoose.Document {
  course: mongoose.Types.ObjectId;
  date: Date;
  tees: string;
  score: number;
  putts: number;
  fairways: number;
  notes?: string;
  addedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const Round = mongoose.model<IRound>('Round', roundSchema);
export default Round;