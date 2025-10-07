/**
 * Application Constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// Authentication
export const AUTH_CONFIG = {
  TOKEN_KEY: 'auth_token',
  CLIENT_TOKEN_KEY: 'client_auth_token',
  USER_DATA_KEY: 'user_data',
  CLIENT_DATA_KEY: 'client_data',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes
} as const;

// Application Settings
export const APP_CONFIG = {
  NAME: 'Saudi Legal AI',
  VERSION: '2.0.0',
  DESCRIPTION: 'Advanced Legal AI Assistant for Saudi Law',
  DEFAULT_LANGUAGE: 'ar',
  SUPPORTED_LANGUAGES: ['ar', 'en'],
  DEFAULT_THEME: 'light',
} as const;

// UI Constants
export const UI_CONFIG = {
  DRAWER_WIDTH: 280,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 48,
  SIDEBAR_COLLAPSED_WIDTH: 64,
  MAX_MOBILE_WIDTH: 768,
  ANIMATION_DURATION: 300,
} as const;

// Case Types
export const CASE_TYPES = {
  COMMERCIAL: 'commercial',
  CIVIL: 'civil',
  CRIMINAL: 'criminal',
  LABOR: 'labor',
  FAMILY: 'family',
  REAL_ESTATE: 'real_estate',
  INTELLECTUAL_PROPERTY: 'intellectual_property',
  ADMINISTRATIVE: 'administrative',
  CYBER_CRIME: 'cyber_crime',
  INHERITANCE: 'inheritance',
} as const;

// Case Status
export const CASE_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  CLOSED: 'closed',
  ON_HOLD: 'on_hold',
  UNDER_REVIEW: 'under_review',
} as const;

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  LAWYER: 'lawyer',
  PARALEGAL: 'paralegal',
  CLERK: 'clerk',
  ACCOUNTANT: 'accountant',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
} as const;

// Document Types
export const DOCUMENT_TYPES = {
  CONTRACT: 'contract',
  LEGAL_BRIEF: 'legal_brief',
  COURT_FILING: 'court_filing',
  EVIDENCE: 'evidence',
  CORRESPONDENCE: 'correspondence',
  REPORT: 'report',
  INVOICE: 'invoice',
  OTHER: 'other',
} as const;

// File Upload
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
  ],
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks for large file uploads
} as const;

// Pagination
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// AI Configuration
export const AI_CONFIG = {
  MAX_QUERY_LENGTH: 1000,
  MIN_QUERY_LENGTH: 10,
  DEFAULT_LANGUAGE: 'ar',
  SUPPORTED_LANGUAGES: ['ar', 'en', 'both'],
  CONFIDENCE_THRESHOLD: 0.7,
  MAX_SUGGESTIONS: 5,
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  AI_SUGGESTION: 'ai_suggestion',
  CASE_UPDATE: 'case_update',
  DEADLINE_REMINDER: 'deadline_reminder',
  SYSTEM_ALERT: 'system_alert',
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  TIME_ONLY: 'HH:mm',
} as const;

// Currency
export const CURRENCY_CONFIG = {
  DEFAULT: 'SAR',
  SYMBOL: 'ر.س',
  DECIMAL_PLACES: 2,
  SUPPORTED_CURRENCIES: ['SAR', 'USD', 'EUR'],
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000,
  PHONE_PATTERN: /^(\+966|966|0)?[1-9]\d{8}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  SAUDI_ID_PATTERN: /^\d{10}$/,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  CLIENT_TOKEN: 'client_auth_token',
  USER_DATA: 'user_data',
  CLIENT_DATA: 'client_data',
  THEME: 'theme_preference',
  LANGUAGE: 'language_preference',
  SIDEBAR_STATE: 'sidebar_collapsed',
  RECENT_SEARCHES: 'recent_searches',
  USER_PREFERENCES: 'user_preferences',
  DRAFT_DATA: 'draft_data',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'Access to this resource is forbidden.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An internal server error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE: 'File type is not supported.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid Saudi phone number.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  SAVE_SUCCESS: 'Data saved successfully!',
  UPDATE_SUCCESS: 'Updated successfully!',
  DELETE_SUCCESS: 'Deleted successfully!',
  UPLOAD_SUCCESS: 'File uploaded successfully!',
  EMAIL_SENT: 'Email sent successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CASES: '/cases',
  CLIENTS: '/clients',
  DOCUMENTS: '/documents',
  AI_ASSISTANT: '/ai-assistant',
  APPOINTMENTS: '/appointments',
  TASKS: '/tasks',
  INVOICES: '/invoices',
  EMPLOYEES: '/employees',
  SETTINGS: '/settings',
  LAWYER_PREFERENCES: '/lawyer-preferences',
  CLIENT_PORTAL: '/client-portal',
  CLIENT_LOGIN: '/client-portal/login',
  CLIENT_DASHBOARD: '/client-portal/dashboard',
  LEGAL_LIBRARY: '/legal-library',
  REPORTS: '/reports',
  NOTIFICATIONS: '/notifications',
} as const;
