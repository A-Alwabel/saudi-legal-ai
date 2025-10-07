import mongoose, { Schema, Document } from 'mongoose';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
}

export enum TransactionCategory {
  // Income categories
  CLIENT_PAYMENT = 'client_payment',
  CONSULTATION_FEE = 'consultation_fee',
  RETAINER_FEE = 'retainer_fee',
  COURT_REPRESENTATION = 'court_representation',
  DOCUMENT_PREPARATION = 'document_preparation',
  LEGAL_ADVICE = 'legal_advice',
  OTHER_INCOME = 'other_income',
  
  // Expense categories
  OFFICE_RENT = 'office_rent',
  UTILITIES = 'utilities',
  SALARIES = 'salaries',
  COURT_FEES = 'court_fees',
  TRAVEL_EXPENSES = 'travel_expenses',
  OFFICE_SUPPLIES = 'office_supplies',
  MARKETING = 'marketing',
  INSURANCE = 'insurance',
  PROFESSIONAL_DEVELOPMENT = 'professional_development',
  TECHNOLOGY = 'technology',
  OTHER_EXPENSE = 'other_expense',
  
  // Transfer categories
  BANK_TRANSFER = 'bank_transfer',
  CASH_DEPOSIT = 'cash_deposit',
  CASH_WITHDRAWAL = 'cash_withdrawal',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  CHECK = 'check',
  ONLINE_PAYMENT = 'online_payment',
  MOBILE_PAYMENT = 'mobile_payment',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
  RECONCILED = 'reconciled',
}

// Treasury Account Model
export interface ITreasuryAccount {
  _id?: string;
  
  // Account identification
  accountNumber: string;
  accountName: string;
  accountNameAr?: string;
  accountType: 'bank' | 'cash' | 'credit_card' | 'investment' | 'petty_cash';
  
  // Bank details (if applicable)
  bankName?: string;
  bankNameAr?: string;
  iban?: string;
  swiftCode?: string;
  branchName?: string;
  branchCode?: string;
  
  // Account details
  currency: string; // SAR, USD, EUR, etc.
  currentBalance: number;
  availableBalance: number; // May differ from current due to pending transactions
  minimumBalance?: number;
  maximumBalance?: number;
  
  // Status and settings
  isActive: boolean;
  isDefault: boolean; // Default account for the currency
  allowNegativeBalance: boolean;
  requireApproval: boolean; // Transactions require approval
  
  // Permissions
  authorizedUsers: mongoose.Types.ObjectId[]; // Users who can access this account
  approvers: mongoose.Types.ObjectId[]; // Users who can approve transactions
  
  // Additional information
  description?: string;
  descriptionAr?: string;
  notes?: string;
  notesAr?: string;
  
  // Reconciliation
  lastReconciledDate?: Date;
  lastReconciledBalance?: number;
  
  // Law firm
  lawFirmId: mongoose.Types.ObjectId;
  
  // Audit trail
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TreasuryAccountDocument extends ITreasuryAccount, Document {}

const treasuryAccountSchema = new Schema<TreasuryAccountDocument>({
  // Account identification
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    trim: true,
    uppercase: true,
  },
  accountName: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true,
    maxlength: [100, 'Account name cannot exceed 100 characters'],
  },
  accountNameAr: {
    type: String,
    trim: true,
    maxlength: [100, 'Arabic account name cannot exceed 100 characters'],
  },
  accountType: {
    type: String,
    enum: ['bank', 'cash', 'credit_card', 'investment', 'petty_cash'],
    required: [true, 'Account type is required'],
  },
  
