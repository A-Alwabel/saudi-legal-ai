import mongoose, { Schema, Document } from 'mongoose';

export enum POAType {
  GENERAL = 'general',
  SPECIAL = 'special',
  LIMITED = 'limited',
  DURABLE = 'durable',
  SPRINGING = 'springing',
  FINANCIAL = 'financial',
  HEALTHCARE = 'healthcare',
  REAL_ESTATE = 'real_estate',
  BUSINESS = 'business',
  LITIGATION = 'litigation',
  OTHER = 'other',
}

export enum POAStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
}

export enum AuthorityLevel {
  FULL = 'full',
  LIMITED = 'limited',
  SPECIFIC = 'specific',
  CONDITIONAL = 'conditional',
}

export interface IPowerOfAttorney {
  _id?: string;
  
  // POA identification
  poaNumber: string;
  title: string;
  titleAr?: string;
  type: POAType;
  status: POAStatus;
  
  // Parties involved
  grantor: {
    // Person granting the power
    userId?: mongoose.Types.ObjectId; // If user in system
    name: string;
    nameAr?: string;
    nationalId?: string;
    passportNumber?: string;
    email?: string;
    phone?: string;
    address: string;
    addressAr?: string;
    isClient: boolean;
    clientId?: mongoose.Types.ObjectId;
  };
  
  attorney: {
    // Person receiving the power (attorney-in-fact)
    userId?: mongoose.Types.ObjectId; // If user in system
    name: string;
    nameAr?: string;
    nationalId?: string;
    passportNumber?: string;
    email?: string;
    phone?: string;
    address: string;
    addressAr?: string;
    licenseNumber?: string;
    barNumber?: string;
    isLawyer: boolean;
  };
  
  // Substitute/alternate attorneys
  substituteAttorneys: {
    userId?: mongoose.Types.ObjectId;
    name: string;
    nameAr?: string;
    email?: string;
    phone?: string;
    order: number; // Order of succession
    conditions?: string; // When they take over
    conditionsAr?: string;
  }[];
  
  // POA details
  purpose: string;
  purposeAr?: string;
  description?: string;
  descriptionAr?: string;
  
  // Authority and powers
  authorityLevel: AuthorityLevel;
  specificPowers: {
    category: string;
    categoryAr?: string;
    description: string;
    descriptionAr?: string;
    isGranted: boolean;
    limitations?: string;
    limitationsAr?: string;
  }[];
  
  // Financial powers (if applicable)
  financialPowers?: {
    bankingRights: boolean;
    realEstateRights: boolean;
    investmentRights: boolean;
    taxRights: boolean;
    businessRights: boolean;
    contractRights: boolean;
    monetaryLimit?: number;
    currency: string;
    limitations?: string;
    limitationsAr?: string;
  };
  
  // Healthcare powers (if applicable)
  healthcarePowers?: {
    medicalDecisions: boolean;
    treatmentConsent: boolean;
    hospitalAdmission: boolean;
    medicationDecisions: boolean;
    endOfLifeDecisions: boolean;
    limitations?: string;
    limitationsAr?: string;
  };
  
  // Legal powers (if applicable)
  legalPowers?: {
    litigation: boolean;
    contractNegotiation: boolean;
    propertyTransactions: boolean;
    governmentProcedures: boolean;
    courtRepresentation: boolean;
    documentSigning: boolean;
    limitations?: string;
    limitationsAr?: string;
  };
  
  // Dates and duration
  effectiveDate: Date;
  expirationDate?: Date;
  isIndefinite: boolean;
  
  // Conditions and limitations
  conditions: {
    type: 'activation' | 'limitation' | 'termination';
    description: string;
    descriptionAr?: string;
    isActive: boolean;
  }[];
  
  // Geographic limitations
  geographicScope?: {
    country: string;
    countryAr?: string;
    state?: string;
    stateAr?: string;
    city?: string;
    cityAr?: string;
    specificLocations?: string[];
    specificLocationsAr?: string[];
  };
  
  // Legal framework
  governingLaw: string;
  governingLawAr?: string;
  jurisdiction: string;
  jurisdictionAr?: string;
  
  // Document information
  originalDocument: {
    documentUrl?: string;
    documentType: 'scan' | 'digital' | 'notarized_copy';
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
    fileSize?: number;
    fileName?: string;
  };
  
  // Notarization and authentication
  notarization?: {
    isNotarized: boolean;
    notaryName?: string;
    notaryNameAr?: string;
    notaryLicense?: string;
    notarizationDate?: Date;
    notarizationLocation?: string;
    notarizationLocationAr?: string;
    sealNumber?: string;
    witnessNames?: string[];
    witnessNamesAr?: string[];
  };
  
