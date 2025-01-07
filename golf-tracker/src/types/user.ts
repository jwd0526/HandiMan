// src/types/user.ts
export interface User {
  _id?: string;
  email: string;
  password: string; // Note: This should be hashed
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}
