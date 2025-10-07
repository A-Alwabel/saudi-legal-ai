// Core Entity Types
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // Optional for response, required for creation
  role: UserRole;
  lawFirmId: string;
  isActive: boolean;
  lastLogin?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LawFirm {
  id: string;
  name: string;
  licenseNumber: string;
  address: string;
  phone: string;
  email: string;
  subscriptionPlan: SubscriptionPlan;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Case {
  id: string;
  title: string;
  description: string;
  caseType: CaseType;
  status: CaseStatus;
  priority: Priority;
  clientId: string;
  assignedLawyerId: string;
  lawFirmId: string;
  courtId?: string;
  caseNumber?: string;
  startDate: Date;
  expectedEndDate?: Date;
  actualEndDate?: Date;
  successProbability?: number;
  estimatedValue?: number;
  actualValue?: number;
  tags?: string[];
  notes?: Array<{
    content: string;
    addedBy: string;
    addedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  nameAr?: string;
  email: string;
  phone: string;
  nationalId?: string;
  commercialRegister?: string;
  clientType: ClientType;
  status: ClientStatus;
  address?: {
    street?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  };
  lawFirmId: string;
  assignedLawyerId?: string;
  company?: {
    name?: string;
    nameAr?: string;
    position?: string;
    industry?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  preferences?: {
    language?: 'en' | 'ar';
    communicationMethod?: 'email' | 'phone' | 'whatsapp' | 'sms';
    timezone?: string;
  };
  tags?: string[];
  notes?: Array<{
    content: string;
    addedBy: string;
    addedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  documentType: DocumentType;
  status: DocumentStatus;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  checksum: string;
  caseId: string;
  clientId: string;
  lawFirmId: string;
  uploadedBy: string;
  version?: number;
  parentDocumentId?: string;
  isTemplate?: boolean;
  templateCategory?: string;
  tags?: string[];
  metadata?: {
    author?: string;
    subject?: string;
    keywords?: string[];
    pageCount?: number;
    wordCount?: number;
    language?: 'en' | 'ar' | 'mixed';
  };
  accessControl?: {
    isPublic?: boolean;
    allowedUsers?: string[];
    allowedRoles?: string[];
  };
  reviewHistory?: Array<{
    reviewedBy: string;
    reviewDate: Date;
    status: 'approved' | 'rejected' | 'pending_revision';
    comments?: string;
  }>;
  expiryDate?: Date;
  isArchived?: boolean;
  archivedAt?: Date;
  archivedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enums
export enum UserRole {
  ADMIN = 'admin',
  LAWYER = 'lawyer',
  PARALEGAL = 'paralegal',
  CLERK = 'clerk',
  CLIENT = 'client'
}

export enum CaseType {
  COMMERCIAL = 'commercial',
  CIVIL = 'civil',
  CRIMINAL = 'criminal',
  LABOR = 'labor',
  FAMILY = 'family',
  REAL_ESTATE = 'real_estate',
  INTELLECTUAL_PROPERTY = 'intellectual_property',
  ADMINISTRATIVE = 'administrative',
  CYBER_CRIME = 'cyber_crime',
  INHERITANCE = 'inheritance'
}

export enum CaseStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  UNDER_REVIEW = 'under_review',
  PENDING_DOCUMENTS = 'pending_documents',
  COURT_HEARING = 'court_hearing',
  SETTLED = 'settled',
  WON = 'won',
  LOST = 'lost',
  CLOSED = 'closed'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum ClientType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
  GOVERNMENT = 'government',
  NGO = 'ngo'
}

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived'
}

export enum DocumentType {
  CONTRACT = 'contract',
  MEMORANDUM = 'memorandum',
  PETITION = 'petition',
  EVIDENCE = 'evidence',
  CORRESPONDENCE = 'correspondence',
  COURT_DOCUMENT = 'court_document',
  LEGAL_OPINION = 'legal_opinion',
  OTHER = 'other'
}

export enum DocumentStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
  SIGNED = 'signed',
  EXECUTED = 'executed'
}

export enum SubscriptionPlan {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// AI Service Types
export interface AIConsultationRequest {
  query: string;
  caseType?: CaseType;
  context?: string;
  language: 'ar' | 'en';
  includeReferences?: boolean;
}

export interface AIConsultationResponse {
  id: string; // Added for RLHF tracking
  answer: string;
  confidence: number;
  references: LegalReference[];
  suggestions: string[];
  relatedCases?: Case[];
  successProbability?: number;
  validation?: ValidationResult;
  disclaimers?: string[];
  lastUpdated?: string;
  verificationLevel?: 'unverified' | 'lawyer_verified' | 'expert_verified';
  canProvideFeedback?: boolean; // For UI control
}

// RLHF System Types - Integrated into existing structure
export interface LawyerFeedback {
  id: string;
  consultationId: string; // Links to AIConsultationResponse.id
  userId: string; // Links to existing User model
  lawFirmId: string; // Links to existing LawFirm model
  rating: 1 | 2 | 3 | 4 | 5;
  feedbackType: FeedbackType;
  improvementSuggestion?: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  originalQuery: string;
  originalAnswer: string;
  status: FeedbackStatus;
  adminReviewed: boolean;
  adminDecision?: AdminDecision;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnswerImprovement {
  id: string;
  feedbackId: string; // Links to LawyerFeedback
  originalAnswer: string;
  improvedAnswer: string;
  verifiedBy?: string; // User ID of hired lawyer
  verificationDate?: Date;
  legalReferences: string[];
  verificationLevel: 'admin_corrected' | 'lawyer_verified';
  questionPattern: string; // For similar question matching
  isActive: boolean;
  effectiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemLearning {
  id: string;
  questionPattern: string;
  improvementId: string; // Links to AnswerImprovement
  similarity: number; // For matching similar questions
  usageCount: number; // How many times this improvement was used
  lastUsed: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Enums for RLHF
export enum FeedbackType {
  INACCURATE = 'inaccurate',
  INCOMPLETE = 'incomplete',
  OUTDATED = 'outdated',
  WRONG_JURISDICTION = 'wrong_jurisdiction',
  MISSING_PROCEDURE = 'missing_procedure',
  INCORRECT_REFERENCE = 'incorrect_reference',
  PERFECT = 'perfect'
}

export enum FeedbackStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IMPLEMENTED = 'implemented'
}

export enum AdminDecision {
  NEEDS_LAWYER_VERIFICATION = 'needs_lawyer_verification',
  ADMIN_CAN_FIX = 'admin_can_fix',
  REJECT_INVALID = 'reject_invalid',
  ALREADY_CORRECT = 'already_correct'
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  confidence: number;
  recommendations: string[];
}

export interface LegalReference {
  id: string;
  title: string;
  article: string;
  law: string;
  source: string;
  url?: string;
  relevance: number;
}

// Search Types
export interface SearchFilters {
  caseType?: CaseType;
  status?: CaseStatus;
  priority?: Priority;
  dateFrom?: Date;
  dateTo?: Date;
  assignedLawyer?: string;
  clientId?: string;
}

export interface SearchOptions {
  query?: string;
  filters?: SearchFilters;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: any;
  createdAt: Date;
}

export enum NotificationType {
  CASE_UPDATE = 'case_update',
  DOCUMENT_UPLOADED = 'document_uploaded',
  HEARING_REMINDER = 'hearing_reminder',
  PAYMENT_DUE = 'payment_due',
  SYSTEM_ALERT = 'system_alert'
}

// Analytics Types
export interface CaseAnalytics {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  successRate: number;
  averageDuration: number;
  revenue: number;
  casesByType: Record<CaseType, number>;
  casesByStatus: Record<CaseStatus, number>;
  monthlyTrend: MonthlyTrend[];
}

export interface MonthlyTrend {
  month: string;
  cases: number;
  revenue: number;
  successRate: number;
}

// Configuration Types
export interface AppConfig {
  database: {
    uri: string;
    options: any;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  openai: {
    apiKey: string;
    model: string;
  };
  upload: {
    maxFileSize: number;
    allowedTypes: string[];
    uploadPath: string;
  };
  security: {
    rateLimit: {
      windowMs: number;
      max: number;
    };
    cors: {
      origin: string[];
      credentials: boolean;
    };
  };
}
