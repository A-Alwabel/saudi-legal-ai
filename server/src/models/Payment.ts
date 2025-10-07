import mongoose, { Schema, Document } from 'mongoose';

export enum PaymentType {
  INVOICE_PAYMENT = 'invoice_payment',
  RETAINER = 'retainer',
  EXPENSE_REIMBURSEMENT = 'expense_reimbursement',
  REFUND = 'refund',
  ADVANCE = 'advance',
  SETTLEMENT = 'settlement',
  OTHER = 'other',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  CHECK = 'check',
  CASH = 'cash',
  WIRE_TRANSFER = 'wire_transfer',
  ONLINE_PAYMENT = 'online_payment',
  MADA = 'mada', // Saudi payment system
  SADAD = 'sadad', // Saudi payment system
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
}

export interface IPayment {
  _id?: string;
  
  // Payment identification
  paymentNumber: string;
  paymentDate: Date;
  
  // Payment details
  paymentType: PaymentType;
  status: PaymentStatus;
  amount: number;
  currency: string;
  exchangeRate?: number;
  baseAmount?: number; // Amount in base currency
  
  // Payment method details
  paymentMethod: PaymentMethod;
  paymentMethodDetails?: {
    cardLast4?: string;
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    checkNumber?: string;
    transactionId?: string;
    authorizationCode?: string;
  };
  
  // Related entities
  clientId: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  caseId?: mongoose.Types.ObjectId;
  expenseId?: mongoose.Types.ObjectId;
  
  // Payer information
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  payerAddress?: string;
  
  // Processing details
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  processingFee?: number;
  netAmount?: number; // Amount after processing fees
  
  // Bank/Gateway details
  gatewayProvider?: string;
  gatewayTransactionId?: string;
  gatewayResponse?: any;
  
  // Reconciliation
  reconciled: boolean;
  reconciledBy?: mongoose.Types.ObjectId;
  reconciledAt?: Date;
  bankStatementReference?: string;
  
  // Refund information
  refundedAmount?: number;
  refundedAt?: Date;
  refundedBy?: mongoose.Types.ObjectId;
  refundReason?: string;
  refundReference?: string;
  
  // Split payments
  parentPaymentId?: mongoose.Types.ObjectId; // For partial payments
  isPartialPayment: boolean;
  remainingAmount?: number;
  
  // Recurring payments
  recurring?: {
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
    interval: number;
    endDate?: Date;
    nextPaymentDate?: Date;
    subscriptionId?: string;
  };
  
  // Law firm
  lawFirmId: mongoose.Types.ObjectId;
  
  // Additional information
  description?: string;
  descriptionAr?: string;
  notes?: string;
  notesAr?: string;
  internalNotes?: string;
  
  // File attachments
  attachments?: string[];
  
  // Notification tracking
  clientNotified: boolean;
  clientNotifiedAt?: Date;
  
  // Audit trail
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentDocument extends IPayment, Document {}

const paymentSchema = new Schema<PaymentDocument>({
  // Payment identification
  paymentNumber: {
    type: String,
    required: [true, 'Payment number is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  paymentDate: {
    type: Date,
    required: [true, 'Payment date is required'],
    default: Date.now,
  },
  
  // Payment details
  paymentType: {
    type: String,
    enum: Object.values(PaymentType),
    required: [true, 'Payment type is required'],
  },
  status: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
    required: true,
  },
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
  
  // Payment method details
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: [true, 'Payment method is required'],
  },
  paymentMethodDetails: {
    cardLast4: String,
    bankName: String,
    accountNumber: String,
    routingNumber: String,
    checkNumber: String,
    transactionId: String,
    authorizationCode: String,
  },
  
  // Related entities
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required'],
  },
  invoiceId: {
    type: Schema.Types.ObjectId,
    ref: 'Invoice',
  },
  caseId: {
    type: Schema.Types.ObjectId,
    ref: 'Case',
  },
  expenseId: {
    type: Schema.Types.ObjectId,
    ref: 'Expense',
  },
  
  // Payer information
  payerName: {
    type: String,
    trim: true,
    maxlength: [200, 'Payer name cannot exceed 200 characters'],
  },
  payerEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  payerPhone: {
    type: String,
    trim: true,
  },
  payerAddress: {
    type: String,
    trim: true,
  },
  
