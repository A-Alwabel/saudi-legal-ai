import mongoose, { Schema, Document } from 'mongoose';

export enum NotificationType {
  // Case notifications
  CASE_CREATED = 'case_created',
  CASE_UPDATED = 'case_updated',
  CASE_STATUS_CHANGED = 'case_status_changed',
  CASE_ASSIGNED = 'case_assigned',
  CASE_DEADLINE_APPROACHING = 'case_deadline_approaching',
  CASE_HEARING_SCHEDULED = 'case_hearing_scheduled',
  CASE_HEARING_REMINDER = 'case_hearing_reminder',
  CASE_DOCUMENT_ADDED = 'case_document_added',
  
  // Task notifications
  TASK_ASSIGNED = 'task_assigned',
  TASK_DUE_SOON = 'task_due_soon',
  TASK_OVERDUE = 'task_overdue',
  TASK_COMPLETED = 'task_completed',
  TASK_UPDATED = 'task_updated',
  
  // Appointment notifications
  APPOINTMENT_SCHEDULED = 'appointment_scheduled',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  APPOINTMENT_RESCHEDULED = 'appointment_rescheduled',
  
  // Document notifications
  DOCUMENT_SHARED = 'document_shared',
  DOCUMENT_UPDATED = 'document_updated',
  DOCUMENT_REVIEWED = 'document_reviewed',
  DOCUMENT_APPROVED = 'document_approved',
  DOCUMENT_REJECTED = 'document_rejected',
  
  // Financial notifications
  INVOICE_CREATED = 'invoice_created',
  INVOICE_OVERDUE = 'invoice_overdue',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_OVERDUE = 'payment_overdue',
  EXPENSE_SUBMITTED = 'expense_submitted',
  EXPENSE_APPROVED = 'expense_approved',
  
  // Employee notifications
  LEAVE_REQUEST_SUBMITTED = 'leave_request_submitted',
  LEAVE_REQUEST_APPROVED = 'leave_request_approved',
  LEAVE_REQUEST_REJECTED = 'leave_request_rejected',
  EMPLOYEE_BIRTHDAY = 'employee_birthday',
  EMPLOYEE_ANNIVERSARY = 'employee_anniversary',
  PERFORMANCE_REVIEW_DUE = 'performance_review_due',
  
  // Client notifications
  CLIENT_CREATED = 'client_created',
  CLIENT_UPDATED = 'client_updated',
  CLIENT_MESSAGE = 'client_message',
  CLIENT_PORTAL_ACCESS = 'client_portal_access',
  
  // System notifications
  SYSTEM_MAINTENANCE = 'system_maintenance',
  SYSTEM_UPDATE = 'system_update',
  BACKUP_COMPLETED = 'backup_completed',
  BACKUP_FAILED = 'backup_failed',
  
  // Legal library notifications
  LEGAL_RESOURCE_ADDED = 'legal_resource_added',
  LEGAL_RESOURCE_UPDATED = 'legal_resource_updated',
  LEGAL_RESOURCE_EXPIRING = 'legal_resource_expiring',
  
  // Archive notifications
  ARCHIVE_CREATED = 'archive_created',
  ARCHIVE_EXPIRING = 'archive_expiring',
  
  // General notifications
  REMINDER = 'reminder',
  ANNOUNCEMENT = 'announcement',
  ALERT = 'alert',
  WARNING = 'warning',
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum DeliveryMethod {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WHATSAPP = 'whatsapp',
}

export interface INotification {
  _id?: string;
  
  // Notification identification
  notificationId: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  
  // Recipients
  recipientId: mongoose.Types.ObjectId;
  recipientType: 'user' | 'role' | 'department' | 'branch' | 'all';
  
  // Content
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  
  // Rich content
  data?: any; // Additional data for the notification
  metadata?: {
    entityType?: string; // Case, Task, Document, etc.
    entityId?: mongoose.Types.ObjectId;
    actionUrl?: string; // Deep link to the relevant page
    imageUrl?: string;
    iconUrl?: string;
  };
  
  // Delivery settings
  deliveryMethods: DeliveryMethod[];
  scheduledFor?: Date; // For scheduled notifications
  expiresAt?: Date; // When the notification expires
  
  // Delivery tracking
  deliveryAttempts: {
    method: DeliveryMethod;
    attemptedAt: Date;
    status: 'success' | 'failed' | 'pending';
    errorMessage?: string;
    deliveredAt?: Date;
  }[];
  
  // User interaction
  readAt?: Date;
  clickedAt?: Date;
  actionTaken?: string;
  
