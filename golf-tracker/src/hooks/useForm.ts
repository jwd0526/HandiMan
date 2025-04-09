// src/hooks/useForm.ts
import { useState, useCallback } from 'react';

type ValidationRule<T> = {
  validate: (value: any, formValues?: T) => boolean;
  message: string;
};

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T>[];
};

type FormErrors<T> = {
  [K in keyof T]?: string;
};

type TouchedFields<T> = {
  [K in keyof T]?: boolean;
};

interface UseFormConfig<T extends Record<string, any>> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  onSubmit: (values: T) => void | Promise<void>;
}

interface UseFormReturn<T> {
  values: T;
  errors: FormErrors<T>;
  touched: TouchedFields<T>;
  isSubmitting: boolean;
  handleChange: <K extends keyof T>(field: K) => (value: T[K]) => void;
  handleBlur: (field: keyof T) => () => void;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldError: <K extends keyof T>(field: K, error: string) => void;
  setErrors: (errors: FormErrors<T>) => void;
  handleSubmit: () => Promise<void>;
  resetForm: () => void;
  setTouched: (touched: TouchedFields<T>) => void;
  validateField: (field: keyof T) => string | undefined;
  validateForm: () => FormErrors<T>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  onSubmit
}: UseFormConfig<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<TouchedFields<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateField = useCallback(
    (field: keyof T): string | undefined => {
      const fieldRules = validationRules[field];
      if (!fieldRules) return undefined;

      for (const rule of fieldRules) {
        if (!rule.validate(values[field], values)) {
          return rule.message;
        }
      }
      return undefined;
    },
    [values, validationRules]
  );

  // Validate all form fields
  const validateForm = useCallback((): FormErrors<T> => {
    const newErrors: FormErrors<T> = {};
    
    for (const field in validationRules) {
      const error = validateField(field as keyof T);
      if (error) {
        newErrors[field as keyof T] = error;
      }
    }
    
    return newErrors;
  }, [validateField, validationRules]);

  // Handle field change
  const handleChange = useCallback(<K extends keyof T>(field: K) => (value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle field blur
  const handleBlur = useCallback((field: keyof T) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));

    const error = validateField(field);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  }, [validateField]);

  // Set a specific field's value
  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  // Set a specific field's error
  const setFieldError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validate all fields
      const newErrors = validateForm();
      setErrors(newErrors);

      // Mark all fields as touched
      const allTouched: TouchedFields<T> = {};
      for (const field in values) {
        allTouched[field as keyof T] = true;
      }
      setTouched(allTouched);

      // If there are any errors, stop submission
      if (Object.keys(newErrors).length > 0) {
        return;
      }

      // Call the onSubmit handler
      await onSubmit(values);
    } catch (error) {
      // Let the error propagate to be handled by the form component
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    setErrors,
    handleSubmit,
    resetForm,
    setTouched,
    validateField,
    validateForm
  };
}

// Example Usage:
/*
const form = useForm({
  initialValues: {
    email: '',
    password: ''
  },
  validationRules: {
    email: [
      {
        validate: (value) => !!value,
        message: 'Email is required'
      }
    ],
    password: [
      {
        validate: (value) => !!value,
        message: 'Password is required'
      }
    ]
  },
  onSubmit: async (values) => {
    await submitFunction(values);
  }
});
*/