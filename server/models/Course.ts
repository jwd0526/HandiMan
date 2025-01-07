// server/models/Course.ts
import mongoose from 'mongoose';
import { Course } from 'shared';

export interface ICourse extends Omit<Course, '_id' | 'addedBy'> {
  _id: mongoose.Types.ObjectId;
  addedBy: mongoose.Types.ObjectId;
}

const teeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  slope: {
    type: Number,
    required: true
  },
  numberOfFairways: {
    type: Number,
    required: true,
    min: 0,
    max: 18,
    validate: {
      validator: Number.isInteger,
      message: 'Number of fairways must be a whole number'
    }
  }
});

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    }
  },
  tees: [teeSchema],
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Make courses unique by name + location
courseSchema.index({ 
  name: 1, 
  'location.city': 1, 
  'location.state': 1,
  'location.country': 1
}, { 
  unique: true,
  collation: { locale: 'en', strength: 2 } // Case-insensitive uniqueness
});

const Course = mongoose.model<ICourse>('Course', courseSchema);
export default Course;