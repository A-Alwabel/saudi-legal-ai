import mongoose, { Schema, Document } from 'mongoose';

export enum ReminderType {
  CASE_DEADLINE = 'case_deadline',
  COURT_HEARING = 'court_hearing',
  APPOINTMENT = 'appointment',
  TASK_DUE = 'task_due',
  DOCUMENT_EXPIRY = 'document_expiry',
  CONTRACT_RENEWAL = 'contract_renewal',
  LICENSE_RENEWAL = 'license_renewal',
  PAYMENT_DUE = 'payment_due',
  INVOICE_DUE = 'invoice_due',
  LEAVE_RETURN = 'leave_return',
  PERFORMANCE_REVIEW = 'performance_review',
  BIRTHDAY = 'birthday',
  ANNIVERSARY = 'anniversary',
  FOLLOW_UP = 'follow_up',
  CUSTOM = 'custom',
}

export enum ReminderStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  SNOOZED = 'snoozed',
}

export enum RecurrenceType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export interface IReminder {
  _id?: string;
  
  // Reminder identification
  reminderNumber: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  
  // Reminder classification
  type: ReminderType;
  status: ReminderStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Timing
  reminderDate: Date;
  dueDate?: Date;
  completedAt?: Date;
  
  // Snooze functionality
  snoozeUntil?: Date;
  snoozeCount: number;
  maxSnoozes: number;
  
  // Recurrence
  recurrence: {
    type: RecurrenceType;
    interval?: number; // Every X days/weeks/months
    daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc.
    dayOfMonth?: number; // Day of month for monthly recurrence
    endDate?: Date;
    maxOccurrences?: number;
  };
  
  // Recipients
  assignedTo: mongoose.Types.ObjectId[];
  createdFor?: mongoose.Types.ObjectId; // Specific user this reminder is for
  
  // Related entities
  relatedEntity?: {
    entityType: string; // Case, Task, Document, etc.
    entityId: mongoose.Types.ObjectId;
    entityTitle?: string;
  };
  
  // Notification settings
  notificationSettings: {
    methods: ('email' | 'sms' | 'push' | 'in_app')[];
    advanceNotifications: {
      enabled: boolean;
      intervals: number[]; // Minutes before reminder date
    };
    escalation: {
      enabled: boolean;
      escalateTo?: mongoose.Types.ObjectId[];
      escalateAfter: number; // Minutes after due time
    };
  };
  
  // Action items
  actionRequired: boolean;
  actionUrl?: string;
  actionNotes?: string;
  actionNotesAr?: string;
  
  // Completion tracking
  completionNotes?: string;
  completionNotesAr?: string;
  completedBy?: mongoose.Types.ObjectId;
  
  // Tags and categorization
  tags: string[];
  category?: string;
  
  // Location (for physical meetings/appointments)
  location?: {
    name: string;
    nameAr?: string;
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Attachments
  attachments: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
  }[];
  
  // Integration data
  integrationData?: {
    source: string; // calendar, task_manager, etc.
    externalId?: string;
    syncEnabled: boolean;
    lastSynced?: Date;
  };
  
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

export interface ReminderDocument extends IReminder, Document {}

const reminderSchema = new Schema<ReminderDocument>({
  // Reminder identification
  reminderNumber: {
    type: String,
    required: [true, 'Reminder number is required'],
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
  
  // Reminder classification
  type: {
    type: String,
    enum: Object.values(ReminderType),
    required: [true, 'Reminder type is required'],
  },
  status: {
    type: String,
    enum: Object.values(ReminderStatus),
    default: ReminderStatus.ACTIVE,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  
  // Timing
  reminderDate: {
    type: Date,
    required: [true, 'Reminder date is required'],
  },
  dueDate: Date,
  completedAt: Date,
  
  // Snooze functionality
  snoozeUntil: Date,
  snoozeCount: {
    type: Number,
    default: 0,
    min: [0, 'Snooze count cannot be negative'],
  },
  maxSnoozes: {
    type: Number,
    default: 3,
    min: [0, 'Max snoozes cannot be negative'],
  },
  
  // Recurrence
  recurrence: {
    type: {
      type: String,
      enum: Object.values(RecurrenceType),
      default: RecurrenceType.NONE,
    },
    interval: {
      type: Number,
      min: [1, 'Recurrence interval must be at least 1'],
    },
    daysOfWeek: [{
      type: Number,
      min: [0, 'Day of week must be 0-6'],
      max: [6, 'Day of week must be 0-6'],
    }],
    dayOfMonth: {
      type: Number,
      min: [1, 'Day of month must be 1-31'],
      max: [31, 'Day of month must be 1-31'],
    },
    endDate: Date,
    maxOccurrences: {
      type: Number,
      min: [1, 'Max occurrences must be at least 1'],
    },
  },
  
  // Recipients
  assignedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  createdFor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  
  // Related entities
  relatedEntity: {
    entityType: {
      type: String,
      trim: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },
    entityTitle: {
      type: String,
      trim: true,
    },
  },
  
  // Notification settings
  notificationSettings: {
    methods: [{
      type: String,
      enum: ['email', 'sms', 'push', 'in_app'],
      default: ['in_app', 'email'],
    }],
    advanceNotifications: {
      enabled: {
        type: Boolean,
        default: true,
      },
      intervals: [{
        type: Number,
        min: [1, 'Notification interval must be at least 1 minute'],
      }],
    },
    escalation: {
      enabled: {
        type: Boolean,
        default: false,
      },
      escalateTo: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
      }],
      escalateAfter: {
        type: Number,
        min: [1, 'Escalation time must be at least 1 minute'],
        default: 60, // 1 hour
      },
    },
  },
  
  // Action items
  actionRequired: {
    type: Boolean,
    default: false,
  },
  actionUrl: {
    type: String,
    trim: true,
  },
  actionNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Action notes cannot exceed 500 characters'],
  },
  actionNotesAr: {
    type: String,
    trim: true,
    maxlength: [500, 'Arabic action notes cannot exceed 500 characters'],
  },
  
  // Completion tracking
  completionNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Completion notes cannot exceed 1000 characters'],
  },
  completionNotesAr: {
    type: String,
    trim: true,
    maxlength: [1000, 'Arabic completion notes cannot exceed 1000 characters'],
  },
  completedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  
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
  
