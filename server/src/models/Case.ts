import mongoose, { Schema, Document, Types } from 'mongoose';
import { Case as ICase, CaseType, CaseStatus, Priority } from '@shared/types';

export interface CaseDocument extends Document {
  title: string;
  description: string;
  caseType: CaseType;
  status: CaseStatus;
  priority: Priority;
  clientId: Types.ObjectId;
  assignedLawyerId: Types.ObjectId;
  lawFirmId: Types.ObjectId;
  courtId?: Types.ObjectId;
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
    addedBy: Types.ObjectId;
    addedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const caseSchema = new Schema<CaseDocument>({
  title: {
    type: String,
    required: [true, 'Case title is required'],
    trim: true,
    minlength: [5, 'Case title must be at least 5 characters'],
    maxlength: [200, 'Case title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Case description is required'],
    trim: true,
    minlength: [10, 'Case description must be at least 10 characters'],
  },
  caseType: {
    type: String,
    enum: Object.values(CaseType),
    required: [true, 'Case type is required'],
  },
  status: {
    type: String,
    enum: Object.values(CaseStatus),
    default: CaseStatus.NEW,
    required: true,
  },
  priority: {
    type: String,
    enum: Object.values(Priority),
    default: Priority.MEDIUM,
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required'],
  },
  assignedLawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned lawyer is required'],
  },
  lawFirmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LawFirm',
    required: [true, 'Law firm is required'],
  },
  courtId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court',
  },
  caseNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // Allow null values but ensure uniqueness when present
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now,
  },
  expectedEndDate: {
    type: Date,
    validate: {
      validator: function(this: CaseDocument, value: Date) {
        return !value || value > this.startDate;
      },
      message: 'Expected end date must be after start date',
    },
  },
  actualEndDate: {
    type: Date,
    validate: {
      validator: function(this: CaseDocument, value: Date) {
        return !value || value >= this.startDate;
      },
      message: 'Actual end date must be after or equal to start date',
    },
  },
  successProbability: {
    type: Number,
    min: [0, 'Success probability cannot be less than 0'],
    max: [100, 'Success probability cannot exceed 100'],
  },
  estimatedValue: {
    type: Number,
    min: [0, 'Estimated value cannot be negative'],
  },
  actualValue: {
    type: Number,
    min: [0, 'Actual value cannot be negative'],
  },
  tags: [{
    type: String,
    trim: true,
  }],
  notes: [{
    content: {
      type: String,
      required: true,
      trim: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
caseSchema.index({ lawFirmId: 1 });
caseSchema.index({ clientId: 1 });
caseSchema.index({ assignedLawyerId: 1 });
caseSchema.index({ caseType: 1 });
caseSchema.index({ status: 1 });
caseSchema.index({ priority: 1 });
caseSchema.index({ startDate: -1 });
caseSchema.index({ caseNumber: 1 });

// Virtual for case duration
caseSchema.virtual('duration').get(function(this: CaseDocument) {
  if (this.actualEndDate) {
    return Math.ceil((this.actualEndDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24));
  } else if (this.expectedEndDate) {
    return Math.ceil((this.expectedEndDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for case age
caseSchema.virtual('age').get(function(this: CaseDocument) {
  return Math.ceil((Date.now() - this.startDate.getTime()) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to validate dates
caseSchema.pre<CaseDocument>('save', function(next) {
  if (this.actualEndDate && this.expectedEndDate && this.actualEndDate > this.expectedEndDate) {
    // Case took longer than expected - this is okay, just log it
    console.log(`Case ${this._id} took longer than expected`);
  }
  next();
});

export const Case = mongoose.model<CaseDocument>('Case', caseSchema);
