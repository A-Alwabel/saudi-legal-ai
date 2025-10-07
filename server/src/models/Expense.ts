import mongoose, { Schema, Document } from 'mongoose';

export enum ExpenseStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REIMBURSED = 'reimbursed',
  CANCELLED = 'cancelled',
}

export enum ExpenseCategory {
  TRAVEL = 'travel',
  MEALS = 'meals',
  ACCOMMODATION = 'accommodation',
  TRANSPORTATION = 'transportation',
  OFFICE_SUPPLIES = 'office_supplies',
  LEGAL_RESEARCH = 'legal_research',
  COURT_FEES = 'court_fees',
  FILING_FEES = 'filing_fees',
  EXPERT_WITNESS = 'expert_witness',
  TRANSLATION = 'translation',
  PRINTING = 'printing',
  POSTAGE = 'postage',
  TELECOMMUNICATIONS = 'telecommunications',
  SOFTWARE = 'software',
  TRAINING = 'training',
  MARKETING = 'marketing',
  ENTERTAINMENT = 'entertainment',
  UTILITIES = 'utilities',
  RENT = 'rent',
  INSURANCE = 'insurance',
  PROFESSIONAL_SERVICES = 'professional_services',
  OTHER = 'other',
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  PETTY_CASH = 'petty_cash',
  COMPANY_CARD = 'company_card',
}

export interface IExpense {
  _id?: string;
  
  // Expense identification
  expenseNumber: string;
  expenseDate: Date;
  
  // Expense details
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  category: ExpenseCategory;
  subcategory?: string;
  status: ExpenseStatus;
  
  // Financial details
  amount: number;
  currency: string;
  exchangeRate?: number; // If different from base currency
  baseAmount?: number; // Amount in base currency
  taxAmount?: number;
  taxRate?: number;
  isTaxDeductible: boolean;
  
  // Payment information
  paymentMethod: PaymentMethod;
  paidBy: mongoose.Types.ObjectId; // User who paid
  reimburseTo?: mongoose.Types.ObjectId; // User to reimburse (if different from paidBy)
  
  // Related entities
  caseId?: mongoose.Types.ObjectId;
  clientId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  
  // Vendor/Supplier information
  vendor?: {
    name: string;
    nameAr?: string;
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string;
  };
  
  // Receipt information
  receiptNumber?: string;
  receiptDate?: Date;
  attachments: string[]; // Receipt images/PDFs
  
  // Billing
  billable: boolean;
  billedToClient: boolean;
  invoiceId?: mongoose.Types.ObjectId; // If billed to client
  markupPercentage?: number;
  billedAmount?: number;
  
  // Approval workflow
  submittedBy: mongoose.Types.ObjectId;
  submittedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
  
  // Reimbursement
  reimbursementDate?: Date;
  reimbursementMethod?: string;
  reimbursementReference?: string;
  reimbursementAmount?: number;
  
  // Recurring expense
  recurring?: {
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
    interval: number;
    endDate?: Date;
    nextExpenseDate?: Date;
  };
  
  // Law firm
  lawFirmId: mongoose.Types.ObjectId;
  
  // Additional information
  notes?: string;
  notesAr?: string;
  internalNotes?: string;
  
  // Metadata
  isPersonal: boolean; // Personal vs business expense
  requiresReceipt: boolean;
  
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseDocument extends IExpense, Document {}

const expenseSchema = new Schema<ExpenseDocument>({
  // Expense identification
  expenseNumber: {
    type: String,
    required: [true, 'Expense number is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  expenseDate: {
    type: Date,
    required: [true, 'Expense date is required'],
    default: Date.now,
  },
  
  // Expense details
  title: {
    type: String,
    required: [true, 'Expense title is required'],
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
  category: {
    type: String,
    enum: Object.values(ExpenseCategory),
    required: [true, 'Expense category is required'],
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [100, 'Subcategory cannot exceed 100 characters'],
  },
  status: {
    type: String,
    enum: Object.values(ExpenseStatus),
    default: ExpenseStatus.DRAFT,
    required: true,
  },
  
  // Financial details
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  currency: {
    type: String,
    default: 'SAR',
    required: true,
    uppercase: true,
    enum: ['SAR', 'USD', 'EUR', 'GBP'],
  },
  exchangeRate: {
    type: Number,
    min: [0, 'Exchange rate cannot be negative'],
  },
  baseAmount: {
    type: Number,
    min: [0, 'Base amount cannot be negative'],
  },
  taxAmount: {
    type: Number,
    min: [0, 'Tax amount cannot be negative'],
  },
  taxRate: {
    type: Number,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%'],
  },
  isTaxDeductible: {
    type: Boolean,
    default: true,
  },
  
  // Payment information
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: [true, 'Payment method is required'],
  },
  paidBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Paid by is required'],
  },
  reimburseTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
  },
  
  // Vendor/Supplier information
  vendor: {
    name: {
      type: String,
      trim: true,
      maxlength: [200, 'Vendor name cannot exceed 200 characters'],
    },
    nameAr: {
      type: String,
      trim: true,
      maxlength: [200, 'Arabic vendor name cannot exceed 200 characters'],
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
    address: {
      type: String,
      trim: true,
    },
    taxId: {
      type: String,
      trim: true,
    },
  },
  
  // Receipt information
  receiptNumber: {
    type: String,
    trim: true,
  },
  receiptDate: Date,
  attachments: {
    type: [String],
    default: [],
  },
  
  // Billing
  billable: {
    type: Boolean,
    default: false,
  },
  billedToClient: {
    type: Boolean,
    default: false,
  },
  invoiceId: {
    type: Schema.Types.ObjectId,
    ref: 'Invoice',
  },
  markupPercentage: {
    type: Number,
    min: [0, 'Markup percentage cannot be negative'],
    max: [1000, 'Markup percentage cannot exceed 1000%'],
  },
  billedAmount: {
    type: Number,
    min: [0, 'Billed amount cannot be negative'],
  },
  
  // Approval workflow
  submittedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Submitted by is required'],
  },
  submittedAt: Date,
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: Date,
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
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
  },
  
