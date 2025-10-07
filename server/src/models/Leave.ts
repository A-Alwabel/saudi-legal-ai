import mongoose, { Schema, Document } from 'mongoose';

export enum LeaveType {
  ANNUAL = 'annual', // Annual vacation leave
  SICK = 'sick', // Sick leave
  MATERNITY = 'maternity', // Maternity leave
  PATERNITY = 'paternity', // Paternity leave
  HAJJ = 'hajj', // Hajj pilgrimage leave (Saudi specific)
  EMERGENCY = 'emergency', // Emergency leave
  BEREAVEMENT = 'bereavement', // Bereavement leave
  MARRIAGE = 'marriage', // Marriage leave
  STUDY = 'study', // Study leave
  UNPAID = 'unpaid', // Unpaid leave
  COMPENSATORY = 'compensatory', // Compensatory time off
  OTHER = 'other', // Other types of leave
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface ILeave {
  _id?: string;
  
  // Leave identification
  leaveNumber: string;
  
  // Employee information
  employeeId: mongoose.Types.ObjectId;
  
  // Leave details
  leaveType: LeaveType;
  status: LeaveStatus;
  
  // Dates and duration
  startDate: Date;
  endDate: Date;
  totalDays: number;
  workingDaysOnly: boolean; // Exclude weekends and holidays
  actualWorkingDays?: number; // Calculated working days
  
  // Half-day options
  isHalfDay: boolean;
  halfDayPeriod?: 'morning' | 'afternoon';
  
  // Reason and documentation
  reason: string;
  reasonAr?: string;
  description?: string;
  descriptionAr?: string;
  medicalCertificate?: boolean; // Required for sick leave
  attachments?: string[]; // Supporting documents
  
  // Approval workflow
  requestedDate: Date;
  submittedBy: mongoose.Types.ObjectId;
  
  // Approval chain
  approvalChain: {
    approver: mongoose.Types.ObjectId;
    level: number; // 1, 2, 3 for multi-level approval
    status: 'pending' | 'approved' | 'rejected';
    approvedAt?: Date;
    comments?: string;
  }[];
  
  finalApprover?: mongoose.Types.ObjectId;
  finalApprovalDate?: Date;
  
  // Rejection details
  rejectedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
  
  // Cancellation details
  cancelledBy?: mongoose.Types.ObjectId;
  cancelledAt?: Date;
  cancellationReason?: string;
  
  // Coverage arrangements
  coveringEmployees?: {
    employeeId: mongoose.Types.ObjectId;
    responsibilities: string[];
    acknowledged: boolean;
    acknowledgedAt?: Date;
  }[];
  
  // Leave balance impact
  balanceDeduction: {
    leaveType: LeaveType;
    daysDeducted: number;
    remainingBalance: number;
  };
  
  // Return to work
  returnDate?: Date;
  actualReturnDate?: Date;
  returnNotes?: string;
  
  // Emergency contact (for extended leaves)
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  
  // Recurring leave (for annual patterns)
  recurring?: {
    frequency: 'yearly' | 'monthly';
    nextLeaveDate?: Date;
  };
  
  // Law firm
  lawFirmId: mongoose.Types.ObjectId;
  
  // Additional information
  notes?: string;
  notesAr?: string;
  internalNotes?: string; // HR notes, not visible to employee
  
  // Audit trail
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveDocument extends ILeave, Document {}

const leaveSchema = new Schema<LeaveDocument>({
  // Leave identification
  leaveNumber: {
    type: String,
    required: [true, 'Leave number is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  
  // Employee information
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee is required'],
  },
  
  // Leave details
  leaveType: {
    type: String,
    enum: Object.values(LeaveType),
    required: [true, 'Leave type is required'],
  },
  status: {
    type: String,
    enum: Object.values(LeaveStatus),
    default: LeaveStatus.PENDING,
    required: true,
  },
  
  // Dates and duration
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  totalDays: {
    type: Number,
    required: [true, 'Total days is required'],
    min: [0, 'Total days cannot be negative'],
  },
  workingDaysOnly: {
    type: Boolean,
    default: true,
  },
  actualWorkingDays: {
    type: Number,
    min: [0, 'Working days cannot be negative'],
  },
  
  // Half-day options
  isHalfDay: {
    type: Boolean,
    default: false,
  },
  halfDayPeriod: {
    type: String,
    enum: ['morning', 'afternoon'],
  },
  
  // Reason and documentation
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters'],
  },
  reasonAr: {
    type: String,
    trim: true,
    maxlength: [500, 'Arabic reason cannot exceed 500 characters'],
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
  medicalCertificate: {
    type: Boolean,
    default: false,
  },
  attachments: {
    type: [String],
    default: [],
  },
  
  // Approval workflow
  requestedDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  submittedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Submitter is required'],
  },
  
  // Approval chain
  approvalChain: [{
    approver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    level: {
      type: Number,
      required: true,
      min: [1, 'Approval level must be at least 1'],
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
      maxlength: [500, 'Comments cannot exceed 500 characters'],
    },
  }],
  
  finalApprover: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  finalApprovalDate: Date,
  
  // Rejection details
  rejectedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  rejectedAt: Date,
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
  },
  
  // Cancellation details
  cancelledBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  cancelledAt: Date,
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters'],
  },
  
  // Coverage arrangements
  coveringEmployees: [{
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    responsibilities: [{
      type: String,
      trim: true,
      maxlength: [200, 'Responsibility cannot exceed 200 characters'],
    }],
    acknowledged: {
      type: Boolean,
      default: false,
    },
    acknowledgedAt: Date,
  }],
  
  // Leave balance impact
  balanceDeduction: {
    leaveType: {
      type: String,
      enum: Object.values(LeaveType),
      required: true,
    },
    daysDeducted: {
      type: Number,
      required: true,
      min: [0, 'Days deducted cannot be negative'],
    },
    remainingBalance: {
      type: Number,
      required: true,
      min: [0, 'Remaining balance cannot be negative'],
    },
  },
  
  // Return to work
  returnDate: Date,
  actualReturnDate: Date,
  returnNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Return notes cannot exceed 500 characters'],
  },
  
