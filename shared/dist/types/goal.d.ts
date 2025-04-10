import { BaseDocument } from './base';
export interface Goal extends BaseDocument {
    name: string;
    targetValue: number;
    currentValue?: number;
    targetDate?: Date | string;
    category: 'handicap' | 'scoring' | 'fairways' | 'greens' | 'putts' | 'custom';
    achieved: boolean;
    completedAt?: Date | string;
    description?: string;
    addedBy: string;
}
export interface CreateGoalInput {
    name: string;
    targetValue: number;
    targetDate?: Date | string;
    currentValue?: number;
    category: 'handicap' | 'scoring' | 'fairways' | 'greens' | 'putts' | 'custom';
    description?: string;
}
