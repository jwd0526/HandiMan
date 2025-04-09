// src/utils/validation.ts
type ValidationRule<T> = {
    validate: (value: any, formValues: T) => boolean;
    message: string;
  };
  
  export const required = <T extends Record<string, any>>(message = 'This field is required'): ValidationRule<T> => ({
    validate: (value: any) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return true;
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined;
    },
    message
  });
  
  export const email = <T extends Record<string, any>>(message = 'Please enter a valid email'): ValidationRule<T> => ({
    validate: (value: any) => {
      if (typeof value !== 'string') return false;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    message
  });
  
  export const minLength = <T extends Record<string, any>>(
    length: number,
    message = `Must be at least ${length} characters`
  ): ValidationRule<T> => ({
    validate: (value: any) => {
      if (typeof value !== 'string') return false;
      return value.length >= length;
    },
    message
  });
  
  export const matches = <T extends Record<string, any>>(
    pattern: RegExp,
    message: string
  ): ValidationRule<T> => ({
    validate: (value: any) => {
      if (typeof value !== 'string') return false;
      return pattern.test(value);
    },
    message
  });
  
  export const matchesField = <T extends Record<string, any>>(
    fieldToMatch: keyof T,
    message: string
  ): ValidationRule<T> => ({
    validate: (value: any, formValues: T) => value === formValues[fieldToMatch],
    message
  });