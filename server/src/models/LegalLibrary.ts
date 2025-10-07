import mongoose, { Schema, Document } from 'mongoose';

export enum ResourceType {
  LAW = 'law',
  REGULATION = 'regulation',
  DECREE = 'decree',
  CIRCULAR = 'circular',
  JUDGMENT = 'judgment',
  PRECEDENT = 'precedent',
  LEGAL_OPINION = 'legal_opinion',
  COMMENTARY = 'commentary',
  BOOK = 'book',
  ARTICLE = 'article',
  RESEARCH = 'research',
  TEMPLATE = 'template',
  FORM = 'form',
  CONTRACT_TEMPLATE = 'contract_template',
  PLEADING_TEMPLATE = 'pleading_template',
  OTHER = 'other',
}

export enum Jurisdiction {
  SAUDI_ARABIA = 'saudi_arabia',
  GCC = 'gcc',
  ARAB_LEAGUE = 'arab_league',
  INTERNATIONAL = 'international',
  ISLAMIC_LAW = 'islamic_law',
  COMMERCIAL_LAW = 'commercial_law',
  CIVIL_LAW = 'civil_law',
  CRIMINAL_LAW = 'criminal_law',
  ADMINISTRATIVE_LAW = 'administrative_law',
  LABOR_LAW = 'labor_law',
  TAX_LAW = 'tax_law',
  CORPORATE_LAW = 'corporate_law',
  INTELLECTUAL_PROPERTY = 'intellectual_property',
  REAL_ESTATE_LAW = 'real_estate_law',
  FAMILY_LAW = 'family_law',
  BANKING_LAW = 'banking_law',
  INSURANCE_LAW = 'insurance_law',
  MARITIME_LAW = 'maritime_law',
  AVIATION_LAW = 'aviation_law',
  TELECOMMUNICATIONS_LAW = 'telecommunications_law',
  HEALTHCARE_LAW = 'healthcare_law',
  ENVIRONMENTAL_LAW = 'environmental_law',
  ENERGY_LAW = 'energy_law',
  CONSTRUCTION_LAW = 'construction_law',
  ARBITRATION = 'arbitration',
  MEDIATION = 'mediation',
}

export enum AccessLevel {
  PUBLIC = 'public',
  FIRM_WIDE = 'firm_wide',
  DEPARTMENT = 'department',
  BRANCH = 'branch',
  RESTRICTED = 'restricted',
  CONFIDENTIAL = 'confidential',
}

export enum ResourceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
  SUPERSEDED = 'superseded',
}

export interface ILegalResource {
  _id?: string;
  
  // Resource identification
  resourceNumber: string;
  title: string;
  titleAr?: string;
  subtitle?: string;
  subtitleAr?: string;
  
  // Resource classification
  resourceType: ResourceType;
  jurisdiction: Jurisdiction[];
  practiceAreas: string[];
  keywords: string[];
  keywordsAr: string[];
  tags: string[];
  
  // Legal details
  lawNumber?: string;
  regulationNumber?: string;
  decreeNumber?: string;
  caseNumber?: string;
  courtName?: string;
  courtNameAr?: string;
  judgeName?: string;
  judgeNameAr?: string;
  
  // Publication information
  publishedDate?: Date;
  effectiveDate?: Date;
  expiryDate?: Date;
  lastAmendmentDate?: Date;
  publisher?: string;
  publisherAr?: string;
  publicationSource?: string;
  publicationSourceAr?: string;
  
  // Authorship
  author?: string;
  authorAr?: string;
  coAuthors: string[];
  coAuthorsAr: string[];
  editor?: string;
  editorAr?: string;
  translator?: string;
  translatorAr?: string;
  
  // Content details
  abstract?: string;
  abstractAr?: string;
  summary?: string;
  summaryAr?: string;
  fullText?: string;
  fullTextAr?: string;
  
  // Document properties
  language: 'ar' | 'en' | 'both';
  pageCount?: number;
  wordCount?: number;
  
