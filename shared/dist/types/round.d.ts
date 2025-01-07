import { BaseDocument } from './base';
export interface Round extends BaseDocument {
    course: string;
    date: Date | string;
    tees: string;
    score: number;
    putts: number;
    fairways: number;
    notes?: string;
    addedBy: string;
}
export interface CreateRoundInput {
    course: string;
    date: Date | string;
    tees: string;
    score: number;
    putts: number;
    fairways: number;
    notes?: string;
    addedBy: string;
}