  // Processing details
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  processedAt: Date,
  processingFee: {
    type: Number,
    min: [0, 'Processing fee cannot be negative'],
  },
  netAmount: {
    type: Number,
    min: [0, 'Net amount cannot be negative'],
  },
  
  // Bank/Gateway details
  gatewayProvider: {
    type: String,
    trim: true,
  },
  gatewayTransactionId: {
    type: String,
    trim: true,
  },
  gatewayResponse: Schema.Types.Mixed,
  
  // Reconciliation
  reconciled: {
    type: Boolean,
    default: false,
  },
  reconciledBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  reconciledAt: Date,
  bankStatementReference: {
    type: String,
    trim: true,
  },
  
  // Refund information
  refundedAmount: {
    type: Number,
    min: [0, 'Refunded amount cannot be negative'],
  },
  refundedAt: Date,
  refundedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  refundReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Refund reason cannot exceed 500 characters'],
  },
  refundReference: {
    type: String,
    trim: true,
  },
  
  // Split payments
  parentPaymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
  },
  isPartialPayment: {
    type: Boolean,
    default: false,
  },
  remainingAmount: {
    type: Number,
    min: [0, 'Remaining amount cannot be negative'],
  },
  
  // Recurring payments
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
    nextPaymentDate: Date,
    subscriptionId: String,
  },
  
  // Law firm
  lawFirmId: {
    type: Schema.Types.ObjectId,
    ref: 'LawFirm',
    required: [true, 'Law firm is required'],
  },
  
  // Additional information
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
  attachments: {
    type: [String],
    default: [],
  },
  
  // Notification tracking
  clientNotified: {
    type: Boolean,
    default: false,
  },
  clientNotifiedAt: Date,
  
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
paymentSchema.index({ lawFirmId: 1 });
paymentSchema.index({ clientId: 1 });
paymentSchema.index({ invoiceId: 1 });
paymentSchema.index({ caseId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentNumber: 1 }, { unique: true });
paymentSchema.index({ paymentDate: 1 });
paymentSchema.index({ amount: 1 });
paymentSchema.index({ paymentMethod: 1 });
paymentSchema.index({ paymentType: 1 });
paymentSchema.index({ reconciled: 1 });

// Compound indexes
paymentSchema.index({ lawFirmId: 1, status: 1 });
paymentSchema.index({ lawFirmId: 1, clientId: 1 });
paymentSchema.index({ lawFirmId: 1, paymentDate: 1 });
paymentSchema.index({ clientId: 1, invoiceId: 1 });

// Virtual for refund status
paymentSchema.virtual('refundStatus').get(function() {
  if (this.status === PaymentStatus.REFUNDED) return 'fully_refunded';
  if (this.refundedAmount && this.refundedAmount > 0) return 'partially_refunded';
  return 'not_refunded';
});

// Virtual for outstanding amount (for partial payments)
paymentSchema.virtual('outstandingAmount').get(function() {
  if (this.isPartialPayment && this.remainingAmount) {
    return this.remainingAmount;
  }
  return 0;
});

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  // Calculate base amount if different currency
  if (this.currency !== 'SAR' && this.exchangeRate) {
    this.baseAmount = this.amount * this.exchangeRate;
  } else {
    this.baseAmount = this.amount;
  }
  
  // Calculate net amount after processing fees
  this.netAmount = this.amount - (this.processingFee || 0);
  
  // Set payer information from client if not provided
  if (!this.payerName && this.clientId) {
    // This would need to be populated in the route handler
  }
  
  next();
});

// Static method to generate payment number
paymentSchema.statics.generatePaymentNumber = async function(lawFirmId: mongoose.Types.ObjectId) {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const prefix = `PAY-${year}${month}-`;
  
  // Find the last payment for this month
  const lastPayment = await this.findOne({
    lawFirmId,
    paymentNumber: { $regex: `^${prefix}` }
  }).sort({ paymentNumber: -1 });
  
  let sequence = 1;
  if (lastPayment) {
    const lastSequence = parseInt(lastPayment.paymentNumber.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(4, '0')}`;
};

export const Payment = mongoose.model<PaymentDocument>('Payment', paymentSchema);
