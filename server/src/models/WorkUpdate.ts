import mongoose, { Schema, Document } from 'mongoose';

export enum UpdateType {
  CASE_UPDATE = 'case_update',
  PROJECT_UPDATE = 'project_update',
  TASK_UPDATE = 'task_update',
  MILESTONE_UPDATE = 'milestone_update',
  CLIENT_UPDATE = 'client_update',
  COURT_UPDATE = 'court_update',
  DOCUMENT_UPDATE = 'document_update',
  FINANCIAL_UPDATE = 'financial_update',
  GENERAL_UPDATE = 'general_update',
}

export enum UpdateStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SCHEDULED = 'scheduled',
  ARCHIVED = 'archived',
}

export enum UpdatePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface IWorkUpdate {
  _id?: string;
  
  // Update identification
  updateNumber: string;
  title: string;
  titleAr?: string;
  type: UpdateType;
  status: UpdateStatus;
  priority: UpdatePriority;
  
  // Content
  content: string;
  contentAr?: string;
  summary?: string;
  summaryAr?: string;
  
  // Related entities
  relatedCase?: mongoose.Types.ObjectId;
  relatedClient?: mongoose.Types.ObjectId;
  relatedTask?: mongoose.Types.ObjectId;
  relatedProject?: string;
  
  // Recipients and visibility
  recipients: {
    userId?: mongoose.Types.ObjectId;
    clientId?: mongoose.Types.ObjectId;
    email?: string;
    recipientType: 'internal' | 'client' | 'external';
    deliveryMethod: 'email' | 'sms' | 'in_app' | 'portal';
    isDelivered: boolean;
    deliveredAt?: Date;
    isRead: boolean;
    readAt?: Date;
  }[];
  
  // Scheduling
  publishedAt?: Date;
  scheduledFor?: Date;
  
  // Progress tracking
  progressInfo?: {
    currentPhase?: string;
    currentPhaseAr?: string;
    completionPercentage?: number;
    milestones: {
      name: string;
      nameAr?: string;
      targetDate?: Date;
      completedDate?: Date;
      status: 'pending' | 'in_progress' | 'completed' | 'delayed';
      description?: string;
      descriptionAr?: string;
    }[];
    nextSteps: string[];
    nextStepsAr: string[];
  };
  
  // Financial information (if applicable)
  financialInfo?: {
    budgetUsed?: number;
    budgetRemaining?: number;
    currency: string;
    expenses: {
      category: string;
      amount: number;
      date: Date;
      description?: string;
    }[];
    billing?: {
      hoursWorked?: number;
      hourlyRate?: number;
      totalAmount?: number;
      invoiceId?: mongoose.Types.ObjectId;
    };
  };
  
  // Timeline and deadlines
  timelineInfo?: {
    originalDeadline?: Date;
    currentDeadline?: Date;
    estimatedCompletion?: Date;
    actualCompletion?: Date;
    delays: {
      reason: string;
      reasonAr?: string;
      delayDays: number;
      reportedDate: Date;
      reportedBy: mongoose.Types.ObjectId;
    }[];
  };
  
  // Attachments and documents
  attachments: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
    isPublic: boolean;
    description?: string;
    descriptionAr?: string;
  }[];
  
  // Communication history
  communicationLog: {
    date: Date;
    method: 'email' | 'phone' | 'meeting' | 'sms' | 'whatsapp' | 'other';
    with: string; // Person or entity communicated with
    summary: string;
    summaryAr?: string;
    outcome?: string;
    outcomeAr?: string;
    followUpRequired: boolean;
    followUpDate?: Date;
  }[];
  
  // Approval workflow
  approvalWorkflow?: {
    isRequired: boolean;
    approvers: {
      userId: mongoose.Types.ObjectId;
      order: number;
      status: 'pending' | 'approved' | 'rejected';
      approvedAt?: Date;
      comments?: string;
      commentsAr?: string;
    }[];
    finalApproval?: {
      isApproved: boolean;
      approvedBy?: mongoose.Types.ObjectId;
      approvedAt?: Date;
      rejectionReason?: string;
      rejectionReasonAr?: string;
    };
  };
  
  // Client feedback
  clientFeedback?: {
    rating?: number; // 1-5 stars
    comments?: string;
    commentsAr?: string;
    submittedAt?: Date;
    isPublic: boolean;
    followUpRequired: boolean;
  };
  
  // Metrics and analytics
  metrics?: {
    views: number;
    uniqueViews: number;
    emailOpens: number;
    linkClicks: number;
    downloadCounts: {
      fileName: string;
      count: number;
    }[];
    clientSatisfactionScore?: number;
  };
  
  // Template and automation
  templateInfo?: {
    isTemplate: boolean;
    templateName?: string;
    templateNameAr?: string;
    isAutomated: boolean;
    automationRules?: {
      trigger: string;
      condition: string;
      action: string;
    }[];
  };
  
  // Categorization and tags
  tags: string[];
  categories: string[];
  
  // Notifications
  notificationSettings: {
    notifyOnPublish: boolean;
    notifyOnRead: boolean;
    notifyOnFeedback: boolean;
    reminderFrequency?: 'none' | 'daily' | 'weekly' | 'monthly';
    escalationRules?: {
      condition: string;
      escalateTo: mongoose.Types.ObjectId[];
      escalateAfterDays: number;
    }[];
  };
  
  // Version control
  version: number;
  previousVersions: {
    version: number;
    content: string;
    contentAr?: string;
    modifiedBy: mongoose.Types.ObjectId;
    modifiedAt: Date;
    changeReason?: string;
  }[];
  
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
  
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkUpdateDocument extends IWorkUpdate, Document {}

