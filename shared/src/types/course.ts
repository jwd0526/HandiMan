// shared/src/types/course.ts
import { BaseDocument } from './base';

export interface Course extends BaseDocument {
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
  addedBy: string;
}