  // Location
  location: {
    name: {
      type: String,
      trim: true,
    },
    nameAr: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
      },
    },
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
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Integration data
  integrationData: {
    source: {
      type: String,
      trim: true,
    },
    externalId: {
      type: String,
      trim: true,
    },
    syncEnabled: {
      type: Boolean,
      default: false,
    },
    lastSynced: Date,
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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
reminderSchema.index({ lawFirmId: 1 });
reminderSchema.index({ reminderNumber: 1 }, { unique: true });
reminderSchema.index({ assignedTo: 1 });
reminderSchema.index({ reminderDate: 1 });
reminderSchema.index({ status: 1 });
reminderSchema.index({ type: 1 });
reminderSchema.index({ priority: 1 });

// Compound indexes
reminderSchema.index({ lawFirmId: 1, assignedTo: 1, status: 1 });
reminderSchema.index({ lawFirmId: 1, reminderDate: 1, status: 1 });
reminderSchema.index({ assignedTo: 1, reminderDate: 1 });
reminderSchema.index({ 'relatedEntity.entityType': 1, 'relatedEntity.entityId': 1 });

// Virtual for is overdue
reminderSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status !== ReminderStatus.ACTIVE) return false;
  return new Date() > this.dueDate;
});

// Virtual for is due soon (within next 24 hours)
reminderSchema.virtual('isDueSoon').get(function() {
  if (!this.reminderDate || this.status !== ReminderStatus.ACTIVE) return false;
  const now = new Date();
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return this.reminderDate <= twentyFourHoursFromNow && this.reminderDate > now;
});

// Virtual for can snooze
reminderSchema.virtual('canSnooze').get(function() {
  return this.status === ReminderStatus.ACTIVE && this.snoozeCount < this.maxSnoozes;
});

// Virtual for time until reminder
reminderSchema.virtual('timeUntilReminder').get(function() {
  if (this.status !== ReminderStatus.ACTIVE) return null;
  const now = new Date();
  const reminderTime = this.snoozeUntil || this.reminderDate;
  return reminderTime.getTime() - now.getTime();
});

// Pre-save middleware
reminderSchema.pre('save', function(next) {
  // Set default notification intervals if not provided
  if (!this.notificationSettings.advanceNotifications.intervals || 
      this.notificationSettings.advanceNotifications.intervals.length === 0) {
    this.notificationSettings.advanceNotifications.intervals = [15, 60, 1440]; // 15 min, 1 hour, 1 day
  }
  
  // Set due date same as reminder date if not provided
  if (!this.dueDate) {
    this.dueDate = this.reminderDate;
  }
  
  next();
});

// Static method to generate reminder number
reminderSchema.statics.generateReminderNumber = async function(lawFirmId: mongoose.Types.ObjectId) {
  const year = new Date().getFullYear();
  const prefix = `REM-${year}-`;
  
  // Find the last reminder for this year
  const lastReminder = await this.findOne({
    lawFirmId,
    reminderNumber: { $regex: `^${prefix}` }
  }).sort({ reminderNumber: -1 });
  
  let sequence = 1;
  if (lastReminder) {
    const lastSequence = parseInt(lastReminder.reminderNumber.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(6, '0')}`;
};

export const Reminder = mongoose.model<ReminderDocument>('Reminder', reminderSchema);
