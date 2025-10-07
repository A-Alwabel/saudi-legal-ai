import mongoose, { Schema, Document } from 'mongoose';

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum InvoiceType {
  STANDARD = 'standard',
  RETAINER = 'retainer',
  HOURLY = 'hourly',
  FIXED_FEE = 'fixed_fee',
  EXPENSE_REIMBURSEMENT = 'expense_reimbursement',
  RECURRING = 'recurring',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  CHECK = 'check',
  CASH = 'cash',
  ONLINE_PAYMENT = 'online_payment',
}

export interface InvoiceItem {
  description: string;
  descriptionAr?: string;
  quantity: number;
  rate: number; // Price per unit
  amount: number; // quantity * rate
  taxable: boolean;
  taskId?: mongoose.Types.ObjectId;
  timeEntryId?: mongoose.Types.ObjectId;
  expenseId?: mongoose.Types.ObjectId;
}

export interface IInvoice {
  _id?: string;
  
  // Invoice identification
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  
  // Client information
  clientId: mongoose.Types.ObjectId;
  caseId?: mongoose.Types.ObjectId;
  
  // Invoice details
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  invoiceType: InvoiceType;
  status: InvoiceStatus;
  
  // Financial details
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // VAT rate (15% in Saudi Arabia)
  taxAmount: number;
  discountRate?: number;
  discountAmount?: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  currency: string;
  
  // Payment information
  paymentTerms?: string;
  paymentMethod?: PaymentMethod;
  paymentDate?: Date;
  paymentReference?: string;
  
  // Recurring invoice settings
  recurring?: {
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
    interval: number;
    startDate: Date;
    endDate?: Date;
    nextInvoiceDate?: Date;
    occurrences?: number;
    remainingOccurrences?: number;
  };
  
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
  remindersSent: number;
  lastReminderDate?: Date;
  
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

export interface InvoiceDocument extends IInvoice, Document {}

const invoiceItemSchema = new Schema({
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
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
  },
  timeEntryId: {
    type: Schema.Types.ObjectId,
  },
  expenseId: {
    type: Schema.Types.ObjectId,
  },
});

const invoiceSchema = new Schema<InvoiceDocument>({
  // Invoice identification
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  invoiceDate: {
    type: Date,
    required: [true, 'Invoice date is required'],
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
  },
  
  // Client information
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required'],
  },
  caseId: {
    type: Schema.Types.ObjectId,
    ref: 'Case',
  },
  
  // Invoice details
  title: {
    type: String,
    required: [true, 'Invoice title is required'],
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
  invoiceType: {
    type: String,
    enum: Object.values(InvoiceType),
    default: InvoiceType.STANDARD,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(InvoiceStatus),
    default: InvoiceStatus.DRAFT,
    required: true,
  },
  
  // Financial details
  items: {
    type: [invoiceItemSchema],
    required: [true, 'Invoice must have at least one item'],
    validate: {
      validator: function(items: InvoiceItem[]) {
        return items && items.length > 0;
      },
      message: 'Invoice must have at least one item',
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
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative'],
  },
  balanceAmount: {
    type: Number,
    required: [true, 'Balance amount is required'],
    min: [0, 'Balance amount cannot be negative'],
  },
  currency: {
    type: String,
    default: 'SAR',
    required: true,
    uppercase: true,
    enum: ['SAR', 'USD', 'EUR', 'GBP'],
  },
  
  // Payment information
  paymentTerms: {
    type: String,
    default: 'Net 30',
    trim: true,
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
  },
  paymentDate: Date,
  paymentReference: {
    type: String,
    trim: true,
  },
  
  // Recurring invoice settings
  recurring: {
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'annually'],
    },
    interval: {
      type: Number,
      min: [1, 'Interval must be at least 1'],
    },
    startDate: Date,
    endDate: Date,
    nextInvoiceDate: Date,
    occurrences: {
      type: Number,
      min: [1, 'Occurrences must be at least 1'],
    },
    remainingOccurrences: {
      type: Number,
      min: [0, 'Remaining occurrences cannot be negative'],
    },
  },
  
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
  remindersSent: {
    type: Number,
    default: 0,
    min: [0, 'Reminders sent cannot be negative'],
  },
  lastReminderDate: Date,
  
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
invoiceSchema.index({ lawFirmId: 1 });
invoiceSchema.index({ clientId: 1 });
invoiceSchema.index({ caseId: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ invoiceDate: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ totalAmount: 1 });

// Compound indexes
invoiceSchema.index({ lawFirmId: 1, status: 1 });
invoiceSchema.index({ lawFirmId: 1, clientId: 1 });
invoiceSchema.index({ lawFirmId: 1, dueDate: 1, status: 1 });

// Virtual for overdue status
invoiceSchema.virtual('isOverdue').get(function() {
  if (this.status === InvoiceStatus.PAID || this.status === InvoiceStatus.CANCELLED) {
    return false;
  }
  return new Date() > this.dueDate;
});

// Virtual for days overdue
invoiceSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  const today = new Date();
  const due = new Date(this.dueDate);
  const diffTime = today.getTime() - due.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for payment status
invoiceSchema.virtual('paymentStatus').get(function() {
  if (this.paidAmount === 0) return 'unpaid';
  if (this.paidAmount >= this.totalAmount) return 'paid';
  return 'partially_paid';
});

// Pre-save middleware to calculate amounts
invoiceSchema.pre('save', function(next) {
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
  
  // Calculate balance
  this.balanceAmount = this.totalAmount - this.paidAmount;
  
  // Update status based on payment
  if (this.paidAmount >= this.totalAmount && this.status !== InvoiceStatus.REFUNDED) {
    this.status = InvoiceStatus.PAID;
    if (!this.paymentDate) {
      this.paymentDate = new Date();
    }
  } else if (this.paidAmount > 0 && this.paidAmount < this.totalAmount) {
    this.status = InvoiceStatus.PARTIALLY_PAID;
  } else if (this.isOverdue && this.paidAmount === 0) {
    this.status = InvoiceStatus.OVERDUE;
  }
  
  next();
});

// Static method to generate invoice number
invoiceSchema.statics.generateInvoiceNumber = async function(lawFirmId: mongoose.Types.ObjectId) {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  
  // Find the last invoice for this year
  const lastInvoice = await this.findOne({
    lawFirmId,
    invoiceNumber: { $regex: `^${prefix}` }
  }).sort({ invoiceNumber: -1 });
  
  let sequence = 1;
  if (lastInvoice) {
    const lastSequence = parseInt(lastInvoice.invoiceNumber.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(4, '0')}`;
};

export const Invoice = mongoose.model<InvoiceDocument>('Invoice', invoiceSchema);