  // File attachments
  files: {
    fileName: string;
    originalFileName: string;
    fileSize: number;
    fileType: string;
    mimeType: string;
    language: 'ar' | 'en' | 'both';
    url: string;
    checksum?: string;
    uploadedAt: Date;
    uploadedBy: mongoose.Types.ObjectId;
  }[];
  
  // Citations and references
  citations: {
    resourceId?: mongoose.Types.ObjectId;
    externalReference: string;
    citationType: 'cites' | 'cited_by' | 'references' | 'referenced_by' | 'supersedes' | 'superseded_by';
    description?: string;
    descriptionAr?: string;
  }[];
  
  // Legal hierarchy
  parentResource?: mongoose.Types.ObjectId;
  childResources: mongoose.Types.ObjectId[];
  relatedResources: {
    resourceId: mongoose.Types.ObjectId;
    relationshipType: 'amendment' | 'implementing_regulation' | 'case_law' | 'commentary' | 'related';
    description?: string;
    descriptionAr?: string;
  }[];
  
  // Annotations and notes
  annotations: {
    userId: mongoose.Types.ObjectId;
    content: string;
    contentAr?: string;
    annotationType: 'note' | 'highlight' | 'bookmark' | 'comment' | 'analysis';
    isPrivate: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
  
  // Usage statistics
  viewCount: number;
  downloadCount: number;
  citationCount: number;
  bookmarkCount: number;
  rating: {
    averageRating: number;
    totalRatings: number;
    ratings: {
      userId: mongoose.Types.ObjectId;
      rating: number;
      review?: string;
      reviewAr?: string;
      createdAt: Date;
    }[];
  };
  
  // Access control
  accessLevel: AccessLevel;
  authorizedUsers: mongoose.Types.ObjectId[];
  authorizedRoles: mongoose.Types.ObjectId[];
  authorizedDepartments: string[];
  authorizedBranches: mongoose.Types.ObjectId[];
  
  // Status and workflow
  status: ResourceStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  
  // Subscription and updates
  subscribers: mongoose.Types.ObjectId[];
  lastNotificationSent?: Date;
  changeLog: {
    version: string;
    changeDate: Date;
    changedBy: mongoose.Types.ObjectId;
    changeDescription: string;
    changeDescriptionAr?: string;
    changeType: 'created' | 'updated' | 'amended' | 'superseded' | 'archived';
  }[];
  
  // Indexing and search
  searchableContent: string;
  searchableContentAr: string;
  
  // Client and case associations
  relatedCases: mongoose.Types.ObjectId[];
  relatedClients: mongoose.Types.ObjectId[];
  
  // Law firm and organization
  lawFirmId: mongoose.Types.ObjectId;
  departmentId?: string;
  branchId?: mongoose.Types.ObjectId;
  
  // Additional metadata
  isbn?: string;
  doi?: string;
  url?: string;
  sourceUrl?: string;
  copyrightInfo?: string;
  copyrightInfoAr?: string;
  licenseType?: string;
  
  // Version control
  version: string;
  isLatestVersion: boolean;
  previousVersions: mongoose.Types.ObjectId[];
  
  // Additional fields
  notes?: string;
  notesAr?: string;
  internalNotes?: string;
  
  // Audit trail
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface LegalResourceDocument extends ILegalResource, Document {}

const legalResourceSchema = new Schema<LegalResourceDocument>({
  // Resource identification
  resourceNumber: {
    type: String,
    required: [true, 'Resource number is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters'],
  },
  titleAr: {
    type: String,
    trim: true,
    maxlength: [300, 'Arabic title cannot exceed 300 characters'],
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [200, 'Subtitle cannot exceed 200 characters'],
  },
  subtitleAr: {
    type: String,
    trim: true,
    maxlength: [200, 'Arabic subtitle cannot exceed 200 characters'],
  },
  
  // Resource classification
  resourceType: {
    type: String,
    enum: Object.values(ResourceType),
    required: [true, 'Resource type is required'],
  },
  jurisdiction: [{
    type: String,
    enum: Object.values(Jurisdiction),
    required: true,
  }],
  practiceAreas: [{
    type: String,
    trim: true,
  }],
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
  
  // Legal details
  lawNumber: {
    type: String,
    trim: true,
  },
  regulationNumber: {
    type: String,
    trim: true,
  },
  decreeNumber: {
    type: String,
    trim: true,
  },
  caseNumber: {
    type: String,
    trim: true,
  },
  courtName: {
    type: String,
    trim: true,
  },
  courtNameAr: {
    type: String,
    trim: true,
  },
  judgeName: {
    type: String,
    trim: true,
  },
  judgeNameAr: {
    type: String,
    trim: true,
  },
  
  // Publication information
  publishedDate: Date,
  effectiveDate: Date,
  expiryDate: Date,
  lastAmendmentDate: Date,
  publisher: {
    type: String,
    trim: true,
  },
  publisherAr: {
    type: String,
    trim: true,
  },
  publicationSource: {
    type: String,
    trim: true,
  },
  publicationSourceAr: {
    type: String,
    trim: true,
  },
  
  // Authorship
  author: {
    type: String,
    trim: true,
  },
  authorAr: {
    type: String,
    trim: true,
  },
  coAuthors: [{
    type: String,
    trim: true,
  }],
  coAuthorsAr: [{
    type: String,
    trim: true,
  }],
  editor: {
    type: String,
    trim: true,
  },
  editorAr: {
    type: String,
    trim: true,
  },
  translator: {
    type: String,
    trim: true,
  },
  translatorAr: {
    type: String,
    trim: true,
  },
  
  // Content details
  abstract: {
    type: String,
    trim: true,
    maxlength: [2000, 'Abstract cannot exceed 2000 characters'],
  },
  abstractAr: {
    type: String,
    trim: true,
    maxlength: [2000, 'Arabic abstract cannot exceed 2000 characters'],
  },
  summary: {
    type: String,
    trim: true,
    maxlength: [5000, 'Summary cannot exceed 5000 characters'],
  },
  summaryAr: {
    type: String,
    trim: true,
    maxlength: [5000, 'Arabic summary cannot exceed 5000 characters'],
  },
  fullText: {
    type: String,
    trim: true,
  },
  fullTextAr: {
    type: String,
    trim: true,
  },
  
  // Document properties
  language: {
    type: String,
    enum: ['ar', 'en', 'both'],
    required: [true, 'Language is required'],
  },
  pageCount: {
    type: Number,
    min: [0, 'Page count cannot be negative'],
  },
  wordCount: {
    type: Number,
    min: [0, 'Word count cannot be negative'],
  },
  
  // File attachments
  files: [{
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    originalFileName: {
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
    language: {
      type: String,
      enum: ['ar', 'en', 'both'],
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    checksum: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  }],
  
  // Citations and references
  citations: [{
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: 'LegalResource',
    },
    externalReference: {
      type: String,
      required: true,
      trim: true,
    },
    citationType: {
      type: String,
      enum: ['cites', 'cited_by', 'references', 'referenced_by', 'supersedes', 'superseded_by'],
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    descriptionAr: {
      type: String,
      trim: true,
    },
  }],
  
  // Legal hierarchy
  parentResource: {
    type: Schema.Types.ObjectId,
    ref: 'LegalResource',
  },
  childResources: [{
    type: Schema.Types.ObjectId,
    ref: 'LegalResource',
  }],
  relatedResources: [{
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: 'LegalResource',
      required: true,
    },
    relationshipType: {
      type: String,
      enum: ['amendment', 'implementing_regulation', 'case_law', 'commentary', 'related'],
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    descriptionAr: {
      type: String,
      trim: true,
    },
  }],
  
  // Annotations and notes
  annotations: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, 'Annotation content cannot exceed 2000 characters'],
    },
    contentAr: {
      type: String,
      trim: true,
      maxlength: [2000, 'Arabic annotation content cannot exceed 2000 characters'],
    },
    annotationType: {
      type: String,
      enum: ['note', 'highlight', 'bookmark', 'comment', 'analysis'],
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Usage statistics
  viewCount: {
    type: Number,
    default: 0,
    min: [0, 'View count cannot be negative'],
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: [0, 'Download count cannot be negative'],
  },
  citationCount: {
    type: Number,
    default: 0,
    min: [0, 'Citation count cannot be negative'],
  },
  bookmarkCount: {
    type: Number,
    default: 0,
    min: [0, 'Bookmark count cannot be negative'],
  },
  rating: {
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Average rating cannot be negative'],
      max: [5, 'Average rating cannot exceed 5'],
    },
    totalRatings: {
      type: Number,
      default: 0,
      min: [0, 'Total ratings cannot be negative'],
    },
    ratings: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
      },
      review: {
        type: String,
        trim: true,
        maxlength: [1000, 'Review cannot exceed 1000 characters'],
      },
      reviewAr: {
        type: String,
        trim: true,
        maxlength: [1000, 'Arabic review cannot exceed 1000 characters'],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  
  // Access control
  accessLevel: {
    type: String,
    enum: Object.values(AccessLevel),
    default: AccessLevel.FIRM_WIDE,
  },
  authorizedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  authorizedRoles: [{
    type: Schema.Types.ObjectId,
    ref: 'Role',
  }],
  authorizedDepartments: [{
    type: String,
    trim: true,
  }],
  authorizedBranches: [{
    type: Schema.Types.ObjectId,
    ref: 'Branch',
  }],
  
  // Status and workflow
  status: {
    type: String,
    enum: Object.values(ResourceStatus),
    default: ResourceStatus.DRAFT,
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: Date,
  reviewNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Review notes cannot exceed 1000 characters'],
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: Date,
  
  // Subscription and updates
  subscribers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  lastNotificationSent: Date,
  changeLog: [{
    version: {
      type: String,
      required: true,
      trim: true,
    },
    changeDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changeDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Change description cannot exceed 500 characters'],
    },
    changeDescriptionAr: {
      type: String,
      trim: true,
      maxlength: [500, 'Arabic change description cannot exceed 500 characters'],
    },
    changeType: {
      type: String,
      enum: ['created', 'updated', 'amended', 'superseded', 'archived'],
      required: true,
    },
  }],
  
  // Indexing and search
  searchableContent: {
    type: String,
    trim: true,
  },
  searchableContentAr: {
    type: String,
    trim: true,
  },
  
  // Client and case associations
  relatedCases: [{
    type: Schema.Types.ObjectId,
    ref: 'Case',
  }],
  relatedClients: [{
    type: Schema.Types.ObjectId,
    ref: 'Client',
  }],
  
  // Law firm and organization
  lawFirmId: {
    type: Schema.Types.ObjectId,
    ref: 'LawFirm',
    required: [true, 'Law firm is required'],
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
  isbn: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/.test(v);
      },
      message: 'Invalid ISBN format'
    }
  },
  doi: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^10\.\d{4,}\/[-._;()\/:a-zA-Z0-9]+$/.test(v);
      },
      message: 'Invalid DOI format'
    }
  },
  url: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid URL format'
    }
  },
  sourceUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid source URL format'
    }
  },
  copyrightInfo: {
    type: String,
    trim: true,
    maxlength: [500, 'Copyright info cannot exceed 500 characters'],
  },
  copyrightInfoAr: {
    type: String,
    trim: true,
    maxlength: [500, 'Arabic copyright info cannot exceed 500 characters'],
  },
  licenseType: {
    type: String,
    trim: true,
  },
  
  // Version control
  version: {
    type: String,
    required: [true, 'Version is required'],
    default: '1.0',
  },
  isLatestVersion: {
    type: Boolean,
    default: true,
  },
  previousVersions: [{
    type: Schema.Types.ObjectId,
    ref: 'LegalResource',
  }],
  
  // Additional fields
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