const workUpdateSchema = new Schema<WorkUpdateDocument>({
  // Update identification
  updateNumber: {
    type: String,
    required: [true, 'Update number is required'],
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
    enum: Object.values(UpdateType),
    required: [true, 'Update type is required'],
  },
  status: {
    type: String,
    enum: Object.values(UpdateStatus),
    default: UpdateStatus.DRAFT,
  },
  priority: {
    type: String,
    enum: Object.values(UpdatePriority),
    default: UpdatePriority.MEDIUM,
  },
  
  // Content
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
  },
  contentAr: {
    type: String,
    trim: true,
  },
  summary: {
    type: String,
    trim: true,
    maxlength: [500, 'Summary cannot exceed 500 characters'],
  },
  summaryAr: {
    type: String,
    trim: true,
    maxlength: [500, 'Arabic summary cannot exceed 500 characters'],
  },
  
  // Related entities
  relatedCase: {
    type: Schema.Types.ObjectId,
    ref: 'Case',
  },
  relatedClient: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
  },
  relatedTask: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
  },
  relatedProject: {
    type: String,
    trim: true,
  },
  
  // Recipients
  recipients: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    recipientType: {
      type: String,
      enum: ['internal', 'client', 'external'],
      required: true,
    },
    deliveryMethod: {
      type: String,
      enum: ['email', 'sms', 'in_app', 'portal'],
      required: true,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
  }],
  
  // Scheduling
  publishedAt: Date,
  scheduledFor: Date,
  
  // Progress tracking
  progressInfo: {
    currentPhase: {
      type: String,
      trim: true,
    },
    currentPhaseAr: {
      type: String,
      trim: true,
    },
    completionPercentage: {
      type: Number,
      min: [0, 'Completion percentage cannot be negative'],
      max: [100, 'Completion percentage cannot exceed 100'],
    },
    milestones: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      nameAr: {
        type: String,
        trim: true,
      },
      targetDate: Date,
      completedDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'delayed'],
        default: 'pending',
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
    nextSteps: [{
      type: String,
      trim: true,
    }],
    nextStepsAr: [{
      type: String,
      trim: true,
    }],
  },
  
  // Financial information
  financialInfo: {
    budgetUsed: {
      type: Number,
      min: [0, 'Budget used cannot be negative'],
    },
    budgetRemaining: {
      type: Number,
      min: [0, 'Budget remaining cannot be negative'],
    },
    currency: {
      type: String,
      default: 'SAR',
      uppercase: true,
    },
    expenses: [{
      category: {
        type: String,
        required: true,
        trim: true,
      },
      amount: {
        type: Number,
        required: true,
        min: [0, 'Expense amount cannot be negative'],
      },
      date: {
        type: Date,
        required: true,
      },
      description: {
        type: String,
        trim: true,
      },
    }],
    billing: {
      hoursWorked: {
        type: Number,
        min: [0, 'Hours worked cannot be negative'],
      },
      hourlyRate: {
        type: Number,
        min: [0, 'Hourly rate cannot be negative'],
      },
      totalAmount: {
        type: Number,
        min: [0, 'Total amount cannot be negative'],
      },
      invoiceId: {
        type: Schema.Types.ObjectId,
        ref: 'Invoice',
      },
    },
  },
  
  // Timeline information
  timelineInfo: {
    originalDeadline: Date,
    currentDeadline: Date,
    estimatedCompletion: Date,
    actualCompletion: Date,
    delays: [{
      reason: {
        type: String,
        required: true,
        trim: true,
      },
      reasonAr: {
        type: String,
        trim: true,
      },
      delayDays: {
        type: Number,
        required: true,
        min: [0, 'Delay days cannot be negative'],
      },
      reportedDate: {
        type: Date,
        required: true,
      },
      reportedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    }],
  },
  
  // Attachments
  attachments: [{
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
    fileType: {
      type: String,
      required: true,
      trim: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    isPublic: {
      type: Boolean,
      default: false,
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
  
  // Communication log
  communicationLog: [{
    date: {
      type: Date,
      required: true,
    },
    method: {
      type: String,
      enum: ['email', 'phone', 'meeting', 'sms', 'whatsapp', 'other'],
      required: true,
    },
    with: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    summaryAr: {
      type: String,
      trim: true,
    },
    outcome: {
      type: String,
      trim: true,
    },
    outcomeAr: {
      type: String,
      trim: true,
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: Date,
  }],
  
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
  
  // Client feedback
  clientFeedback: {
    rating: {
      type: Number,
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
    submittedAt: Date,
    isPublic: {
      type: Boolean,
      default: false,
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
  },
  
  // Metrics
  metrics: {
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative'],
    },
    uniqueViews: {
      type: Number,
      default: 0,
      min: [0, 'Unique views cannot be negative'],
    },
    emailOpens: {
      type: Number,
      default: 0,
      min: [0, 'Email opens cannot be negative'],
    },
    linkClicks: {
      type: Number,
      default: 0,
      min: [0, 'Link clicks cannot be negative'],
    },
    downloadCounts: [{
      fileName: {
        type: String,
        required: true,
      },
      count: {
        type: Number,
        default: 0,
        min: [0, 'Download count cannot be negative'],
      },
    }],
    clientSatisfactionScore: {
      type: Number,
      min: [0, 'Satisfaction score cannot be negative'],
      max: [100, 'Satisfaction score cannot exceed 100'],
    },
  },
  
  // Template information
  templateInfo: {
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
    isAutomated: {
      type: Boolean,
      default: false,
    },
    automationRules: [{
      trigger: {
        type: String,
        required: true,
        trim: true,
      },
      condition: {
        type: String,
        required: true,
        trim: true,
      },
      action: {
        type: String,
        required: true,
        trim: true,
      },
    }],
  },
  
  // Tags and categories
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  categories: [{
    type: String,
    trim: true,
  }],
  
  // Notification settings
  notificationSettings: {
    notifyOnPublish: {
      type: Boolean,
      default: true,
    },
    notifyOnRead: {
      type: Boolean,
      default: false,
    },
    notifyOnFeedback: {
      type: Boolean,
      default: true,
    },
    reminderFrequency: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none',
    },
    escalationRules: [{
      condition: {
        type: String,
        required: true,
        trim: true,
      },
      escalateTo: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
      }],
      escalateAfterDays: {
        type: Number,
        required: true,
        min: [1, 'Escalation days must be at least 1'],
      },
    }],
  },
  
  // Version control
  version: {
    type: Number,
    default: 1,
    min: [1, 'Version must be at least 1'],
  },
  previousVersions: [{
    version: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    contentAr: String,
    modifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    modifiedAt: {
      type: Date,
      required: true,
    },
    changeReason: {
      type: String,
      trim: true,
    },
  }],
  
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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
workUpdateSchema.index({ lawFirmId: 1 });
workUpdateSchema.index({ updateNumber: 1 }, { unique: true });
workUpdateSchema.index({ type: 1 });
workUpdateSchema.index({ status: 1 });
workUpdateSchema.index({ priority: 1 });
workUpdateSchema.index({ publishedAt: -1 });
workUpdateSchema.index({ relatedCase: 1 });
workUpdateSchema.index({ relatedClient: 1 });

// Compound indexes
workUpdateSchema.index({ lawFirmId: 1, status: 1 });
workUpdateSchema.index({ lawFirmId: 1, type: 1 });
workUpdateSchema.index({ createdBy: 1, publishedAt: -1 });
workUpdateSchema.index({ title: 'text', content: 'text', titleAr: 'text', contentAr: 'text' });

// Virtual for is published
workUpdateSchema.virtual('isPublished').get(function() {
  return this.status === UpdateStatus.PUBLISHED && this.publishedAt && this.publishedAt <= new Date();
});

// Virtual for is scheduled
workUpdateSchema.virtual('isScheduled').get(function() {
  return this.status === UpdateStatus.SCHEDULED && this.scheduledFor && this.scheduledFor > new Date();
});

// Virtual for read percentage
workUpdateSchema.virtual('readPercentage').get(function() {
  if (!this.recipients || this.recipients.length === 0) return 0;
  const readCount = this.recipients.filter(r => r.isRead).length;
  return Math.round((readCount / this.recipients.length) * 100);
});

// Pre-save middleware
workUpdateSchema.pre('save', function(next) {
  // Auto-publish if scheduled time has passed
  if (this.status === UpdateStatus.SCHEDULED && this.scheduledFor && this.scheduledFor <= new Date()) {
    this.status = UpdateStatus.PUBLISHED;
    this.publishedAt = new Date();
  }
  
  // Initialize metrics if not present
  if (!this.metrics) {
    this.metrics = {
      views: 0,
      uniqueViews: 0,
      emailOpens: 0,
      linkClicks: 0,
      downloadCounts: [],
    };
  }
  
  next();
});

// Static method to generate update number
workUpdateSchema.statics.generateUpdateNumber = async function(lawFirmId: mongoose.Types.ObjectId) {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const prefix = `UPD-${year}${month}-`;
  
  // Find the last update for this month
  const lastUpdate = await this.findOne({
    lawFirmId,
    updateNumber: { $regex: `^${prefix}` }
  }).sort({ updateNumber: -1 });
  
  let sequence = 1;
  if (lastUpdate) {
    const lastSequence = parseInt(lastUpdate.updateNumber.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(4, '0')}`;
};

export const WorkUpdate = mongoose.model<WorkUpdateDocument>('WorkUpdate', workUpdateSchema);