  // Registration and official records
  registration?: {
    isRegistered: boolean;
    registrationNumber?: string;
    registrationAuthority?: string;
    registrationAuthorityAr?: string;
    registrationDate?: Date;
    registrationFee?: number;
    currency?: string;
  };
  
  // Related entities
  relatedCase?: mongoose.Types.ObjectId;
  relatedClient?: mongoose.Types.ObjectId;
  relatedDocuments: mongoose.Types.ObjectId[];
  
  // Monitoring and compliance
  complianceChecks: {
    checkDate: Date;
    checkedBy: mongoose.Types.ObjectId;
    status: 'compliant' | 'non_compliant' | 'needs_review';
    notes?: string;
    notesAr?: string;
    nextCheckDate?: Date;
  }[];
  
  // Usage tracking
  usageLog: {
    usedDate: Date;
    usedBy: mongoose.Types.ObjectId;
    purpose: string;
    purposeAr?: string;
    outcome?: string;
    outcomeAr?: string;
    documentsSigned?: string[];
    transactionAmount?: number;
    currency?: string;
  }[];
  
  // Revocation and termination
  revocation?: {
    isRevoked: boolean;
    revocationDate?: Date;
    revokedBy: mongoose.Types.ObjectId;
    reason: string;
    reasonAr?: string;
    notificationSent: boolean;
    notificationDate?: Date;
    affectedParties: string[];
  };
  
  // Renewal information
  renewal?: {
    isRenewable: boolean;
    renewalDate?: Date;
    renewalPeriod?: number; // in months
    autoRenewal: boolean;
    renewalConditions?: string;
    renewalConditionsAr?: string;
  };
  
  // Financial tracking
  fees?: {
    preparationFee?: number;
    notarizationFee?: number;
    registrationFee?: number;
    renewalFee?: number;
    totalFees?: number;
    currency: string;
    paymentStatus: 'pending' | 'paid' | 'overdue';
    invoiceId?: mongoose.Types.ObjectId;
  };
  
  // Tags and categorization
  tags: string[];
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Law firm context
  lawFirmId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  handledBy: mongoose.Types.ObjectId;
  supervisedBy?: mongoose.Types.ObjectId;
  
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

export interface PowerOfAttorneyDocument extends IPowerOfAttorney, Document {}

const powerOfAttorneySchema = new Schema<PowerOfAttorneyDocument>({
  // POA identification
  poaNumber: {
    type: String,
    required: [true, 'POA number is required'],
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
  type: {
    type: String,
    enum: Object.values(POAType),
    required: [true, 'POA type is required'],
  },
  status: {
    type: String,
    enum: Object.values(POAStatus),
    default: POAStatus.DRAFT,
  },
  
  // Parties involved
  grantor: {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Grantor name is required'],
      trim: true,
    },
    nameAr: {
      type: String,
      trim: true,
    },
    nationalId: {
      type: String,
      trim: true,
    },
    passportNumber: {
      type: String,
      trim: true,
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
      required: [true, 'Grantor address is required'],
      trim: true,
    },
    addressAr: {
      type: String,
      trim: true,
    },
    isClient: {
      type: Boolean,
      default: false,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
    },
  },
  
  attorney: {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Attorney name is required'],
      trim: true,
    },
    nameAr: {
      type: String,
      trim: true,
    },
    nationalId: {
      type: String,
      trim: true,
    },
    passportNumber: {
      type: String,
      trim: true,
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
      required: [true, 'Attorney address is required'],
      trim: true,
    },
    addressAr: {
      type: String,
      trim: true,
    },
    licenseNumber: {
      type: String,
      trim: true,
    },
    barNumber: {
      type: String,
      trim: true,
    },
    isLawyer: {
      type: Boolean,
      default: false,
    },
  },
  
  // Substitute attorneys
  substituteAttorneys: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nameAr: {
      type: String,
      trim: true,
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
    order: {
      type: Number,
      required: true,
      min: [1, 'Order must be at least 1'],
    },
    conditions: {
      type: String,
      trim: true,
    },
    conditionsAr: {
      type: String,
      trim: true,
    },
  }],
  
