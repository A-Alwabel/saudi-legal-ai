import mongoose, { Schema, Document } from 'mongoose';

export enum ArchiveStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  PENDING_ARCHIVE = 'pending_archive',
  PENDING_RESTORE = 'pending_restore',
  PERMANENTLY_DELETED = 'permanently_deleted',
}

export enum ArchiveType {
  CASE_ARCHIVE = 'case_archive',
  DOCUMENT_ARCHIVE = 'document_archive',
  CLIENT_ARCHIVE = 'client_archive',
  EMPLOYEE_ARCHIVE = 'employee_archive',
  FINANCIAL_ARCHIVE = 'financial_archive',
  COMMUNICATION_ARCHIVE = 'communication_archive',
  SYSTEM_ARCHIVE = 'system_archive',
}

export enum RetentionPeriod {
  ONE_YEAR = '1_year',
  THREE_YEARS = '3_years',
  FIVE_YEARS = '5_years',
  SEVEN_YEARS = '7_years',
  TEN_YEARS = '10_years',
  FIFTEEN_YEARS = '15_years',
  TWENTY_YEARS = '20_years',
  PERMANENT = 'permanent',
  LEGAL_REQUIREMENT = 'legal_requirement',
}

export enum AccessLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  TOP_SECRET = 'top_secret',
}

export interface IArchiveItem {
  _id?: string;
  
  // Archive identification
  archiveNumber: string;
  archiveTitle: string;
  archiveTitleAr?: string;
  archiveType: ArchiveType;
  status: ArchiveStatus;
  
  // Original item information
  originalId: mongoose.Types.ObjectId;
  originalType: string; // Model name (Case, Document, Client, etc.)
  originalData: any; // Snapshot of original data
  relatedItems: {
    itemId: mongoose.Types.ObjectId;
    itemType: string;
    relationship: string;
  }[];
  
  // Archive metadata
  archivedDate: Date;
  archivedBy: mongoose.Types.ObjectId;
  archiveReason: string;
  archiveReasonAr?: string;
  
  // Retention and compliance
  retentionPeriod: RetentionPeriod;
  retentionStartDate: Date;
  retentionEndDate: Date;
  legalRequirement?: string;
  legalRequirementAr?: string;
  complianceNotes?: string;
  
  // Access and security
  accessLevel: AccessLevel;
  authorizedUsers: mongoose.Types.ObjectId[];
  authorizedRoles: mongoose.Types.ObjectId[];
  encryptionStatus: boolean;
  
  // Storage information
  storageLocation: {
    type: 'database' | 'file_system' | 'cloud' | 'physical';
    path?: string;
    container?: string;
    physicalLocation?: string;
    storageProvider?: string;
  };
  
  // File and document details
  files: {
    originalFileName: string;
    archivedFileName: string;
    fileSize: number;
    fileType: string;
    mimeType: string;
    checksum: string;
    encryptionKey?: string;
    compressionType?: string;
    storageUrl?: string;
  }[];
  
  // Search and indexing
  keywords: string[];
  keywordsAr: string[];
  tags: string[];
  categories: string[];
  fullTextIndex?: string;
  
  // Audit and tracking
  accessLog: {
    userId: mongoose.Types.ObjectId;
    accessDate: Date;
    accessType: 'view' | 'download' | 'export' | 'restore' | 'delete';
    ipAddress?: string;
    userAgent?: string;
    notes?: string;
  }[];
  
  // Restoration information
  restorationHistory: {
    restoredDate: Date;
    restoredBy: mongoose.Types.ObjectId;
    restorationReason: string;
    restoredToId?: mongoose.Types.ObjectId;
    notes?: string;
  }[];
  
  // Review and validation
  lastReviewDate?: Date;
  nextReviewDate?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNotes?: string;
  
  // Client and case associations
  clientId?: mongoose.Types.ObjectId;
  caseId?: mongoose.Types.ObjectId;
  departmentId?: string;
  branchId?: mongoose.Types.ObjectId;
  
  // Additional metadata
  description?: string;
  descriptionAr?: string;
  notes?: string;
  notesAr?: string;
  internalNotes?: string;
  
  // System fields
  lawFirmId: mongoose.Types.ObjectId;
  version: number;
  isDeleted: boolean;
  deletedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date;
  deletionReason?: string;
  
