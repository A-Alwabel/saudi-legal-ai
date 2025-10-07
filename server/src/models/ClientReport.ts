import mongoose, { Schema, Document } from 'mongoose';

export enum ReportType {
  CASE_SUMMARY = 'case_summary',
  FINANCIAL_STATEMENT = 'financial_statement',
  PROGRESS_REPORT = 'progress_report',
  INVOICE_SUMMARY = 'invoice_summary',
  PAYMENT_HISTORY = 'payment_history',
  DOCUMENT_INVENTORY = 'document_inventory',
  TIME_TRACKING = 'time_tracking',
  EXPENSE_REPORT = 'expense_report',
  PERFORMANCE_METRICS = 'performance_metrics',
  COMPLIANCE_REPORT = 'compliance_report',
  CUSTOM_REPORT = 'custom_report',
}

export enum ReportStatus {
  DRAFT = 'draft',
  GENERATED = 'generated',
  SENT = 'sent',
  VIEWED = 'viewed',
  ARCHIVED = 'archived',
}

export enum ReportFrequency {
  ONE_TIME = 'one_time',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  CUSTOM = 'custom',
}

export interface IClientReport {
  _id?: string;
  
  // Report identification
  reportNumber: string;
  title: string;
  titleAr?: string;
  type: ReportType;
  status: ReportStatus;
  
  // Client information
  clientId: mongoose.Types.ObjectId;
  clientName: string;
  clientNameAr?: string;
  
  // Report scope and filters
  reportScope: {
    dateRange: {
      startDate: Date;
      endDate: Date;
    };
    includedCases?: mongoose.Types.ObjectId[];
    includedServices?: string[];
    includedCategories?: string[];
    customFilters?: {
      field: string;
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
      value: any;
    }[];
  };
  
  // Report content structure
  reportSections: {
    sectionId: string;
    sectionName: string;
    sectionNameAr?: string;
    order: number;
    isIncluded: boolean;
    customContent?: string;
    customContentAr?: string;
  }[];
  
  // Generated data
  reportData: {
    // Case information
    cases?: {
      caseId: mongoose.Types.ObjectId;
      caseNumber: string;
      title: string;
      titleAr?: string;
      status: string;
      statusAr?: string;
      startDate: Date;
      endDate?: Date;
      assignedLawyer: string;
      assignedLawyerAr?: string;
      progress: number;
      lastUpdate: Date;
    }[];
    
    // Financial data
    financial?: {
      totalBilled: number;
      totalPaid: number;
      totalOutstanding: number;
      currency: string;
      
      invoices: {
        invoiceId: mongoose.Types.ObjectId;
        invoiceNumber: string;
        date: Date;
        amount: number;
        status: string;
        dueDate?: Date;
      }[];
      
      payments: {
        paymentId?: mongoose.Types.ObjectId;
        date: Date;
        amount: number;
        method: string;
        reference?: string;
      }[];
      
      expenses: {
        expenseId?: mongoose.Types.ObjectId;
        date: Date;
        category: string;
        categoryAr?: string;
        amount: number;
        description: string;
        descriptionAr?: string;
      }[];
    };
    
    // Time tracking data
    timeTracking?: {
      totalHours: number;
      billableHours: number;
      nonBillableHours: number;
      
      breakdown: {
        date: Date;
        lawyer: string;
        lawyerAr?: string;
        activity: string;
        activityAr?: string;
        hours: number;
        rate?: number;
        amount?: number;
        isBillable: boolean;
      }[];
    };
    
    // Document data
    documents?: {
      totalDocuments: number;
      documentsByType: {
        type: string;
        typeAr?: string;
        count: number;
      }[];
      
      recentDocuments: {
        documentId: mongoose.Types.ObjectId;
        fileName: string;
        fileType: string;
        uploadDate: Date;
        uploadedBy: string;
        size: number;
      }[];
    };
    
    // Performance metrics
    performance?: {
      responseTime: {
        averageHours: number;
        medianHours: number;
      };
      
      milestones: {
        total: number;
        completed: number;
        onTime: number;
        delayed: number;
        completionRate: number;
      };
      
      clientSatisfaction?: {
        averageRating: number;
        totalReviews: number;
        lastReviewDate?: Date;
      };
    };
    
    // Compliance data
    compliance?: {
      deadlines: {
        total: number;
        met: number;
        missed: number;
        upcoming: number;
        complianceRate: number;
      };
      
      requirements: {
        requirementType: string;
        requirementTypeAr?: string;
        status: 'compliant' | 'non_compliant' | 'pending';
        lastCheck: Date;
        nextCheck?: Date;
      }[];
    };
    
    // Custom data fields
    customData?: {
      fieldName: string;
      fieldNameAr?: string;
      fieldType: 'text' | 'number' | 'date' | 'boolean' | 'array';
      value: any;
    }[];
  };
  
