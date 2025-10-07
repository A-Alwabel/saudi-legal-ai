// Form Validation Utilities
// Saudi Legal AI v2.0

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (Saudi format)
export const validateSaudiPhone = (phone: string): boolean => {
  // Saudi phone numbers: +966 followed by 9 digits starting with 5
  const saudiPhoneRegex = /^(\+966|966|0)?5[0-9]{8}$/;
  return saudiPhoneRegex.test(phone.replace(/[\s-]/g, ''));
};

// Saudi National ID validation (Iqama/National ID)
export const validateSaudiID = (id: string): boolean => {
  // Saudi ID: 10 digits starting with 1 or 2
  const saudiIDRegex = /^[12][0-9]{9}$/;
  return saudiIDRegex.test(id);
};

// Commercial Registration validation
export const validateCR = (cr: string): boolean => {
  // CR number format validation
  const crRegex = /^[0-9]{10}$/;
  return crRegex.test(cr);
};

// Password strength validation
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Arabic text validation
export const validateArabicText = (text: string): boolean => {
  // Check if text contains Arabic characters
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text);
};

// URL validation
export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Date validation
export const validateDate = (date: string, format: 'past' | 'future' | 'any' = 'any'): boolean => {
  const dateObj = new Date(date);
  const now = new Date();
  
  if (isNaN(dateObj.getTime())) {
    return false;
  }
  
  switch (format) {
    case 'past':
      return dateObj < now;
    case 'future':
      return dateObj > now;
    default:
      return true;
  }
};

// IBAN validation (Saudi)
export const validateSaudiIBAN = (iban: string): boolean => {
  // Saudi IBAN: SA followed by 22 digits
  const saudiIBANRegex = /^SA[0-9]{22}$/;
  return saudiIBANRegex.test(iban.replace(/\s/g, ''));
};

// Amount validation
export const validateAmount = (amount: string | number, min: number = 0, max?: number): boolean => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return false;
  }
  
  if (numAmount < min) {
    return false;
  }
  
  if (max !== undefined && numAmount > max) {
    return false;
  }
  
  return true;
};

// File validation
export const validateFile = (file: File, options?: {
  maxSize?: number; // in MB
  allowedTypes?: string[];
}): { isValid: boolean; error?: string } => {
  const { maxSize = 10, allowedTypes } = options || {};
  
  // Check file size
  const fileSizeInMB = file.size / (1024 * 1024);
  if (fileSizeInMB > maxSize) {
    return { 
      isValid: false, 
      error: `File size must be less than ${maxSize}MB` 
    };
  }
  
  // Check file type
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `File type must be one of: ${allowedTypes.join(', ')}` 
    };
  }
  
  return { isValid: true };
};

// Case number validation
export const validateCaseNumber = (caseNumber: string): boolean => {
  // Format: CASE-YYYY-XXXXX
  const caseRegex = /^CASE-\d{4}-\d{5}$/;
  return caseRegex.test(caseNumber);
};

// Invoice number validation
export const validateInvoiceNumber = (invoiceNumber: string): boolean => {
  // Format: INV-YYYY-XXXXX
  const invoiceRegex = /^INV-\d{4}-\d{5}$/;
  return invoiceRegex.test(invoiceNumber);
};

// Required field validation
export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) {
    return false;
  }
  
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  
  return true;
};

// Min/Max length validation
export const validateLength = (value: string, min?: number, max?: number): boolean => {
  const length = value.trim().length;
  
  if (min !== undefined && length < min) {
    return false;
  }
  
  if (max !== undefined && length > max) {
    return false;
  }
  
  return true;
};

// Form validation schema type
export interface ValidationRule {
  required?: boolean;
  email?: boolean;
  phone?: boolean;
  saudiID?: boolean;
  password?: boolean;
  arabic?: boolean;
  url?: boolean;
  date?: 'past' | 'future' | 'any';
  iban?: boolean;
  amount?: { min?: number; max?: number };
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule | ValidationRule[];
}

// Form validator
export class FormValidator {
  private schema: ValidationSchema;
  private errors: Record<string, string[]> = {};
  
  constructor(schema: ValidationSchema) {
    this.schema = schema;
  }
  
