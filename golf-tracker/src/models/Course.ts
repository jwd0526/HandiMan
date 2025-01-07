// server/models/Course.ts
import mongoose, { Schema } from 'mongoose';

const teeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  slope: {
    type: Number,
    required: true,
  },
  numberOfFairways: {
    type: Number,
    required: true,
  }
});

const courseSchema = new Schema({
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
    type: Schema.Types.ObjectId,
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

export interface ICourse extends mongoose.Document {
  name: string;
  location: {
    city?: string;
    state?: string;
    country?: string;
  };
  tees: Array<{
    name: string;
    rating: number;
    slope: number;
    numberOfFairways: number;
  }>;
  addedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const Course = mongoose.model<ICourse>('Course', courseSchema);
export default Course;