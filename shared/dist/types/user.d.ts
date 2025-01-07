import { BaseDocument } from './base';
export interface User extends BaseDocument {
    email: string;
    name?: string;
}
export interface CreateUserInput {
    email: string;
    password: string;
    name?: string;
}
