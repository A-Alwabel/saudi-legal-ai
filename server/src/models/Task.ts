import mongoose, { Schema, Document } from 'mongoose';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  UNDER_REVIEW = 'under_review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskType {
  LEGAL_RESEARCH = 'legal_research',
  DOCUMENT_PREPARATION = 'document_preparation',
  CLIENT_FOLLOW_UP = 'client_follow_up',
  COURT_PREPARATION = 'court_preparation',
  CASE_ANALYSIS = 'case_analysis',
  CONTRACT_REVIEW = 'contract_review',
  MEETING_PREPARATION = 'meeting_preparation',
  ADMINISTRATIVE = 'administrative',
  OTHER = 'other',
}

export interface ITask {
  _id?: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  taskType: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  
  // Assignment
  assignedTo: mongoose.Types.ObjectId; // User assigned to task
  assignedBy: mongoose.Types.ObjectId; // User who assigned the task
  
  // Dates
  dueDate?: Date;
  startDate?: Date;
  completedDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  
  // Related entities
  caseId?: mongoose.Types.ObjectId;
  clientId?: mongoose.Types.ObjectId;
  lawFirmId: mongoose.Types.ObjectId;
  
  // Task details
  checklist?: {
    item: string;
    completed: boolean;
    completedAt?: Date;
    completedBy?: mongoose.Types.ObjectId;
  }[];
  
  attachments?: string[];
  tags?: string[];
  
  // Dependencies
  dependencies?: mongoose.Types.ObjectId[]; // Other tasks that must be completed first
  dependents?: mongoose.Types.ObjectId[]; // Tasks that depend on this one
  
  // Collaboration
  watchers?: mongoose.Types.ObjectId[]; // Users watching this task
  comments?: {
    content: string;
    author: mongoose.Types.ObjectId;
    createdAt: Date;
    isInternal: boolean; // Internal comment or visible to client
  }[];
  
  // Progress tracking
  progressPercentage: number;
  
  // Recurrence (for recurring tasks)
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    nextDueDate?: Date;
  };
  
  // Approval workflow
  requiresApproval: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
  
  // Time tracking
  timeEntries?: {
    user: mongoose.Types.ObjectId;
    startTime: Date;
    endTime?: Date;
    duration?: number; // in minutes
    description?: string;
    billable: boolean;
  }[];
  
  // Notifications
  reminderSent: boolean;
  reminderDate?: Date;
  
  // Metadata
  isTemplate: boolean;
  templateName?: string;
  isArchived: boolean;
  archivedAt?: Date;
  archivedBy?: mongoose.Types.ObjectId;
  
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskDocument extends ITask, Document {}

const taskSchema = new Schema<TaskDocument>({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
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
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  descriptionAr: {
    type: String,
    trim: true,
    maxlength: [2000, 'Arabic description cannot exceed 2000 characters'],
  },
  taskType: {
    type: String,
    enum: Object.values(TaskType),
    required: [true, 'Task type is required'],
  },
  status: {
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.TODO,
    required: true,
  },
  priority: {
    type: String,
    enum: Object.values(TaskPriority),
    default: TaskPriority.MEDIUM,
    required: true,
  },
  
  // Assignment
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must be assigned to someone'],
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigner is required'],
  },
  
  // Dates
  dueDate: Date,
  startDate: Date,
  completedDate: Date,
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative'],
    max: [1000, 'Estimated hours cannot exceed 1000'],
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative'],
  },
  
  // Related entities
  caseId: {
    type: Schema.Types.ObjectId,
    ref: 'Case',
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
  },
  lawFirmId: {
    type: Schema.Types.ObjectId,
    ref: 'LawFirm',
    required: [true, 'Law firm is required'],
  },
  
  // Task details
  checklist: [{
    item: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Checklist item cannot exceed 500 characters'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  
  attachments: [String],
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters'],
  }],
  
  // Dependencies
  dependencies: [{
    type: Schema.Types.ObjectId,
    ref: 'Task',
  }],
  dependents: [{
    type: Schema.Types.ObjectId,
    ref: 'Task',
  }],
  
  // Collaboration
  watchers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [{
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isInternal: {
      type: Boolean,
      default: true,
    },
  }],
  
  // Progress tracking
  progressPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Progress cannot be less than 0%'],
    max: [100, 'Progress cannot exceed 100%'],
  },
  
  // Recurrence
  recurring: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    interval: {
      type: Number,
      min: [1, 'Interval must be at least 1'],
    },
    endDate: Date,
    nextDueDate: Date,
  },
  
  // Approval workflow
  requiresApproval: {
    type: Boolean,
    default: false,
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: Date,
  rejectedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  rejectedAt: Date,
  rejectionReason: String,
  
  // Time tracking
  timeEntries: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: Date,
    duration: {
      type: Number, // in minutes
      min: [0, 'Duration cannot be negative'],
    },
    description: String,
    billable: {
      type: Boolean,
      default: true,
    },
  }],
  
  // Notifications
  reminderSent: {
    type: Boolean,
    default: false,
  },
  reminderDate: Date,
  
  // Metadata
  isTemplate: {
    type: Boolean,
    default: false,
  },
  templateName: String,
  isArchived: {
    type: Boolean,
    default: false,
  },
  archivedAt: Date,
  archivedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  
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
taskSchema.index({ lawFirmId: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ assignedBy: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ caseId: 1 });
taskSchema.index({ clientId: 1 });
taskSchema.index({ taskType: 1 });
taskSchema.index({ isArchived: 1 });

// Compound indexes
taskSchema.index({ lawFirmId: 1, assignedTo: 1, status: 1 });
taskSchema.index({ lawFirmId: 1, dueDate: 1, status: 1 });
taskSchema.index({ lawFirmId: 1, priority: 1, status: 1 });

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === TaskStatus.COMPLETED || this.status === TaskStatus.CANCELLED) {
    return false;
  }
  return new Date() > this.dueDate;
});

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const today = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for total time spent
taskSchema.virtual('totalTimeSpent').get(function() {
  if (!this.timeEntries || this.timeEntries.length === 0) return 0;
  return this.timeEntries.reduce((total, entry) => {
    return total + (entry.duration || 0);
  }, 0);
});

// Virtual for completion percentage based on checklist
taskSchema.virtual('checklistProgress').get(function() {
  if (!this.checklist || this.checklist.length === 0) return 0;
  const completed = this.checklist.filter(item => item.completed).length;
  return Math.round((completed / this.checklist.length) * 100);
});

// Pre-save middleware
taskSchema.pre('save', function(next) {
  // Auto-update progress based on status
  if (this.status === TaskStatus.COMPLETED) {
    this.progressPercentage = 100;
    if (!this.completedDate) {
      this.completedDate = new Date();
    }
  } else if (this.status === TaskStatus.TODO) {
    this.progressPercentage = 0;
    this.completedDate = undefined;
  }
  
  // Update progress based on checklist if available
  if (this.checklist && this.checklist.length > 0 && this.status !== TaskStatus.COMPLETED) {
    const completed = this.checklist.filter(item => item.completed).length;
    this.progressPercentage = Math.round((completed / this.checklist.length) * 100);
  }
  
  next();
});

export const Task = mongoose.model<TaskDocument>('Task', taskSchema);

