// shared/src/types/base.ts
export interface BaseDocument {
  _id: string;
  createdAt: Date | string; // Allow both types for flexibility between server and client
  updatedAt: Date | string; // Allow both types for flexibility between server and client
}
