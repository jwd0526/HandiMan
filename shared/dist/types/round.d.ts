import { BaseDocument } from './base';
export interface Round extends BaseDocument {
    course: string;
    date: Date;
    tees: string;
    score: number;
    putts: number;
    fairways: number;
    notes?: string;
    addedBy: string;
}