  // Report formatting and presentation
  formatting: {
    template: string;
    templateAr?: string;
    language: 'en' | 'ar' | 'both';
    currency: string;
    dateFormat: string;
    numberFormat: string;
    
    branding: {
      includeLogo: boolean;
      includeHeader: boolean;
      includeFooter: boolean;
      customStyling?: string;
    };
    
    charts: {
      chartType: 'bar' | 'pie' | 'line' | 'area' | 'table';
      dataSource: string;
      title: string;
      titleAr?: string;
      isIncluded: boolean;
    }[];
  };
  
  // Delivery and distribution
  delivery: {
    method: 'email' | 'portal' | 'download' | 'print';
    recipients: {
      recipientType: 'client' | 'lawyer' | 'manager' | 'external';
      name: string;
      nameAr?: string;
      email?: string;
      phone?: string;
      deliveryMethod: 'email' | 'sms' | 'portal';
      isDelivered: boolean;
      deliveredAt?: Date;
      viewedAt?: Date;
      downloadedAt?: Date;
    }[];
    
    schedule?: {
      frequency: ReportFrequency;
      nextDelivery?: Date;
      lastDelivery?: Date;
      customSchedule?: string;
      isActive: boolean;
    };
  };
  
  // Generated files
  generatedFiles: {
    fileType: 'pdf' | 'excel' | 'word' | 'html';
    fileName: string;
    fileUrl: string;
    fileSize: number;
    generatedAt: Date;
    expiresAt?: Date;
    downloadCount: number;
    password?: string;
  }[];
  
  // Report analytics
  analytics: {
    generationTime: number; // milliseconds
    fileSize: number;
    viewCount: number;
    downloadCount: number;
    shareCount: number;
    
    viewHistory: {
      viewedBy: mongoose.Types.ObjectId;
      viewedAt: Date;
      ipAddress?: string;
      userAgent?: string;
      duration?: number; // seconds
    }[];
    
    feedback?: {
      rating: number;
      comments?: string;
      commentsAr?: string;
      submittedBy: mongoose.Types.ObjectId;
      submittedAt: Date;
    }[];
  };
  
  // Automation and templates
  automation?: {
    isTemplate: boolean;
    templateName?: string;
    templateNameAr?: string;
    
    triggers: {
      triggerType: 'date' | 'event' | 'condition';
      triggerValue: string;
      isActive: boolean;
    }[];
    
    autoGenerate: boolean;
    autoDeliver: boolean;
    autoArchive: boolean;
    autoArchiveAfterDays?: number;
  };
  
  // Approval workflow
  approvalWorkflow?: {
    isRequired: boolean;
    
    approvers: {
      userId: mongoose.Types.ObjectId;
      role: string;
      order: number;
      status: 'pending' | 'approved' | 'rejected';
      approvedAt?: Date;
      comments?: string;
      commentsAr?: string;
    }[];
    
    finalApproval: {
      isApproved: boolean;
      approvedBy?: mongoose.Types.ObjectId;
      approvedAt?: Date;
      rejectionReason?: string;
      rejectionReasonAr?: string;
    };
  };
  