  // Emergency contact
  emergencyContact: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    relationship: {
      type: String,
      trim: true,
      maxlength: [50, 'Relationship cannot exceed 50 characters'],
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  
  // Recurring leave
  recurring: {
    frequency: {
      type: String,
      enum: ['yearly', 'monthly'],
    },
    nextLeaveDate: Date,
  },
  
  // Law firm
  lawFirmId: {
    type: Schema.Types.ObjectId,
    ref: 'LawFirm',
    required: [true, 'Law firm is required'],
  },
  
  // Additional information
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
  internalNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Internal notes cannot exceed 1000 characters'],
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

// Leave Balance Schema (separate collection for tracking balances)
export interface ILeaveBalance {
  _id?: string;
  employeeId: mongoose.Types.ObjectId;
  lawFirmId: mongoose.Types.ObjectId;
  year: number;
  
  balances: {
    leaveType: LeaveType;
    entitled: number; // Total entitled days per year
    used: number; // Days used so far
    pending: number; // Days in pending requests
    remaining: number; // Available days
    carried: number; // Carried over from previous year
    expires?: Date; // Expiry date for carried over days
  }[];
  
  lastUpdated: Date;
  updatedBy: mongoose.Types.ObjectId;
}

export interface LeaveBalanceDocument extends ILeaveBalance, Document {}

const leaveBalanceSchema = new Schema<LeaveBalanceDocument>({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee is required'],
  },
  lawFirmId: {
    type: Schema.Types.ObjectId,
    ref: 'LawFirm',
    required: [true, 'Law firm is required'],
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2020, 'Year must be 2020 or later'],
  },
  
  balances: [{
    leaveType: {
      type: String,
      enum: Object.values(LeaveType),
      required: true,
    },
    entitled: {
      type: Number,
      required: true,
      min: [0, 'Entitled days cannot be negative'],
    },
    used: {
      type: Number,
      default: 0,
      min: [0, 'Used days cannot be negative'],
    },
    pending: {
      type: Number,
      default: 0,
      min: [0, 'Pending days cannot be negative'],
    },
    remaining: {
      type: Number,
      required: true,
      min: [0, 'Remaining days cannot be negative'],
    },
    carried: {
      type: Number,
      default: 0,
      min: [0, 'Carried days cannot be negative'],
    },
    expires: Date,
  }],
  
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Updater is required'],
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
leaveSchema.index({ lawFirmId: 1 });
leaveSchema.index({ employeeId: 1 });
leaveSchema.index({ leaveNumber: 1 }, { unique: true });
leaveSchema.index({ status: 1 });
leaveSchema.index({ leaveType: 1 });
leaveSchema.index({ startDate: 1 });
leaveSchema.index({ endDate: 1 });

// Compound indexes
leaveSchema.index({ lawFirmId: 1, employeeId: 1 });
leaveSchema.index({ lawFirmId: 1, status: 1 });
leaveSchema.index({ lawFirmId: 1, leaveType: 1 });
leaveSchema.index({ employeeId: 1, startDate: 1 });

// Leave balance indexes
leaveBalanceSchema.index({ lawFirmId: 1 });
leaveBalanceSchema.index({ employeeId: 1 });
leaveBalanceSchema.index({ year: 1 });
leaveBalanceSchema.index({ employeeId: 1, year: 1 }, { unique: true });

// Virtual for leave duration in days
leaveSchema.virtual('duration').get(function() {
  if (this.isHalfDay) return 0.5;
  return this.actualWorkingDays || this.totalDays;
});

// Virtual for is current leave
leaveSchema.virtual('isCurrent').get(function() {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now && this.status === LeaveStatus.APPROVED;
});

// Virtual for is upcoming leave
leaveSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  return this.startDate > now && this.status === LeaveStatus.APPROVED;
});

