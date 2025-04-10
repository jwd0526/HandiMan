import { BaseDocument } from './base';
import { Course } from './course';
export interface Round extends BaseDocument {
    course: Course;
    date: Date | string;
    tees: string;
    score: number;
    putts: number;
    fairways: number;
    greens: number;
    notes?: string;
    differential: number;
    addedBy: string;
}
export interface CreateRoundInput {
    course: Course;
    date: Date | string;
    tees: string;
    score: number;
    putts: number;
    fairways: number;
    greens: number;
    notes?: string;
    addedBy: string;
}
