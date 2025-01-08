import { BaseDocument } from './base';
export interface Round extends BaseDocument {
    course: string;
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
    course: string;
    date: Date | string;
    tees: string;
    score: number;
    putts: number;
    fairways: number;
    greens: number;
    notes?: string;
    addedBy: string;
}