// Virtual for days until leave starts
leaveSchema.virtual('daysUntilStart').get(function() {
  if (this.startDate <= new Date()) return 0;
  const diffTime = this.startDate.getTime() - new Date().getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
leaveSchema.pre('save', function(next) {
  // Calculate total days if not provided
  if (!this.totalDays) {
    const diffTime = this.endDate.getTime() - this.startDate.getTime();
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  
  // Calculate working days if workingDaysOnly is true
  if (this.workingDaysOnly && !this.actualWorkingDays) {
    let workingDays = 0;
    const currentDate = new Date(this.startDate);
    
    while (currentDate <= this.endDate) {
      const dayOfWeek = currentDate.getDay();
      // In Saudi Arabia, working days are Sunday (0) to Thursday (4)
      if (dayOfWeek >= 0 && dayOfWeek <= 4) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    this.actualWorkingDays = workingDays;
  }
  
  // Set half-day calculation
  if (this.isHalfDay) {
    this.totalDays = 0.5;
    this.actualWorkingDays = 0.5;
  }
  
  next();
});

// Validation
leaveSchema.pre('save', function(next) {
  // Ensure end date is after start date
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
    return;
  }
  
  // Validate half-day period
  if (this.isHalfDay && !this.halfDayPeriod) {
    next(new Error('Half-day period is required for half-day leave'));
    return;
  }
  
  next();
});

// Static method to generate leave number
leaveSchema.statics.generateLeaveNumber = async function(lawFirmId: mongoose.Types.ObjectId) {
  const year = new Date().getFullYear();
  const prefix = `LV-${year}-`;
  
  // Find the last leave for this year
  const lastLeave = await this.findOne({
    lawFirmId,
    leaveNumber: { $regex: `^${prefix}` }
  }).sort({ leaveNumber: -1 });
  
  let sequence = 1;
  if (lastLeave) {
    const lastSequence = parseInt(lastLeave.leaveNumber.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(4, '0')}`;
};

export const Leave = mongoose.model<LeaveDocument>('Leave', leaveSchema);
export const LeaveBalance = mongoose.model<LeaveBalanceDocument>('LeaveBalance', leaveBalanceSchema);