// Indexes for better query performance
legalResourceSchema.index({ lawFirmId: 1 });
legalResourceSchema.index({ resourceNumber: 1 }, { unique: true });
legalResourceSchema.index({ resourceType: 1 });
legalResourceSchema.index({ jurisdiction: 1 });
legalResourceSchema.index({ practiceAreas: 1 });
legalResourceSchema.index({ status: 1 });
legalResourceSchema.index({ accessLevel: 1 });
legalResourceSchema.index({ publishedDate: -1 });
legalResourceSchema.index({ effectiveDate: -1 });

// Compound indexes
legalResourceSchema.index({ lawFirmId: 1, status: 1 });
legalResourceSchema.index({ lawFirmId: 1, resourceType: 1 });
legalResourceSchema.index({ lawFirmId: 1, jurisdiction: 1 });
legalResourceSchema.index({ tags: 1, keywords: 1 });

// Text indexes for search
legalResourceSchema.index({
  title: 'text',
  titleAr: 'text',
  abstract: 'text',
  abstractAr: 'text',
  summary: 'text',
  summaryAr: 'text',
  keywords: 'text',
  keywordsAr: 'text',
  searchableContent: 'text',
  searchableContentAr: 'text'
});

// Virtual for is current (not expired)
legalResourceSchema.virtual('isCurrent').get(function() {
  if (!this.expiryDate) return true;
  return new Date() <= this.expiryDate;
});

