// shared/src/types/goal.ts
import { BaseDocument } from './base';

export interface Goal extends BaseDocument {
  name: string;
  targetValue: number;
  currentValue?: number;
  targetDate?: Date | string; // Allow both types for flexibility
  category: 'handicap' | 'scoring' | 'fairways' | 'greens' | 'putts' | 'custom';
  achieved: boolean;
  completedAt?: Date | string; // Allow both types for flexibility
  description?: string;
  addedBy: string;
}

export interface CreateGoalInput {
  name: string;
  targetValue: number;
  targetDate?: Date | string; // Allow both types for flexibility
  currentValue?: number;
  category: 'handicap' | 'scoring' | 'fairways' | 'greens' | 'putts' | 'custom';
  description?: string;
}