  // Audit trail
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ArchiveItemDocument extends IArchiveItem, Document {}

const archiveItemSchema = new Schema<ArchiveItemDocument>({
  // Archive identification
  archiveNumber: {
    type: String,
    required: [true, 'Archive number is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  archiveTitle: {
    type: String,
    required: [true, 'Archive title is required'],
    trim: true,
    maxlength: [200, 'Archive title cannot exceed 200 characters'],
  },
  archiveTitleAr: {
    type: String,
    trim: true,
    maxlength: [200, 'Arabic archive title cannot exceed 200 characters'],
  },
  archiveType: {
    type: String,
    enum: Object.values(ArchiveType),
    required: [true, 'Archive type is required'],
  },
  status: {
    type: String,
    enum: Object.values(ArchiveStatus),
    default: ArchiveStatus.ACTIVE,
  },
  
  // Original item information
  originalId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Original item ID is required'],
  },
  originalType: {
    type: String,
    required: [true, 'Original item type is required'],
    trim: true,
  },
  originalData: {
    type: Schema.Types.Mixed,
    required: [true, 'Original data is required'],
  },
  relatedItems: [{
    itemId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    itemType: {
      type: String,
      required: true,
      trim: true,
    },
    relationship: {
      type: String,
      required: true,
      trim: true,
    },
  }],
  
  // Archive metadata
  archivedDate: {
    type: Date,
    required: [true, 'Archived date is required'],
    default: Date.now,
  },
  archivedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Archived by user is required'],
  },
  archiveReason: {
    type: String,
    required: [true, 'Archive reason is required'],
    trim: true,
    maxlength: [500, 'Archive reason cannot exceed 500 characters'],
  },
  archiveReasonAr: {
    type: String,
    trim: true,
    maxlength: [500, 'Arabic archive reason cannot exceed 500 characters'],
  },
  
  // Retention and compliance
  retentionPeriod: {
    type: String,
    enum: Object.values(RetentionPeriod),
    required: [true, 'Retention period is required'],
  },
  retentionStartDate: {
    type: Date,
    required: [true, 'Retention start date is required'],
    default: Date.now,
  },
  retentionEndDate: {
    type: Date,
    required: [true, 'Retention end date is required'],
  },
  legalRequirement: {
    type: String,
    trim: true,
    maxlength: [300, 'Legal requirement cannot exceed 300 characters'],
  },
  legalRequirementAr: {
    type: String,
    trim: true,
    maxlength: [300, 'Arabic legal requirement cannot exceed 300 characters'],
  },
  complianceNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Compliance notes cannot exceed 1000 characters'],
  },
  
  // Access and security
  accessLevel: {
    type: String,
    enum: Object.values(AccessLevel),
    default: AccessLevel.INTERNAL,
  },
  authorizedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  authorizedRoles: [{
    type: Schema.Types.ObjectId,
    ref: 'Role',
  }],
  encryptionStatus: {
    type: Boolean,
    default: false,
  },
  
  // Storage information
  storageLocation: {
    type: {
      type: String,
      enum: ['database', 'file_system', 'cloud', 'physical'],
      required: true,
    },
    path: String,
    container: String,
    physicalLocation: String,
    storageProvider: String,
  },
  
  // File and document details
  files: [{
    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },
    archivedFileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: [0, 'File size cannot be negative'],
    },
    fileType: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    checksum: {
      type: String,
      required: true,
      trim: true,
    },
    encryptionKey: String,
    compressionType: String,
    storageUrl: String,
  }],
  
  // Search and indexing
  keywords: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  keywordsAr: [{
    type: String,
    trim: true,
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  categories: [{
    type: String,
    trim: true,
  }],
  fullTextIndex: {
    type: String,
    trim: true,
  },
  
  // Audit and tracking
  accessLog: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accessDate: {
      type: Date,
      default: Date.now,
    },
    accessType: {
      type: String,
      enum: ['view', 'download', 'export', 'restore', 'delete'],
      required: true,
    },
    ipAddress: String,
    userAgent: String,
    notes: {
      type: String,
      trim: true,
      maxlength: [200, 'Access log notes cannot exceed 200 characters'],
    },
  }],
  
  // Restoration information
  restorationHistory: [{
    restoredDate: {
      type: Date,
      required: true,
    },
    restoredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restorationReason: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Restoration reason cannot exceed 500 characters'],
    },
    restoredToId: {
      type: Schema.Types.ObjectId,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Restoration notes cannot exceed 500 characters'],
    },
  }],
  
  // Review and validation
  lastReviewDate: Date,
  nextReviewDate: Date,
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Review notes cannot exceed 1000 characters'],
  },
  
  // Client and case associations
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
  },
  caseId: {
    type: Schema.Types.ObjectId,
    ref: 'Case',
  },
  departmentId: {
    type: String,
    trim: true,
  },
  branchId: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
  },
  
  // Additional metadata
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  descriptionAr: {
    type: String,
    trim: true,
    maxlength: [2000, 'Arabic description cannot exceed 2000 characters'],
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters'],
  },
  notesAr: {
    type: String,
    trim: true,
    maxlength: [2000, 'Arabic notes cannot exceed 2000 characters'],
  },
  internalNotes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Internal notes cannot exceed 2000 characters'],
  },
  
  // System fields
  lawFirmId: {
    type: Schema.Types.ObjectId,
    ref: 'LawFirm',
    required: [true, 'Law firm is required'],
  },
  version: {
    type: Number,
    default: 1,
    min: [1, 'Version must be at least 1'],
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  deletedAt: Date,
  deletionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Deletion reason cannot exceed 500 characters'],
  },
  
  // Audit trail
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required'],
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Archive Policy Model
export interface IArchivePolicy {
  _id?: string;
  