  // Bank details
  bankName: {
    type: String,
    trim: true,
    maxlength: [100, 'Bank name cannot exceed 100 characters'],
  },
  bankNameAr: {
    type: String,
    trim: true,
    maxlength: [100, 'Arabic bank name cannot exceed 100 characters'],
  },
  iban: {
    type: String,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(v);
      },
      message: 'Invalid IBAN format'
    }
  },
  swiftCode: {
    type: String,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(v);
      },
      message: 'Invalid SWIFT code format'
    }
  },
  branchName: {
    type: String,
    trim: true,
    maxlength: [100, 'Branch name cannot exceed 100 characters'],
  },
  branchCode: {
    type: String,
    trim: true,
    uppercase: true,
  },
  
  // Account details
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    uppercase: true,
    default: 'SAR',
  },
  currentBalance: {
    type: Number,
    required: [true, 'Current balance is required'],
    default: 0,
  },
  availableBalance: {
    type: Number,
    required: [true, 'Available balance is required'],
    default: 0,
  },
  minimumBalance: {
    type: Number,
    default: 0,
  },
  maximumBalance: Number,
  
  // Status and settings
  isActive: {
    type: Boolean,
    default: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  allowNegativeBalance: {
    type: Boolean,
    default: false,
  },
  requireApproval: {
    type: Boolean,
    default: false,
  },
  
  // Permissions
  authorizedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  approvers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  // Additional information
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  descriptionAr: {
    type: String,
    trim: true,
    maxlength: [500, 'Arabic description cannot exceed 500 characters'],
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
  
  // Reconciliation
  lastReconciledDate: Date,
  lastReconciledBalance: Number,
  
  // Law firm
  lawFirmId: {
    type: Schema.Types.ObjectId,
    ref: 'LawFirm',
    required: [true, 'Law firm is required'],
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

// Treasury Transaction Model
export interface ITreasuryTransaction {
  _id?: string;
  
  // Transaction identification
  transactionNumber: string;
  referenceNumber?: string; // External reference (bank ref, invoice number, etc.)
  
  // Transaction details
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  currency: string;
  exchangeRate?: number; // If different from account currency
  amountInAccountCurrency?: number;
  
  // Accounts involved
  fromAccount?: mongoose.Types.ObjectId; // Source account (for expenses/transfers)
  toAccount?: mongoose.Types.ObjectId; // Destination account (for income/transfers)
  
  // Transaction description
  description: string;
  descriptionAr?: string;
  notes?: string;
  notesAr?: string;
  
  // Related entities
  clientId?: mongoose.Types.ObjectId;
  caseId?: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  expenseId?: mongoose.Types.ObjectId;
  paymentId?: mongoose.Types.ObjectId;
  
  // Payment details
  paymentMethod: PaymentMethod;
  paymentReference?: string; // Check number, card last 4 digits, etc.
  paymentDate: Date;
  valueDate?: Date; // When funds are actually available
  
  // Status and approval
  status: TransactionStatus;
  requiresApproval: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  approvalNotes?: string;
  
  // Reconciliation
  isReconciled: boolean;
  reconciledBy?: mongoose.Types.ObjectId;
  reconciledAt?: Date;
  reconciliationNotes?: string;
  
  // Recurring transaction
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextRecurrenceDate?: Date;
  parentTransactionId?: mongoose.Types.ObjectId; // Link to original recurring transaction
  
  // Attachments
  attachments: string[]; // URLs to supporting documents
  
  // Tax information
  vatAmount?: number;
  vatRate?: number;
  isVatInclusive?: boolean;
  taxCategory?: string;
  
  // Law firm
  lawFirmId: mongoose.Types.ObjectId;
  
  // Audit trail
  createdBy: mongoose.Types.ObjectId;
  processedBy?: mongoose.Types.ObjectId; // Who actually processed the transaction
  updatedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TreasuryTransactionDocument extends ITreasuryTransaction, Document {}

const treasuryTransactionSchema = new Schema<TreasuryTransactionDocument>({
  // Transaction identification
  transactionNumber: {
    type: String,
    required: [true, 'Transaction number is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  referenceNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Reference number cannot exceed 50 characters'],
  },
  
  // Transaction details
  type: {
    type: String,
    enum: Object.values(TransactionType),
    required: [true, 'Transaction type is required'],
  },
  category: {
    type: String,
    enum: Object.values(TransactionCategory),
    required: [true, 'Transaction category is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    uppercase: true,
    default: 'SAR',
  },
  exchangeRate: {
    type: Number,
    min: [0, 'Exchange rate cannot be negative'],
  },
  amountInAccountCurrency: Number,
  
  // Accounts involved
  fromAccount: {
    type: Schema.Types.ObjectId,
    ref: 'TreasuryAccount',
  },
  toAccount: {
    type: Schema.Types.ObjectId,
    ref: 'TreasuryAccount',
  },
  
  // Transaction description
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  descriptionAr: {
    type: String,
    trim: true,
    maxlength: [500, 'Arabic description cannot exceed 500 characters'],
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
  
  // Related entities
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
  },
  caseId: {
    type: Schema.Types.ObjectId,
    ref: 'Case',
  },
  invoiceId: {
    type: Schema.Types.ObjectId,
    ref: 'Invoice',
  },
  expenseId: {
    type: Schema.Types.ObjectId,
    ref: 'Expense',
  },
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
  },
  
  // Payment details
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: [true, 'Payment method is required'],
  },
  paymentReference: {
    type: String,
    trim: true,
    maxlength: [100, 'Payment reference cannot exceed 100 characters'],
  },
  paymentDate: {
    type: Date,
    required: [true, 'Payment date is required'],
    default: Date.now,
  },
  valueDate: Date,
  
  // Status and approval
  status: {
    type: String,
    enum: Object.values(TransactionStatus),
    default: TransactionStatus.PENDING,
  },
  requiresApproval: {
    type: Boolean,
    default: false,
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: Date,
  approvalNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Approval notes cannot exceed 500 characters'],
  },
  
  // Reconciliation
  isReconciled: {
    type: Boolean,
    default: false,
  },
  reconciledBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  reconciledAt: Date,
  reconciliationNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Reconciliation notes cannot exceed 500 characters'],
  },
  
  // Recurring transaction
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
  },
  nextRecurrenceDate: Date,
  parentTransactionId: {
    type: Schema.Types.ObjectId,
    ref: 'TreasuryTransaction',
  },
  
  // Attachments
  attachments: {
    type: [String],
    default: [],
  },
  
  // Tax information
  vatAmount: {
    type: Number,
    min: [0, 'VAT amount cannot be negative'],
  },
  vatRate: {
    type: Number,
    min: [0, 'VAT rate cannot be negative'],
    max: [1, 'VAT rate cannot exceed 100%'],
  },
  isVatInclusive: {
    type: Boolean,
    default: false,
  },
  taxCategory: {
    type: String,
    trim: true,
  },
  
  // Law firm
  lawFirmId: {
    type: Schema.Types.ObjectId,
    ref: 'LawFirm',
    required: [true, 'Law firm is required'],
  },
  
  // Audit trail
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required'],
  },
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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
treasuryAccountSchema.index({ lawFirmId: 1 });
treasuryAccountSchema.index({ accountNumber: 1 }, { unique: true });
treasuryAccountSchema.index({ accountType: 1 });
treasuryAccountSchema.index({ currency: 1 });
treasuryAccountSchema.index({ isActive: 1 });

treasuryTransactionSchema.index({ lawFirmId: 1 });
treasuryTransactionSchema.index({ transactionNumber: 1 }, { unique: true });
treasuryTransactionSchema.index({ type: 1 });
treasuryTransactionSchema.index({ category: 1 });
treasuryTransactionSchema.index({ status: 1 });
treasuryTransactionSchema.index({ paymentDate: 1 });
treasuryTransactionSchema.index({ fromAccount: 1 });
treasuryTransactionSchema.index({ toAccount: 1 });

// Compound indexes
treasuryTransactionSchema.index({ lawFirmId: 1, type: 1 });
treasuryTransactionSchema.index({ lawFirmId: 1, status: 1 });
treasuryTransactionSchema.index({ lawFirmId: 1, paymentDate: 1 });
treasuryTransactionSchema.index({ fromAccount: 1, paymentDate: 1 });
treasuryTransactionSchema.index({ toAccount: 1, paymentDate: 1 });

// Virtual for net amount (amount - VAT if VAT exclusive)
treasuryTransactionSchema.virtual('netAmount').get(function() {
  if (this.vatAmount && !this.isVatInclusive) {
    return this.amount - this.vatAmount;
  }
  return this.amount;
});

// Virtual for account balance impact
treasuryTransactionSchema.virtual('balanceImpact').get(function() {
  switch (this.type) {
    case TransactionType.INCOME:
      return this.amount;
    case TransactionType.EXPENSE:
      return -this.amount;
    case TransactionType.TRANSFER:
      return 0; // Neutral for the overall balance
    case TransactionType.ADJUSTMENT:
      return this.amount; // Can be positive or negative
    default:
      return 0;
  }
});

// Pre-save middleware for transactions
treasuryTransactionSchema.pre('save', function(next) {
  // Calculate amount in account currency if exchange rate provided
  if (this.exchangeRate && this.exchangeRate !== 1) {
    this.amountInAccountCurrency = this.amount * this.exchangeRate;
  } else {
    this.amountInAccountCurrency = this.amount;
  }
  
  // Set value date if not provided
  if (!this.valueDate) {
    this.valueDate = this.paymentDate;
  }
  
  next();
});

// Validation
treasuryTransactionSchema.pre('save', function(next) {
  // Validate accounts based on transaction type
  if (this.type === TransactionType.INCOME && !this.toAccount) {
    next(new Error('Income transactions must have a destination account'));
    return;
  }
  
  if (this.type === TransactionType.EXPENSE && !this.fromAccount) {
    next(new Error('Expense transactions must have a source account'));
    return;
  }
  
  if (this.type === TransactionType.TRANSFER && (!this.fromAccount || !this.toAccount)) {
    next(new Error('Transfer transactions must have both source and destination accounts'));
    return;
  }
  
  if (this.type === TransactionType.TRANSFER && this.fromAccount?.toString() === this.toAccount?.toString()) {
    next(new Error('Transfer source and destination accounts cannot be the same'));
    return;
  }
  
  next();
});

// Static method to generate transaction number
treasuryTransactionSchema.statics.generateTransactionNumber = async function(lawFirmId: mongoose.Types.ObjectId, type: TransactionType) {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const typePrefix = type.toUpperCase().substring(0, 3);
  const prefix = `${typePrefix}-${year}${month}-`;
  
  // Find the last transaction for this month and type
  const lastTransaction = await this.findOne({
    lawFirmId,
    type,
    transactionNumber: { $regex: `^${prefix}` }
  }).sort({ transactionNumber: -1 });
  
  let sequence = 1;
  if (lastTransaction) {
    const lastSequence = parseInt(lastTransaction.transactionNumber.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(4, '0')}`;
};

// Static method to generate account number
treasuryAccountSchema.statics.generateAccountNumber = async function(lawFirmId: mongoose.Types.ObjectId, accountType: string) {
  const typePrefix = accountType.toUpperCase().substring(0, 3);
  const prefix = `${typePrefix}-`;
  
  // Find the last account for this type
  const lastAccount = await this.findOne({
    lawFirmId,
    accountType,
    accountNumber: { $regex: `^${prefix}` }
  }).sort({ accountNumber: -1 });
  
  let sequence = 1;
  if (lastAccount) {
    const lastSequence = parseInt(lastAccount.accountNumber.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(6, '0')}`;
};

export const TreasuryAccount = mongoose.model<TreasuryAccountDocument>('TreasuryAccount', treasuryAccountSchema);
export const TreasuryTransaction = mongoose.model<TreasuryTransactionDocument>('TreasuryTransaction', treasuryTransactionSchema);