  validate(data: Record<string, any>): boolean {
    this.errors = {};
    
    for (const field in this.schema) {
      const rules = Array.isArray(this.schema[field]) 
        ? this.schema[field] as ValidationRule[]
        : [this.schema[field] as ValidationRule];
      
      const value = data[field];
      const fieldErrors: string[] = [];
      
      for (const rule of rules) {
        // Required validation
        if (rule.required && !validateRequired(value)) {
          fieldErrors.push(rule.message || `${field} is required`);
          continue;
        }
        
        // Skip other validations if field is empty and not required
        if (!rule.required && !validateRequired(value)) {
          continue;
        }
        
        // Email validation
        if (rule.email && !validateEmail(value)) {
          fieldErrors.push(rule.message || 'Invalid email format');
        }
        
        // Phone validation
        if (rule.phone && !validateSaudiPhone(value)) {
          fieldErrors.push(rule.message || 'Invalid phone number format');
        }
        
        // Saudi ID validation
        if (rule.saudiID && !validateSaudiID(value)) {
          fieldErrors.push(rule.message || 'Invalid Saudi ID format');
        }
        
        // Password validation
        if (rule.password) {
          const result = validatePassword(value);
          if (!result.isValid) {
            fieldErrors.push(...result.errors);
          }
        }
        
        // Arabic text validation
        if (rule.arabic && !validateArabicText(value)) {
          fieldErrors.push(rule.message || 'Must contain Arabic text');
        }
        
        // URL validation
        if (rule.url && !validateURL(value)) {
          fieldErrors.push(rule.message || 'Invalid URL format');
        }
        
        // Date validation
        if (rule.date && !validateDate(value, rule.date)) {
          fieldErrors.push(rule.message || `Invalid date (must be ${rule.date})`);
        }
        
        // IBAN validation
        if (rule.iban && !validateSaudiIBAN(value)) {
          fieldErrors.push(rule.message || 'Invalid Saudi IBAN format');
        }
        
        // Amount validation
        if (rule.amount && !validateAmount(value, rule.amount.min, rule.amount.max)) {
          fieldErrors.push(rule.message || 'Invalid amount');
        }
        
        // Length validation
        if (typeof value === 'string') {
          if (!validateLength(value, rule.minLength, rule.maxLength)) {
            if (rule.minLength && rule.maxLength) {
              fieldErrors.push(rule.message || `Must be between ${rule.minLength} and ${rule.maxLength} characters`);
            } else if (rule.minLength) {
              fieldErrors.push(rule.message || `Must be at least ${rule.minLength} characters`);
            } else if (rule.maxLength) {
              fieldErrors.push(rule.message || `Must be at most ${rule.maxLength} characters`);
            }
          }
        }
        
        // Pattern validation
        if (rule.pattern && !rule.pattern.test(value)) {
          fieldErrors.push(rule.message || 'Invalid format');
        }
        
        // Custom validation
        if (rule.custom) {
          const result = rule.custom(value);
          if (typeof result === 'string') {
            fieldErrors.push(result);
          } else if (!result) {
            fieldErrors.push(rule.message || 'Validation failed');
          }
        }
      }
      
      if (fieldErrors.length > 0) {
        this.errors[field] = fieldErrors;
      }
    }
    
    return Object.keys(this.errors).length === 0;
  }
  
  getErrors(): Record<string, string[]> {
    return this.errors;
  }
  
  getFieldError(field: string): string | undefined {
    return this.errors[field]?.[0];
  }
  
  hasError(field: string): boolean {
    return !!this.errors[field];
  }
  
  clearErrors(): void {
    this.errors = {};
  }
}

// Validation schemas for common forms
export const loginSchema: ValidationSchema = {
  email: {
    required: true,
    email: true,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Password is required'
  }
};

export const registerSchema: ValidationSchema = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 50,
    message: 'Name must be between 3 and 50 characters'
  },
  email: {
    required: true,
    email: true
  },
  password: {
    required: true,
    password: true
  },
  confirmPassword: {
    required: true,
    custom: (value, data) => value === data?.password || 'Passwords do not match'
  },
  phone: {
    required: true,
    phone: true
  }
};

export const caseSchema: ValidationSchema = {
  title: {
    required: true,
    minLength: 5,
    maxLength: 200
  },
  clientId: {
    required: true,
    message: 'Please select a client'
  },
  type: {
    required: true,
    message: 'Please select case type'
  },
  court: {
    required: true
  },
  description: {
    minLength: 10,
    maxLength: 5000
  }
};

export const invoiceSchema: ValidationSchema = {
  clientId: {
    required: true
  },
  items: {
    required: true,
    custom: (value) => Array.isArray(value) && value.length > 0 || 'At least one item is required'
  },
  dueDate: {
    required: true,
    date: 'future'
  },
  amount: {
    required: true,
    amount: { min: 0 }
  }
};

// React Hook for form validation
import { useState, useCallback } from 'react';

export function useFormValidation<T = any>(schema: ValidationSchema) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const validator = new FormValidator(schema);
  
  const validate = useCallback((data: T): boolean => {
    const isValid = validator.validate(data as Record<string, any>);
    const validationErrors = validator.getErrors();
    
    // Convert array errors to single string
    const formattedErrors: Record<string, string> = {};
    for (const field in validationErrors) {
      formattedErrors[field] = validationErrors[field][0];
    }
    
    setErrors(formattedErrors);
    return isValid;
  }, [schema]);
  
  const clearErrors = useCallback(() => {
    setErrors({});
    validator.clearErrors();
  }, []);
  
  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);
  
  return {
    errors,
    validate,
    clearErrors,
    setFieldError,
    hasError: (field: string) => !!errors[field],
    getError: (field: string) => errors[field]
  };
}
