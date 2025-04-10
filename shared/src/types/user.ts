// shared/src/types/user.ts
import { BaseDocument } from './base';
import { Round } from './round';
import { Course } from './course';
import { Goal } from './goal';

export interface User extends BaseDocument {
  email: string;
  name?: string;
  savedCourses: Course[];
  rounds: Round[];
  goals?: Goal[];
}

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
}