  // Reimbursement
  reimbursementDate: Date,
  reimbursementMethod: {
    type: String,
    trim: true,
  },
  reimbursementReference: {
    type: String,
    trim: true,
  },
  reimbursementAmount: {
    type: Number,
    min: [0, 'Reimbursement amount cannot be negative'],
  },
  
  // Recurring expense
  recurring: {
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'annually'],
    },
    interval: {
      type: Number,
      min: [1, 'Interval must be at least 1'],
    },
    endDate: Date,
    nextExpenseDate: Date,
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
  
  // Metadata
  isPersonal: {
    type: Boolean,
    default: false,
  },
  requiresReceipt: {
    type: Boolean,
    default: true,
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
expenseSchema.index({ lawFirmId: 1 });
expenseSchema.index({ paidBy: 1 });
expenseSchema.index({ submittedBy: 1 });
expenseSchema.index({ status: 1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ expenseNumber: 1 }, { unique: true });
expenseSchema.index({ expenseDate: 1 });
expenseSchema.index({ amount: 1 });
expenseSchema.index({ caseId: 1 });
expenseSchema.index({ clientId: 1 });
expenseSchema.index({ billable: 1 });

// Compound indexes
expenseSchema.index({ lawFirmId: 1, status: 1 });
expenseSchema.index({ lawFirmId: 1, paidBy: 1 });
expenseSchema.index({ lawFirmId: 1, category: 1 });
expenseSchema.index({ lawFirmId: 1, expenseDate: 1 });

// Virtual for pending approval
expenseSchema.virtual('isPendingApproval').get(function() {
  return this.status === ExpenseStatus.SUBMITTED || this.status === ExpenseStatus.UNDER_REVIEW;
});

// Virtual for reimbursement status
expenseSchema.virtual('reimbursementStatus').get(function() {
  if (this.status === ExpenseStatus.REIMBURSED) return 'reimbursed';
  if (this.status === ExpenseStatus.APPROVED) return 'pending_reimbursement';
  return 'not_applicable';
});

// Pre-save middleware
expenseSchema.pre('save', function(next) {
  // Calculate base amount if different currency
  if (this.currency !== 'SAR' && this.exchangeRate) {
    this.baseAmount = this.amount * this.exchangeRate;
  } else {
    this.baseAmount = this.amount;
  }
  
  // Calculate billed amount with markup
  if (this.billable && this.markupPercentage) {
    this.billedAmount = this.amount * (1 + this.markupPercentage / 100);
  } else if (this.billable) {
    this.billedAmount = this.amount;
  }
  
  // Set reimburseTo to paidBy if not specified
  if (!this.reimburseTo) {
    this.reimburseTo = this.paidBy;
  }
  
  // Set reimbursement amount
  if (this.status === ExpenseStatus.APPROVED && !this.reimbursementAmount) {
    this.reimbursementAmount = this.baseAmount || this.amount;
  }
  
  next();
});

// Static method to generate expense number
expenseSchema.statics.generateExpenseNumber = async function(lawFirmId: mongoose.Types.ObjectId) {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const prefix = `EXP-${year}${month}-`;
  
  // Find the last expense for this month
  const lastExpense = await this.findOne({
    lawFirmId,
    expenseNumber: { $regex: `^${prefix}` }
  }).sort({ expenseNumber: -1 });
  
  let sequence = 1;
  if (lastExpense) {
    const lastSequence = parseInt(lastExpense.expenseNumber.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(3, '0')}`;
};

export const Expense = mongoose.model<ExpenseDocument>('Expense', expenseSchema);