// Virtual for days until expiry
legalResourceSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiryDate) return null;
  const diffTime = this.expiryDate.getTime() - new Date().getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for total file size
legalResourceSchema.virtual('totalFileSize').get(function() {
  return this.files.reduce((total, file) => total + file.fileSize, 0);
});

// Pre-save middleware
legalResourceSchema.pre('save', function(next) {
  // Build searchable content
  const searchableFields = [
    this.title,
    this.subtitle,
    this.abstract,
    this.summary,
    this.author,
    this.publisher,
    ...this.keywords,
    ...this.tags,
    ...this.practiceAreas
  ].filter(Boolean);
  
  const searchableFieldsAr = [
    this.titleAr,
    this.subtitleAr,
    this.abstractAr,
    this.summaryAr,
    this.authorAr,
    this.publisherAr,
    ...this.keywordsAr
  ].filter(Boolean);
  
  this.searchableContent = searchableFields.join(' ').toLowerCase();
  this.searchableContentAr = searchableFieldsAr.join(' ');
  
  // Update citation count
  this.citationCount = this.citations.length;
  
  // Update bookmark count
  this.bookmarkCount = this.annotations.filter(a => a.annotationType === 'bookmark').length;
  
  // Calculate average rating
  if (this.rating.ratings.length > 0) {
    const totalRating = this.rating.ratings.reduce((sum, r) => sum + r.rating, 0);
    this.rating.averageRating = totalRating / this.rating.ratings.length;
    this.rating.totalRatings = this.rating.ratings.length;
  }
  
  next();
});

// Static method to generate resource number
legalResourceSchema.statics.generateResourceNumber = async function(lawFirmId: mongoose.Types.ObjectId, resourceType: ResourceType) {
  const year = new Date().getFullYear();
  const typePrefix = resourceType.toUpperCase().substring(0, 3);
  const prefix = `LR-${typePrefix}-${year}-`;
  
  // Find the last resource for this year and type
  const lastResource = await this.findOne({
    lawFirmId,
    resourceType,
    resourceNumber: { $regex: `^${prefix}` }
  }).sort({ resourceNumber: -1 });
  
  let sequence = 1;
  if (lastResource) {
    const lastSequence = parseInt(lastResource.resourceNumber.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(6, '0')}`;
};

export const LegalResource = mongoose.model<LegalResourceDocument>('LegalResource', legalResourceSchema);
