import Joi from 'joi';

/**
 * Common validation schemas used across the application
 */

/**
 * MongoDB ObjectId Validator
 */
export const objectIdValidator = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    'string.pattern.base': 'Invalid ID format',
  });

/**
 * Email Validator
 */
export const emailValidator = Joi.string()
  .email()
  .lowercase()
  .trim()
  .messages({
    'string.email': 'Please provide a valid email address',
  });

/**
 * Password Validator
 */
export const passwordValidator = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password cannot exceed 128 characters',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  });

/**
 * Phone Number Validator (Saudi format)
 */
export const phoneValidator = Joi.string()
  .pattern(/^(\+966|966|0)?[1-9]\d{8}$/)
  .messages({
    'string.pattern.base': 'Please provide a valid Saudi phone number',
  });

/**
 * Date Validator
 */
export const dateValidator = Joi.date()
  .iso()
  .messages({
    'date.format': 'Date must be in ISO format (YYYY-MM-DD)',
  });

/**
 * Pagination Validator
 */
export const paginationValidator = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.min': 'Page must be at least 1',
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),

  sortBy: Joi.string()
    .optional(),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be asc or desc',
    }),
});

/**
 * Search Validator
 */
export const searchValidator = Joi.object({
  query: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .messages({
      'string.min': 'Search query must be at least 2 characters',
      'string.max': 'Search query cannot exceed 100 characters',
    }),

  fields: Joi.array()
    .items(Joi.string())
    .optional(),

  filters: Joi.object()
    .optional(),
});

/**
 * File Upload Validator
 */
export const fileUploadValidator = Joi.object({
  filename: Joi.string()
    .required()
    .messages({
      'string.empty': 'Filename is required',
    }),

  mimetype: Joi.string()
    .valid(
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif'
    )
    .required()
    .messages({
      'any.only': 'File type not supported',
      'any.required': 'File type is required',
    }),

  size: Joi.number()
    .max(10 * 1024 * 1024) // 10MB
    .required()
    .messages({
      'number.max': 'File size cannot exceed 10MB',
      'any.required': 'File size is required',
    }),
});

/**
 * Address Validator (Saudi format)
 */
export const addressValidator = Joi.object({
  street: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.max': 'Street address cannot exceed 100 characters',
      'any.required': 'Street address is required',
    }),

  district: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': 'District cannot exceed 50 characters',
      'any.required': 'District is required',
    }),

  city: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': 'City cannot exceed 50 characters',
      'any.required': 'City is required',
    }),

  region: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': 'Region cannot exceed 50 characters',
      'any.required': 'Region is required',
    }),

  postalCode: Joi.string()
    .pattern(/^\d{5}$/)
    .required()
    .messages({
      'string.pattern.base': 'Postal code must be 5 digits',
      'any.required': 'Postal code is required',
    }),

  country: Joi.string()
    .valid('SA', 'Saudi Arabia')
    .default('SA')
    .messages({
      'any.only': 'Country must be Saudi Arabia',
    }),
});
