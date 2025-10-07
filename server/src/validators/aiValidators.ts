import Joi from 'joi';
import { CaseType } from '@shared/types';

/**
 * AI Consultation Request Validator
 */
export const aiConsultationValidator = Joi.object({
  query: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Query is required',
      'string.min': 'Query must be at least 10 characters long',
      'string.max': 'Query cannot exceed 1000 characters',
    }),

  caseType: Joi.string()
    .valid(...Object.values(CaseType))
    .optional()
    .messages({
      'any.only': 'Invalid case type provided',
    }),

  context: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Context cannot exceed 500 characters',
    }),

  language: Joi.string()
    .valid('en', 'ar', 'both')
    .default('ar')
    .messages({
      'any.only': 'Language must be en, ar, or both',
    }),

  includeReferences: Joi.boolean()
    .default(true),
});

/**
 * AI Feedback Validator
 */
export const aiFeedbackValidator = Joi.object({
  consultationId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Consultation ID is required',
    }),

  rating: Joi.number()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'any.required': 'Rating is required',
    }),

  feedbackType: Joi.string()
    .valid('helpful', 'not_helpful', 'inaccurate', 'incomplete', 'perfect')
    .required()
    .messages({
      'any.only': 'Invalid feedback type',
      'any.required': 'Feedback type is required',
    }),

  comment: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Comment cannot exceed 1000 characters',
    }),

  improvementSuggestion: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Improvement suggestion cannot exceed 1000 characters',
    }),

  urgencyLevel: Joi.string()
    .valid('low', 'medium', 'high', 'critical')
    .default('medium')
    .messages({
      'any.only': 'Invalid urgency level',
    }),
});

/**
 * Document Analysis Validator
 */
export const documentAnalysisValidator = Joi.object({
  documentId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Document ID is required',
    }),

  analysisType: Joi.string()
    .valid('general', 'contract', 'legal_brief', 'compliance', 'risk_assessment')
    .default('general')
    .messages({
      'any.only': 'Invalid analysis type',
    }),

  includeRecommendations: Joi.boolean()
    .default(true),

  language: Joi.string()
    .valid('en', 'ar')
    .default('ar')
    .messages({
      'any.only': 'Language must be en or ar',
    }),
});

/**
 * Case Suggestions Validator
 */
export const caseSuggestionsValidator = Joi.object({
  caseId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Case ID is required',
    }),

  suggestionType: Joi.string()
    .valid('general', 'strategy', 'documents', 'timeline', 'risks')
    .default('general')
    .messages({
      'any.only': 'Invalid suggestion type',
    }),

  includeTimeframe: Joi.boolean()
    .default(true),

  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .default('medium')
    .messages({
      'any.only': 'Invalid priority level',
    }),
});
