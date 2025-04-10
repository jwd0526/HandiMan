import { BaseDocument } from './base';
import { Round } from './round';
import { Course } from './course';
export interface User extends BaseDocument {
    email: string;
    name?: string;
    savedCourses: Course[];
    rounds: Round[];
}
export interface CreateUserInput {
    email: string;
    password: string;
    name?: string;
}