  // Policy identification
  policyName: string;
  policyNameAr?: string;
  policyCode: string;
  
  // Policy scope
  applicableTypes: string[]; // Model names this policy applies to
  conditions: {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'older_than';
    value: any;
  }[];
  
  // Archive rules
  autoArchive: boolean;
  archiveAfterDays?: number;
  retentionPeriod: RetentionPeriod;
  accessLevel: AccessLevel;
  encryptionRequired: boolean;
  
  // Approval workflow
  requiresApproval: boolean;
  approvers: mongoose.Types.ObjectId[];
  
  // Notifications
  notifyBeforeArchive: boolean;
  notificationDays?: number;
  notifyUsers: mongoose.Types.ObjectId[];
  
  // Storage preferences
  preferredStorageType: 'database' | 'file_system' | 'cloud' | 'physical';
  storageProvider?: string;
  compressionEnabled: boolean;
  
  // Legal and compliance
  legalBasis?: string;
  legalBasisAr?: string;
  complianceStandard?: string;
  
  // Policy status
  isActive: boolean;
  effectiveDate: Date;
  expiryDate?: Date;
  
  // Law firm
  lawFirmId: mongoose.Types.ObjectId;
  
  // Additional information
  description?: string;
  descriptionAr?: string;
  notes?: string;
  notesAr?: string;
  