  // Grouping and threading
  groupKey?: string; // For grouping similar notifications
  threadId?: string; // For threading related notifications
  parentNotificationId?: mongoose.Types.ObjectId;
  
  // Sender information
  senderId?: mongoose.Types.ObjectId;
  senderType?: 'user' | 'system' | 'automated';
  
  // Template and localization
  templateId?: string;
  language: 'ar' | 'en' | 'both';
  
  // Preferences and rules
  respectUserPreferences: boolean;
  bypassQuietHours: boolean;
  requireConfirmation: boolean;
  
  // Analytics
  impressions: number;
  clicks: number;
  
  // Law firm context
  lawFirmId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  departmentId?: string;
  
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

export interface NotificationDocument extends Omit<INotification, '_id'>, Document {}

const notificationSchema = new Schema<NotificationDocument>({
  // Notification identification
  notificationId: {
    type: String,
    required: [true, 'Notification ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: [true, 'Notification type is required'],
  },
  priority: {
    type: String,
    enum: Object.values(NotificationPriority),
    default: NotificationPriority.NORMAL,
  },
  status: {
    type: String,
    enum: Object.values(NotificationStatus),
    default: NotificationStatus.PENDING,
  },
  
  // Recipients
  recipientId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Recipient ID is required'],
  },
  recipientType: {
    type: String,
    enum: ['user', 'role', 'department', 'branch', 'all'],
    default: 'user',
  },
  
  // Content
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
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
  },
  messageAr: {
    type: String,
    trim: true,
    maxlength: [1000, 'Arabic message cannot exceed 1000 characters'],
  },
  
  // Rich content
  data: Schema.Types.Mixed,
  metadata: {
    entityType: {
      type: String,
      trim: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },
    actionUrl: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    iconUrl: {
      type: String,
      trim: true,
    },
  },
  
  // Delivery settings
  deliveryMethods: [{
    type: String,
    enum: Object.values(DeliveryMethod),
    required: true,
  }],
  scheduledFor: Date,
  expiresAt: Date,
  
  // Delivery tracking
  deliveryAttempts: [{
    method: {
      type: String,
      enum: Object.values(DeliveryMethod),
      required: true,
    },
    attemptedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'pending',
    },
    errorMessage: {
      type: String,
      trim: true,
    },
    deliveredAt: Date,
  }],
  
  // User interaction
  readAt: Date,
  clickedAt: Date,
  actionTaken: {
    type: String,
    trim: true,
  },
  
  // Grouping and threading
  groupKey: {
    type: String,
    trim: true,
    index: true,
  },
  threadId: {
    type: String,
    trim: true,
    index: true,
  },
  parentNotificationId: {
    type: Schema.Types.ObjectId,
    ref: 'Notification',
  },
  
  // Sender information
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  senderType: {
    type: String,
    enum: ['user', 'system', 'automated'],
    default: 'system',
  },
  
  // Template and localization
  templateId: {
    type: String,
    trim: true,
  },
  language: {
    type: String,
    enum: ['ar', 'en', 'both'],
    default: 'both',
  },
  
  // Preferences and rules
  respectUserPreferences: {
    type: Boolean,
    default: true,
  },
  bypassQuietHours: {
    type: Boolean,
    default: false,
  },
  requireConfirmation: {
    type: Boolean,
    default: false,
  },
  
  // Analytics
  impressions: {
    type: Number,
    default: 0,
    min: [0, 'Impressions cannot be negative'],
  },
  clicks: {
    type: Number,
    default: 0,
    min: [0, 'Clicks cannot be negative'],
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

// Notification Preferences Model
export interface INotificationPreference {
  _id?: string;
  
  userId: mongoose.Types.ObjectId;
  
  // General preferences
  enableNotifications: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    timezone: string;
    days: string[]; // ['monday', 'tuesday', ...]
  };
  
  // Delivery method preferences
  deliveryPreferences: {
    [key in NotificationType]?: {
      enabled: boolean;
      methods: DeliveryMethod[];
      priority: NotificationPriority;
    };
  };
  
  // Default delivery methods
  defaultMethods: DeliveryMethod[];
  
  // Frequency settings
  digestSettings: {
    enabled: boolean;
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    time?: string; // HH:MM for daily/weekly
    day?: string; // Day of week for weekly
  };
  
  // Grouping preferences
  groupSimilarNotifications: boolean;
  maxNotificationsPerGroup: number;
  
  // Language preference
  preferredLanguage: 'ar' | 'en' | 'auto';
  
  // Contact information for delivery
  contactInfo: {
    email?: string;
    phone?: string;
    whatsapp?: string;
  };
  
  // Law firm
  lawFirmId: mongoose.Types.ObjectId;
  
  // Audit trail
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferenceDocument extends Omit<INotificationPreference, '_id'>, Document {}

const notificationPreferenceSchema = new Schema<NotificationPreferenceDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true,
  },
  
