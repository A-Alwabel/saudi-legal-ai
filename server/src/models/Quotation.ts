import mongoose, { Schema, Document } from 'mongoose';

export enum QuotationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  CONVERTED = 'converted', // Converted to invoice
}

export enum QuotationType {
  LEGAL_SERVICES = 'legal_services',
  CONSULTATION = 'consultation',
  REPRESENTATION = 'representation',
  DOCUMENT_PREPARATION = 'document_preparation',
  LITIGATION = 'litigation',
  ARBITRATION = 'arbitration',
  CORPORATE = 'corporate',
  REAL_ESTATE = 'real_estate',
  INTELLECTUAL_PROPERTY = 'intellectual_property',
  OTHER = 'other',
}

export interface QuotationItem {
  description: string;
  descriptionAr?: string;
  quantity: number;
  rate: number; // Price per unit
  amount: number; // quantity * rate
  taxable: boolean;
  serviceType?: string;
  estimatedHours?: number;
}

export interface IQuotation {
  _id?: string;
  
  // Quotation identification
  quotationNumber: string;
  quotationDate: Date;
  validUntil: Date;
  
  // Client information
  clientId: mongoose.Types.ObjectId;
  potentialCaseId?: mongoose.Types.ObjectId; // For new potential cases
  
  // Quotation details
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  quotationType: QuotationType;
  status: QuotationStatus;
  
  // Financial details
  items: QuotationItem[];
  subtotal: number;
  taxRate: number; // VAT rate (15% in Saudi Arabia)
  taxAmount: number;
  discountRate?: number;
  discountAmount?: number;
  totalAmount: number;
  currency: string;
  
  // Terms and conditions
  paymentTerms?: string;
  deliveryTerms?: string;
  termsAndConditions?: string;
  termsAndConditionsAr?: string;
  
  // Validity and expiration
  validityPeriod: number; // in days
  remindersSent: number;
  lastReminderDate?: Date;
  
  // Legal firm information
  lawFirmId: mongoose.Types.ObjectId;
  
  // Additional information
  notes?: string;
  notesAr?: string;
  internalNotes?: string;
  
  // File attachments
  attachments?: string[];
  
  // Tracking
  sentDate?: Date;
  viewedDate?: Date;
  acceptedDate?: Date;
  rejectedDate?: Date;
  rejectionReason?: string;
  
  // Conversion tracking
  convertedToInvoiceId?: mongoose.Types.ObjectId;
  convertedDate?: Date;
  
  // Follow-up
  followUpDate?: Date;
  followUpNotes?: string;
  