  // Security and access control
  security: {
    accessLevel: 'public' | 'client_only' | 'internal' | 'confidential';
    passwordProtected: boolean;
    expirationDate?: Date;
    downloadLimit?: number;
    
    accessLog: {
      accessedBy: mongoose.Types.ObjectId;
      accessType: 'view' | 'download' | 'share';
      accessedAt: Date;
      ipAddress?: string;
      success: boolean;
    }[];
  };
  
  // Related entities
  relatedCases: mongoose.Types.ObjectId[];
  relatedInvoices: mongoose.Types.ObjectId[];
  relatedDocuments: mongoose.Types.ObjectId[];
  
  // Tags and categorization
  tags: string[];
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Law firm context
  lawFirmId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  departmentId?: string;
  
  // Additional metadata
  notes?: string;
  notesAr?: string;
  internalNotes?: string;
  
  // System fields
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  
  // Audit trail
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  generatedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
  generatedAt?: Date;
}

export interface ClientReportDocument extends IClientReport, Document {}

const clientReportSchema = new Schema<ClientReportDocument>({
  // Report identification
  reportNumber: {
    type: String,
    required: [true, 'Report number is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  titleAr: {
    type: String,
    trim: true,
    maxlength: [200, 'Arabic title cannot exceed 200 characters'],
  },
  type: {
    type: String,
    enum: Object.values(ReportType),
    required: [true, 'Report type is required'],
  },
  status: {
    type: String,
    enum: Object.values(ReportStatus),
    default: ReportStatus.DRAFT,
  },
  
  // Client information
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required'],
  },
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
  },
  clientNameAr: {
    type: String,
    trim: true,
  },
  
  // Report scope
  reportScope: {
    dateRange: {
      startDate: {
        type: Date,
        required: [true, 'Start date is required'],
      },
      endDate: {
        type: Date,
        required: [true, 'End date is required'],
      },
    },
    includedCases: [{
      type: Schema.Types.ObjectId,
      ref: 'Case',
    }],
    includedServices: [{
      type: String,
      trim: true,
    }],
    includedCategories: [{
      type: String,
      trim: true,
    }],
    customFilters: [{
      field: {
        type: String,
        required: true,
        trim: true,
      },
      operator: {
        type: String,
        enum: ['equals', 'contains', 'greater_than', 'less_than', 'between'],
        required: true,
      },
      value: Schema.Types.Mixed,
    }],
  },
  
  // Report sections
  reportSections: [{
    sectionId: {
      type: String,
      required: true,
      trim: true,
    },
    sectionName: {
      type: String,
      required: true,
      trim: true,
    },
    sectionNameAr: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      min: [1, 'Order must be at least 1'],
    },
    isIncluded: {
      type: Boolean,
      default: true,
    },
    customContent: {
      type: String,
      trim: true,
    },
    customContentAr: {
      type: String,
      trim: true,
    },
  }],
  
  // Generated data (stored as mixed for flexibility)
  reportData: {
    type: Schema.Types.Mixed,
    default: {},
  },
  
  // Formatting
  formatting: {
    template: {
      type: String,
      default: 'default',
      trim: true,
    },
    templateAr: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      enum: ['en', 'ar', 'both'],
      default: 'en',
    },
    currency: {
      type: String,
      default: 'SAR',
      uppercase: true,
    },
    dateFormat: {
      type: String,
      default: 'YYYY-MM-DD',
    },
    numberFormat: {
      type: String,
      default: '#,##0.00',
    },
    
    branding: {
      includeLogo: {
        type: Boolean,
        default: true,
      },
      includeHeader: {
        type: Boolean,
        default: true,
      },
      includeFooter: {
        type: Boolean,
        default: true,
      },
      customStyling: {
        type: String,
        trim: true,
      },
    },
    
    charts: [{
      chartType: {
        type: String,
        enum: ['bar', 'pie', 'line', 'area', 'table'],
        required: true,
      },
      dataSource: {
        type: String,
        required: true,
        trim: true,
      },
      title: {
        type: String,
        required: true,
        trim: true,
      },
      titleAr: {
        type: String,
        trim: true,
      },
      isIncluded: {
        type: Boolean,
        default: true,
      },
    }],
  },
  
  // Delivery
  delivery: {
    method: {
      type: String,
      enum: ['email', 'portal', 'download', 'print'],
      default: 'email',
    },
    recipients: [{
      recipientType: {
        type: String,
        enum: ['client', 'lawyer', 'manager', 'external'],
        required: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      nameAr: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      deliveryMethod: {
        type: String,
        enum: ['email', 'sms', 'portal'],
        required: true,
      },
      isDelivered: {
        type: Boolean,
        default: false,
      },
      deliveredAt: Date,
      viewedAt: Date,
      downloadedAt: Date,
    }],
    
    schedule: {
      frequency: {
        type: String,
        enum: Object.values(ReportFrequency),
        default: ReportFrequency.ONE_TIME,
      },
      nextDelivery: Date,
      lastDelivery: Date,
      customSchedule: {
        type: String,
        trim: true,
      },
      isActive: {
        type: Boolean,
        default: false,
      },
    },
  },
  
  // Generated files
  generatedFiles: [{
    fileType: {
      type: String,
      enum: ['pdf', 'excel', 'word', 'html'],
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: [0, 'File size cannot be negative'],
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: Date,
    downloadCount: {
      type: Number,
      default: 0,
      min: [0, 'Download count cannot be negative'],
    },
    password: {
      type: String,
      trim: true,
    },
  }],
  
  // Analytics
  analytics: {
    generationTime: {
      type: Number,
      default: 0,
      min: [0, 'Generation time cannot be negative'],
    },
    fileSize: {
      type: Number,
      default: 0,
      min: [0, 'File size cannot be negative'],
    },
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
    shareCount: {
      type: Number,
      default: 0,
      min: [0, 'Share count cannot be negative'],
    },
    
    viewHistory: [{
      viewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      viewedAt: {
        type: Date,
        required: true,
      },
      ipAddress: {
        type: String,
        trim: true,
      },
      userAgent: {
        type: String,
        trim: true,
      },
      duration: {
        type: Number,
        min: [0, 'Duration cannot be negative'],
      },
    }],
    
    feedback: [{
      rating: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
      },
      comments: {
        type: String,
        trim: true,
      },
      commentsAr: {
        type: String,
        trim: true,
      },
      submittedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      submittedAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  
  // Automation
  automation: {
    isTemplate: {
      type: Boolean,
      default: false,
    },
    templateName: {
      type: String,
      trim: true,
    },
    templateNameAr: {
      type: String,
      trim: true,
    },
    
    triggers: [{
      triggerType: {
        type: String,
        enum: ['date', 'event', 'condition'],
        required: true,
      },
      triggerValue: {
        type: String,
        required: true,
        trim: true,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    }],
    
    autoGenerate: {
      type: Boolean,
      default: false,
    },
    autoDeliver: {
      type: Boolean,
      default: false,
    },
    autoArchive: {
      type: Boolean,
      default: false,
    },
    autoArchiveAfterDays: {
      type: Number,
      min: [1, 'Auto archive days must be at least 1'],
    },
  },
  
  // Approval workflow
  approvalWorkflow: {
    isRequired: {
      type: Boolean,
      default: false,
    },
    
    approvers: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      role: {
        type: String,
        required: true,
        trim: true,
      },
      order: {
        type: Number,
        required: true,
        min: [1, 'Order must be at least 1'],
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      approvedAt: Date,
      comments: {
        type: String,
        trim: true,
      },
      commentsAr: {
        type: String,
        trim: true,
      },
    }],
    
    finalApproval: {
      isApproved: {
        type: Boolean,
        default: false,
      },
      approvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      approvedAt: Date,
      rejectionReason: {
        type: String,
        trim: true,
      },
      rejectionReasonAr: {
        type: String,
        trim: true,
      },
    },
  },
  
  // Security
  security: {
    accessLevel: {
      type: String,
      enum: ['public', 'client_only', 'internal', 'confidential'],
      default: 'client_only',
    },
    passwordProtected: {
      type: Boolean,
      default: false,
    },
    expirationDate: Date,
    downloadLimit: {
      type: Number,
      min: [1, 'Download limit must be at least 1'],
    },
    
    accessLog: [{
      accessedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      accessType: {
        type: String,
        enum: ['view', 'download', 'share'],
        required: true,
      },
      accessedAt: {
        type: Date,
        required: true,
      },
      ipAddress: {
        type: String,
        trim: true,
      },
      success: {
        type: Boolean,
        required: true,
      },
    }],
  },
  
  // Related entities
  relatedCases: [{
    type: Schema.Types.ObjectId,
    ref: 'Case',
  }],
  relatedInvoices: [{
    type: Schema.Types.ObjectId,
    ref: 'Invoice',
  }],
  relatedDocuments: [{
    type: Schema.Types.ObjectId,
    ref: 'Document',
  }],
  
  // Tags and categorization
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  category: {
    type: String,
    trim: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  
  // Law firm context
  lawFirmId: {
    type: Schema.Types.ObjectId,
    ref: 'LawFirm',
    required: [true, 'Law firm is required'],
  },
  branchId: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
  },
  departmentId: {
    type: String,
    trim: true,
  },
  
  // Additional metadata
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
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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
  generatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  
  generatedAt: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
clientReportSchema.index({ lawFirmId: 1 });
clientReportSchema.index({ reportNumber: 1 }, { unique: true });
clientReportSchema.index({ clientId: 1 });
clientReportSchema.index({ type: 1 });
clientReportSchema.index({ status: 1 });
clientReportSchema.index({ generatedAt: -1 });
clientReportSchema.index({ 'reportScope.dateRange.startDate': 1 });
clientReportSchema.index({ 'reportScope.dateRange.endDate': 1 });

// Compound indexes
clientReportSchema.index({ lawFirmId: 1, clientId: 1 });
clientReportSchema.index({ lawFirmId: 1, status: 1 });
clientReportSchema.index({ clientId: 1, type: 1 });

// Virtual for is expired
clientReportSchema.virtual('isExpired').get(function() {
  return this.security?.expirationDate && this.security.expirationDate < new Date();
});

// Virtual for days since generated
clientReportSchema.virtual('daysSinceGenerated').get(function() {
  if (!this.generatedAt) return null;
  return Math.ceil((new Date().getTime() - this.generatedAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual for total file size
clientReportSchema.virtual('totalFileSize').get(function() {
  return this.generatedFiles?.reduce((total, file) => total + file.fileSize, 0) || 0;
});

// Pre-save middleware
clientReportSchema.pre('save', function(next) {
  // Validate date range
  if (this.reportScope?.dateRange) {
    if (this.reportScope.dateRange.endDate <= this.reportScope.dateRange.startDate) {
      next(new Error('End date must be after start date'));
      return;
    }
  }
  
  // Set generated timestamp when status changes to generated
  if (this.isModified('status') && this.status === ReportStatus.GENERATED && !this.generatedAt) {
    this.generatedAt = new Date();
  }
  
  next();
});

// Static method to generate report number
clientReportSchema.statics.generateReportNumber = async function(lawFirmId: mongoose.Types.ObjectId, reportType: ReportType) {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const typePrefix = reportType.toUpperCase().substring(0, 3);
  const prefix = `RPT-${typePrefix}-${year}${month}-`;
  
  // Find the last report for this month and type
  const lastReport = await this.findOne({
    lawFirmId,
    type: reportType,
    reportNumber: { $regex: `^${prefix}` }
  }).sort({ reportNumber: -1 });
  
  let sequence = 1;
  if (lastReport) {
    const lastSequence = parseInt(lastReport.reportNumber.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(4, '0')}`;
};

export const ClientReport = mongoose.model<ClientReportDocument>('ClientReport', clientReportSchema);