  // POA details
  purpose: {
    type: String,
    required: [true, 'Purpose is required'],
    trim: true,
    maxlength: [1000, 'Purpose cannot exceed 1000 characters'],
  },
  purposeAr: {
    type: String,
    trim: true,
    maxlength: [1000, 'Arabic purpose cannot exceed 1000 characters'],
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
  
  // Authority and powers
  authorityLevel: {
    type: String,
    enum: Object.values(AuthorityLevel),
    required: [true, 'Authority level is required'],
  },
  specificPowers: [{
    category: {
      type: String,
      required: true,
      trim: true,
    },
    categoryAr: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    descriptionAr: {
      type: String,
      trim: true,
    },
    isGranted: {
      type: Boolean,
      required: true,
    },
    limitations: {
      type: String,
      trim: true,
    },
    limitationsAr: {
      type: String,
      trim: true,
    },
  }],
  
  // Financial powers
  financialPowers: {
    bankingRights: {
      type: Boolean,
      default: false,
    },
    realEstateRights: {
      type: Boolean,
      default: false,
    },
    investmentRights: {
      type: Boolean,
      default: false,
    },
    taxRights: {
      type: Boolean,
      default: false,
    },
    businessRights: {
      type: Boolean,
      default: false,
    },
    contractRights: {
      type: Boolean,
      default: false,
    },
    monetaryLimit: {
      type: Number,
      min: [0, 'Monetary limit cannot be negative'],
    },
    currency: {
      type: String,
      default: 'SAR',
      uppercase: true,
    },
    limitations: {
      type: String,
      trim: true,
    },
    limitationsAr: {
      type: String,
      trim: true,
    },
  },
  
  // Healthcare powers
  healthcarePowers: {
    medicalDecisions: {
      type: Boolean,
      default: false,
    },
    treatmentConsent: {
      type: Boolean,
      default: false,
    },
    hospitalAdmission: {
      type: Boolean,
      default: false,
    },
    medicationDecisions: {
      type: Boolean,
      default: false,
    },
    endOfLifeDecisions: {
      type: Boolean,
      default: false,
    },
    limitations: {
      type: String,
      trim: true,
    },
    limitationsAr: {
      type: String,
      trim: true,
    },
  },
  
  // Legal powers
  legalPowers: {
    litigation: {
      type: Boolean,
      default: false,
    },
    contractNegotiation: {
      type: Boolean,
      default: false,
    },
    propertyTransactions: {
      type: Boolean,
      default: false,
    },
    governmentProcedures: {
      type: Boolean,
      default: false,
    },
    courtRepresentation: {
      type: Boolean,
      default: false,
    },
    documentSigning: {
      type: Boolean,
      default: false,
    },
    limitations: {
      type: String,
      trim: true,
    },
    limitationsAr: {
      type: String,
      trim: true,
    },
  },
  
  // Dates and duration
  effectiveDate: {
    type: Date,
    required: [true, 'Effective date is required'],
  },
  expirationDate: Date,
  isIndefinite: {
    type: Boolean,
    default: false,
  },
  
  // Conditions
  conditions: [{
    type: {
      type: String,
      enum: ['activation', 'limitation', 'termination'],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    descriptionAr: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  }],
  
  // Geographic scope
  geographicScope: {
    country: {
      type: String,
      default: 'Saudi Arabia',
    },
    countryAr: {
      type: String,
      default: 'المملكة العربية السعودية',
    },
    state: String,
    stateAr: String,
    city: String,
    cityAr: String,
    specificLocations: [String],
    specificLocationsAr: [String],
  },
  
  // Legal framework
  governingLaw: {
    type: String,
    required: [true, 'Governing law is required'],
    default: 'Saudi Arabian Law',
  },
  governingLawAr: {
    type: String,
    default: 'القانون السعودي',
  },
  jurisdiction: {
    type: String,
    required: [true, 'Jurisdiction is required'],
    default: 'Saudi Arabia',
  },
  jurisdictionAr: {
    type: String,
    default: 'المملكة العربية السعودية',
  },
  
  // Document information
  originalDocument: {
    documentUrl: String,
    documentType: {
      type: String,
      enum: ['scan', 'digital', 'notarized_copy'],
      required: true,
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
    fileSize: Number,
    fileName: String,
  },
  
  // Notarization
  notarization: {
    isNotarized: {
      type: Boolean,
      default: false,
    },
    notaryName: String,
    notaryNameAr: String,
    notaryLicense: String,
    notarizationDate: Date,
    notarizationLocation: String,
    notarizationLocationAr: String,
    sealNumber: String,
    witnessNames: [String],
    witnessNamesAr: [String],
  },
  
  // Registration
  registration: {
    isRegistered: {
      type: Boolean,
      default: false,
    },
    registrationNumber: String,
    registrationAuthority: String,
    registrationAuthorityAr: String,
    registrationDate: Date,
    registrationFee: {
      type: Number,
      min: [0, 'Registration fee cannot be negative'],
    },
    currency: {
      type: String,
      default: 'SAR',
    },
  },
  
  // Related entities
  relatedCase: {
    type: Schema.Types.ObjectId,
    ref: 'Case',
  },
  relatedClient: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
  },
  relatedDocuments: [{
    type: Schema.Types.ObjectId,
    ref: 'Document',
  }],
  
  // Compliance checks
  complianceChecks: [{
    checkDate: {
      type: Date,
      required: true,
    },
    checkedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['compliant', 'non_compliant', 'needs_review'],
      required: true,
    },
    notes: String,
    notesAr: String,
    nextCheckDate: Date,
  }],
  
  // Usage log
  usageLog: [{
    usedDate: {
      type: Date,
      required: true,
    },
    usedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    purposeAr: String,
    outcome: String,
    outcomeAr: String,
    documentsSigned: [String],
    transactionAmount: {
      type: Number,
      min: [0, 'Transaction amount cannot be negative'],
    },
    currency: String,
  }],
  
  // Revocation
  revocation: {
    isRevoked: {
      type: Boolean,
      default: false,
    },
    revocationDate: Date,
    revokedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reason: String,
    reasonAr: String,
    notificationSent: {
      type: Boolean,
      default: false,
    },
    notificationDate: Date,
    affectedParties: [String],
  },
  
  // Renewal
  renewal: {
    isRenewable: {
      type: Boolean,
      default: false,
    },
    renewalDate: Date,
    renewalPeriod: {
      type: Number,
      min: [1, 'Renewal period must be at least 1 month'],
    },
    autoRenewal: {
      type: Boolean,
      default: false,
    },
    renewalConditions: String,
    renewalConditionsAr: String,
  },
  
  // Fees
  fees: {
    preparationFee: {
      type: Number,
      min: [0, 'Preparation fee cannot be negative'],
    },
    notarizationFee: {
      type: Number,
      min: [0, 'Notarization fee cannot be negative'],
    },
    registrationFee: {
      type: Number,
      min: [0, 'Registration fee cannot be negative'],
    },
    renewalFee: {
      type: Number,
      min: [0, 'Renewal fee cannot be negative'],
    },
    totalFees: {
      type: Number,
      min: [0, 'Total fees cannot be negative'],
    },
    currency: {
      type: String,
      default: 'SAR',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending',
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
    },
  },
  
  // Tags and categorization
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  category: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
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
  handledBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Handler is required'],
  },
  supervisedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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
powerOfAttorneySchema.index({ lawFirmId: 1 });
powerOfAttorneySchema.index({ poaNumber: 1 }, { unique: true });
powerOfAttorneySchema.index({ type: 1 });
powerOfAttorneySchema.index({ status: 1 });
powerOfAttorneySchema.index({ effectiveDate: 1 });
powerOfAttorneySchema.index({ expirationDate: 1 });
powerOfAttorneySchema.index({ 'grantor.name': 1 });
powerOfAttorneySchema.index({ 'attorney.name': 1 });

// Compound indexes
powerOfAttorneySchema.index({ lawFirmId: 1, status: 1 });
powerOfAttorneySchema.index({ lawFirmId: 1, type: 1 });
powerOfAttorneySchema.index({ handledBy: 1, status: 1 });

// Virtual for is active
powerOfAttorneySchema.virtual('isActive').get(function() {
  if (this.status !== POAStatus.ACTIVE) return false;
  if (this.revocation?.isRevoked) return false;
  if (!this.isIndefinite && this.expirationDate && this.expirationDate < new Date()) return false;
  return true;
});

// Virtual for is expired
powerOfAttorneySchema.virtual('isExpired').get(function() {
  if (this.isIndefinite) return false;
  return this.expirationDate && this.expirationDate < new Date();
});

// Virtual for days until expiration
powerOfAttorneySchema.virtual('daysUntilExpiration').get(function() {
  if (this.isIndefinite || !this.expirationDate) return null;
  const now = new Date();
  const diffTime = this.expirationDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
powerOfAttorneySchema.pre('save', function(next) {
  // Calculate total fees
  if (this.fees) {
    const fees = this.fees;
    fees.totalFees = (fees.preparationFee || 0) + 
                     (fees.notarizationFee || 0) + 
                     (fees.registrationFee || 0) + 
                     (fees.renewalFee || 0);
  }
  
  next();
});

// Static method to generate POA number
powerOfAttorneySchema.statics.generatePOANumber = async function(lawFirmId: mongoose.Types.ObjectId) {
  const year = new Date().getFullYear();
  const prefix = `POA-${year}-`;
  
  // Find the last POA for this year
  const lastPOA = await this.findOne({
    lawFirmId,
    poaNumber: { $regex: `^${prefix}` }
  }).sort({ poaNumber: -1 });
  
  let sequence = 1;
  if (lastPOA) {
    const lastSequence = parseInt(lastPOA.poaNumber.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(6, '0')}`;
};

export const PowerOfAttorney = mongoose.model<PowerOfAttorneyDocument>('PowerOfAttorney', powerOfAttorneySchema);