  // Audit trail
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ArchivePolicyDocument extends IArchivePolicy, Document {}

const archivePolicySchema = new Schema<ArchivePolicyDocument>({
  // Policy identification
  policyName: {
    type: String,
    required: [true, 'Policy name is required'],
    trim: true,
    maxlength: [100, 'Policy name cannot exceed 100 characters'],
  },
  policyNameAr: {
    type: String,
    trim: true,
    maxlength: [100, 'Arabic policy name cannot exceed 100 characters'],
  },
  policyCode: {
    type: String,
    required: [true, 'Policy code is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  
  // Policy scope
  applicableTypes: [{
    type: String,
    required: true,
    trim: true,
  }],
  conditions: [{
    field: {
      type: String,
      required: true,
      trim: true,
    },
    operator: {
      type: String,
      enum: ['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'in', 'older_than'],
      required: true,
    },
    value: Schema.Types.Mixed,
  }],
  
  // Archive rules
  autoArchive: {
    type: Boolean,
    default: false,
  },
  archiveAfterDays: {
    type: Number,
    min: [1, 'Archive after days must be at least 1'],
  },
  retentionPeriod: {
    type: String,
    enum: Object.values(RetentionPeriod),
    required: [true, 'Retention period is required'],
  },
  accessLevel: {
    type: String,
    enum: Object.values(AccessLevel),
    default: AccessLevel.INTERNAL,
  },
  encryptionRequired: {
    type: Boolean,
    default: false,
  },
  
  // Approval workflow
  requiresApproval: {
    type: Boolean,
    default: false,
  },
  approvers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  // Notifications
  notifyBeforeArchive: {
    type: Boolean,
    default: false,
  },
  notificationDays: {
    type: Number,
    min: [1, 'Notification days must be at least 1'],
  },
  notifyUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  // Storage preferences
  preferredStorageType: {
    type: String,
    enum: ['database', 'file_system', 'cloud', 'physical'],
    default: 'database',
  },
  storageProvider: {
    type: String,
    trim: true,
  },
  compressionEnabled: {
    type: Boolean,
    default: true,
  },
  
  // Legal and compliance
  legalBasis: {
    type: String,
    trim: true,
    maxlength: [500, 'Legal basis cannot exceed 500 characters'],
  },
  legalBasisAr: {
    type: String,
    trim: true,
    maxlength: [500, 'Arabic legal basis cannot exceed 500 characters'],
  },
  complianceStandard: {
    type: String,
    trim: true,
    maxlength: [200, 'Compliance standard cannot exceed 200 characters'],
  },
  
  // Policy status
  isActive: {
    type: Boolean,
    default: true,
  },
  effectiveDate: {
    type: Date,
    required: [true, 'Effective date is required'],
    default: Date.now,
  },
  expiryDate: Date,
  
  // Law firm
  lawFirmId: {
    type: Schema.Types.ObjectId,
    ref: 'LawFirm',
    required: [true, 'Law firm is required'],
  },
  
  // Additional information
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  descriptionAr: {
    type: String,
    trim: true,
    maxlength: [1000, 'Arabic description cannot exceed 1000 characters'],
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
  },
  notesAr: {
    type: String,
    trim: true,
    maxlength: [1000, 'Arabic notes cannot exceed 1000 characters'],
  },
  
  // Audit trail
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required'],
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
archiveItemSchema.index({ lawFirmId: 1 });
archiveItemSchema.index({ archiveNumber: 1 }, { unique: true });
archiveItemSchema.index({ archiveType: 1 });
archiveItemSchema.index({ status: 1 });
archiveItemSchema.index({ originalId: 1, originalType: 1 });
archiveItemSchema.index({ retentionEndDate: 1 });
archiveItemSchema.index({ accessLevel: 1 });

archivePolicySchema.index({ lawFirmId: 1 });
archivePolicySchema.index({ policyCode: 1 }, { unique: true });
archivePolicySchema.index({ isActive: 1 });
archivePolicySchema.index({ applicableTypes: 1 });

// Compound indexes
archiveItemSchema.index({ lawFirmId: 1, status: 1 });
archiveItemSchema.index({ lawFirmId: 1, archiveType: 1 });
archiveItemSchema.index({ clientId: 1, caseId: 1 });
archiveItemSchema.index({ keywords: 1, keywordsAr: 1 });

// Text indexes for search
archiveItemSchema.index({
  archiveTitle: 'text',
  archiveTitleAr: 'text',
  description: 'text',
  descriptionAr: 'text',
  keywords: 'text',
  keywordsAr: 'text',
  fullTextIndex: 'text'
});

// Virtual for is expired
archiveItemSchema.virtual('isExpired').get(function() {
  if (this.retentionPeriod === RetentionPeriod.PERMANENT) return false;
  return new Date() > this.retentionEndDate;
});

// Virtual for days until expiry
archiveItemSchema.virtual('daysUntilExpiry').get(function() {
  if (this.retentionPeriod === RetentionPeriod.PERMANENT) return null;
  const diffTime = this.retentionEndDate.getTime() - new Date().getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for total file size
archiveItemSchema.virtual('totalFileSize').get(function() {
  return this.files.reduce((total, file) => total + file.fileSize, 0);
});

// Pre-save middleware
archiveItemSchema.pre('save', function(next) {
  // Calculate retention end date if not provided
  if (!this.retentionEndDate && this.retentionPeriod !== RetentionPeriod.PERMANENT) {
    const startDate = this.retentionStartDate || new Date();
    let yearsToAdd = 0;
    
    switch (this.retentionPeriod) {
      case RetentionPeriod.ONE_YEAR: yearsToAdd = 1; break;
      case RetentionPeriod.THREE_YEARS: yearsToAdd = 3; break;
      case RetentionPeriod.FIVE_YEARS: yearsToAdd = 5; break;
      case RetentionPeriod.SEVEN_YEARS: yearsToAdd = 7; break;
      case RetentionPeriod.TEN_YEARS: yearsToAdd = 10; break;
      case RetentionPeriod.FIFTEEN_YEARS: yearsToAdd = 15; break;
      case RetentionPeriod.TWENTY_YEARS: yearsToAdd = 20; break;
      case RetentionPeriod.LEGAL_REQUIREMENT: yearsToAdd = 10; break; // Default
    }
    
    if (yearsToAdd > 0) {
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + yearsToAdd);
      this.retentionEndDate = endDate;
    }
  }
  
  // Set next review date
  if (!this.nextReviewDate) {
    const nextReview = new Date();
    nextReview.setFullYear(nextReview.getFullYear() + 1); // Annual review
    this.nextReviewDate = nextReview;
  }
  
  next();
});

// Static method to generate archive number
archiveItemSchema.statics.generateArchiveNumber = async function(lawFirmId: mongoose.Types.ObjectId, archiveType: ArchiveType) {
  const year = new Date().getFullYear();
  const typePrefix = archiveType.toUpperCase().substring(0, 3);
  const prefix = `ARC-${typePrefix}-${year}-`;
  
  // Find the last archive for this year and type
  const lastArchive = await this.findOne({
    lawFirmId,
    archiveType,
    archiveNumber: { $regex: `^${prefix}` }
  }).sort({ archiveNumber: -1 });
  
  let sequence = 1;
  if (lastArchive) {
    const lastSequence = parseInt(lastArchive.archiveNumber.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(6, '0')}`;
};

export const ArchiveItem = mongoose.model<ArchiveItemDocument>('ArchiveItem', archiveItemSchema);
export const ArchivePolicy = mongoose.model<ArchivePolicyDocument>('ArchivePolicy', archivePolicySchema);