  // Approval workflow
  requiresApproval: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  
  // Audit trail
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface QuotationDocument extends IQuotation, Document {}

const quotationItemSchema = new Schema({
  description: {
    type: String,
    required: [true, 'Item description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  descriptionAr: {
    type: String,
    trim: true,
    maxlength: [500, 'Arabic description cannot exceed 500 characters'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
  },
  rate: {
    type: Number,
    required: [true, 'Rate is required'],
    min: [0, 'Rate cannot be negative'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  taxable: {
    type: Boolean,
    default: true,
  },
  serviceType: {
    type: String,
    trim: true,
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative'],
  },
});

const quotationSchema = new Schema<QuotationDocument>({
  // Quotation identification
  quotationNumber: {
    type: String,
    required: [true, 'Quotation number is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  quotationDate: {
    type: Date,
    required: [true, 'Quotation date is required'],
    default: Date.now,
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until date is required'],
  },
  
  // Client information
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required'],
  },
  potentialCaseId: {
    type: Schema.Types.ObjectId,
    ref: 'Case',
  },
  
  // Quotation details
  title: {
    type: String,
    required: [true, 'Quotation title is required'],
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
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  descriptionAr: {
    type: String,
    trim: true,
    maxlength: [2000, 'Arabic description cannot exceed 2000 characters'],
  },
  quotationType: {
    type: String,
    enum: Object.values(QuotationType),
    required: [true, 'Quotation type is required'],
  },
  status: {
    type: String,
    enum: Object.values(QuotationStatus),
    default: QuotationStatus.DRAFT,
    required: true,
  },
  
  // Financial details
  items: {
    type: [quotationItemSchema],
    required: [true, 'Quotation must have at least one item'],
    validate: {
      validator: function(items: QuotationItem[]) {
        return items && items.length > 0;
      },
      message: 'Quotation must have at least one item',
    },
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative'],
  },
  taxRate: {
    type: Number,
    default: 15, // 15% VAT in Saudi Arabia
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%'],
  },
  taxAmount: {
    type: Number,
    required: [true, 'Tax amount is required'],
    min: [0, 'Tax amount cannot be negative'],
  },
  discountRate: {
    type: Number,
    min: [0, 'Discount rate cannot be negative'],
    max: [100, 'Discount rate cannot exceed 100%'],
  },
  discountAmount: {
    type: Number,
    min: [0, 'Discount amount cannot be negative'],
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative'],
  },
  currency: {
    type: String,
    default: 'SAR',
    required: true,
    uppercase: true,
    enum: ['SAR', 'USD', 'EUR', 'GBP'],
  },
  
  // Terms and conditions
  paymentTerms: {
    type: String,
    default: 'Net 30',
    trim: true,
  },
  deliveryTerms: {
    type: String,
    trim: true,
  },
  termsAndConditions: {
    type: String,
    trim: true,
    maxlength: [3000, 'Terms and conditions cannot exceed 3000 characters'],
  },
  termsAndConditionsAr: {
    type: String,
    trim: true,
    maxlength: [3000, 'Arabic terms and conditions cannot exceed 3000 characters'],
  },
  
  // Validity and expiration
  validityPeriod: {
    type: Number,
    default: 30, // 30 days
    min: [1, 'Validity period must be at least 1 day'],
    max: [365, 'Validity period cannot exceed 365 days'],
  },
  remindersSent: {
    type: Number,
    default: 0,
    min: [0, 'Reminders sent cannot be negative'],
  },
  lastReminderDate: Date,
  
  // Legal firm information
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
  
  // File attachments
  attachments: [String],
  
  // Tracking
  sentDate: Date,
  viewedDate: Date,
  acceptedDate: Date,
  rejectedDate: Date,
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
  },
  
  // Conversion tracking
  convertedToInvoiceId: {
    type: Schema.Types.ObjectId,
    ref: 'Invoice',
  },
  convertedDate: Date,
  
  // Follow-up
  followUpDate: Date,
  followUpNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Follow-up notes cannot exceed 1000 characters'],
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
quotationSchema.index({ lawFirmId: 1 });
quotationSchema.index({ clientId: 1 });
quotationSchema.index({ status: 1 });
quotationSchema.index({ quotationNumber: 1 }, { unique: true });
quotationSchema.index({ quotationDate: 1 });
quotationSchema.index({ validUntil: 1 });
quotationSchema.index({ totalAmount: 1 });
quotationSchema.index({ quotationType: 1 });

// Compound indexes
quotationSchema.index({ lawFirmId: 1, status: 1 });
quotationSchema.index({ lawFirmId: 1, clientId: 1 });
quotationSchema.index({ lawFirmId: 1, validUntil: 1, status: 1 });

// Virtual for expired status
quotationSchema.virtual('isExpired').get(function() {
  if (this.status === QuotationStatus.ACCEPTED || this.status === QuotationStatus.CONVERTED) {
    return false;
  }
  return new Date() > this.validUntil;
});

// Virtual for days until expiry
quotationSchema.virtual('daysUntilExpiry').get(function() {
  const today = new Date();
  const expiry = new Date(this.validUntil);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to calculate amounts
quotationSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
  
  // Apply discount
  let discountAmount = 0;
  if (this.discountRate && this.discountRate > 0) {
    discountAmount = (this.subtotal * this.discountRate) / 100;
  } else if (this.discountAmount && this.discountAmount > 0) {
    discountAmount = this.discountAmount;
    this.discountRate = (discountAmount / this.subtotal) * 100;
  }
  this.discountAmount = discountAmount;
  
  // Calculate tax on discounted amount
  const taxableAmount = this.subtotal - discountAmount;
  this.taxAmount = (taxableAmount * this.taxRate) / 100;
  
  // Calculate total
  this.totalAmount = taxableAmount + this.taxAmount;
  
  // Update status based on expiry
  if (this.isExpired && this.status === QuotationStatus.SENT) {
    this.status = QuotationStatus.EXPIRED;
  }
  
  next();
});

// Static method to generate quotation number
quotationSchema.statics.generateQuotationNumber = async function(lawFirmId: mongoose.Types.ObjectId) {
  const year = new Date().getFullYear();
  const prefix = `QUO-${year}-`;
  
  // Find the last quotation for this year
  const lastQuotation = await this.findOne({
    lawFirmId,
    quotationNumber: { $regex: `^${prefix}` }
  }).sort({ quotationNumber: -1 });
  
  let sequence = 1;
  if (lastQuotation) {
    const lastSequence = parseInt(lastQuotation.quotationNumber.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(4, '0')}`;
};

export const Quotation = mongoose.model<QuotationDocument>('Quotation', quotationSchema);