  // General preferences
  enableNotifications: {
    type: Boolean,
    default: true,
  },
  quietHours: {
    enabled: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: String,
      default: '22:00',
      validate: {
        validator: function(v: string) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Start time must be in HH:MM format'
      }
    },
    endTime: {
      type: String,
      default: '08:00',
      validate: {
        validator: function(v: string) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'End time must be in HH:MM format'
      }
    },
    timezone: {
      type: String,
      default: 'Asia/Riyadh',
    },
    days: [{
      type: String,
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    }],
  },
  
  // Delivery method preferences
  deliveryPreferences: {
    type: Map,
    of: {
      enabled: {
        type: Boolean,
        default: true,
      },
      methods: [{
        type: String,
        enum: Object.values(DeliveryMethod),
      }],
      priority: {
        type: String,
        enum: Object.values(NotificationPriority),
        default: NotificationPriority.NORMAL,
      },
    },
    default: {},
  },
  
  // Default delivery methods
  defaultMethods: [{
    type: String,
    enum: Object.values(DeliveryMethod),
    default: [DeliveryMethod.IN_APP, DeliveryMethod.EMAIL],
  }],
  
  // Frequency settings
  digestSettings: {
    enabled: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ['immediate', 'hourly', 'daily', 'weekly'],
      default: 'immediate',
    },
    time: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Time must be in HH:MM format'
      }
    },
    day: {
      type: String,
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    },
  },
  
  // Grouping preferences
  groupSimilarNotifications: {
    type: Boolean,
    default: true,
  },
  maxNotificationsPerGroup: {
    type: Number,
    default: 5,
    min: [1, 'Max notifications per group must be at least 1'],
    max: [20, 'Max notifications per group cannot exceed 20'],
  },
  
  // Language preference
  preferredLanguage: {
    type: String,
    enum: ['ar', 'en', 'auto'],
    default: 'auto',
  },
  
  // Contact information for delivery
  contactInfo: {
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
  },
  
  // Law firm
  lawFirmId: {
    type: Schema.Types.ObjectId,
    ref: 'LawFirm',
    required: [true, 'Law firm is required'],
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
notificationSchema.index({ lawFirmId: 1 });
notificationSchema.index({ notificationId: 1 }, { unique: true });
notificationSchema.index({ recipientId: 1, status: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ groupKey: 1 });
notificationSchema.index({ threadId: 1 });

notificationPreferenceSchema.index({ userId: 1 }, { unique: true });
notificationPreferenceSchema.index({ lawFirmId: 1 });

// Compound indexes
notificationSchema.index({ lawFirmId: 1, recipientId: 1, status: 1 });
notificationSchema.index({ lawFirmId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, readAt: 1 });

// Virtual for is read
notificationSchema.virtual('isRead').get(function() {
  return !!this.readAt;
});

// Virtual for is clicked
notificationSchema.virtual('isClicked').get(function() {
  return !!this.clickedAt;
});

// Virtual for is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && new Date() > this.expiresAt;
});

// Virtual for click-through rate
notificationSchema.virtual('clickThroughRate').get(function() {
  return this.impressions > 0 ? (this.clicks / this.impressions) * 100 : 0;
});

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  // Set default delivery methods if not provided
  if (!this.deliveryMethods || this.deliveryMethods.length === 0) {
    this.deliveryMethods = [DeliveryMethod.IN_APP];
  }
  
  // Set scheduled for to now if not provided and status is pending
  if (!this.scheduledFor && this.status === NotificationStatus.PENDING) {
    this.scheduledFor = new Date();
  }
  
  next();
});

// Static method to generate notification ID
notificationSchema.statics.generateNotificationId = async function(lawFirmId: mongoose.Types.ObjectId) {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const prefix = `NOTIF-${year}${month}${day}-`;
  
  // Find the last notification for today
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  const lastNotification = await this.findOne({
    lawFirmId,
    createdAt: { $gte: startOfDay, $lte: endOfDay },
    notificationId: { $regex: `^${prefix}` }
  }).sort({ notificationId: -1 });
  
  let sequence = 1;
  if (lastNotification) {
    const lastSequence = parseInt(lastNotification.notificationId.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(6, '0')}`;
};

export const Notification = mongoose.model<NotificationDocument>('Notification', notificationSchema);
export const NotificationPreference = mongoose.model<NotificationPreferenceDocument>('NotificationPreference', notificationPreferenceSchema);