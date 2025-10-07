import mongoose, { Schema, Document } from 'mongoose';

export enum ExecutionType {
  DEBT_COLLECTION = 'debt_collection',
  PROPERTY_SEIZURE = 'property_seizure',
  WAGE_GARNISHMENT = 'wage_garnishment',
  BANK_ACCOUNT_FREEZE = 'bank_account_freeze',
  ASSET_LIQUIDATION = 'asset_liquidation',
  REAL_ESTATE_EXECUTION = 'real_estate_execution',
  VEHICLE_SEIZURE = 'vehicle_seizure',
  BUSINESS_CLOSURE = 'business_closure',
  COURT_ORDER_ENFORCEMENT = 'court_order_enforcement',
  ALIMONY_COLLECTION = 'alimony_collection',
  OTHER = 'other',
}

export enum ExecutionStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_EXECUTION = 'in_execution',
  PARTIALLY_EXECUTED = 'partially_executed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  APPEALED = 'appealed',
  SUSPENDED = 'suspended',
}

export enum ExecutionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  EMERGENCY = 'emergency',
}

export interface IExecutionRequest {
  _id?: string;
  
  // Request identification
  executionNumber: string;
  title: string;
  titleAr?: string;
  type: ExecutionType;
  status: ExecutionStatus;
  priority: ExecutionPriority;
  
  // Court and legal information
  courtInfo: {
    courtName: string;
    courtNameAr?: string;
    courtType: string;
    courtTypeAr?: string;
    judgeNumber?: string;
    judgmentNumber: string;
    judgmentDate: Date;
    judgmentAmount?: number;
    currency: string;
    isAppealable: boolean;
    appealDeadline?: Date;
  };
  
  // Creditor information (requesting party)
  creditor: {
    userId?: mongoose.Types.ObjectId; // If user in system
    clientId?: mongoose.Types.ObjectId; // If client in system
    name: string;
    nameAr?: string;
    nationalId?: string;
    commercialRegister?: string;
    email?: string;
    phone?: string;
    address: string;
    addressAr?: string;
    legalRepresentative?: {
      name: string;
      nameAr?: string;
      licenseNumber?: string;
      barNumber?: string;
      phone?: string;
      email?: string;
    };
  };
  
  // Debtor information (party against whom execution is sought)
  debtor: {
    name: string;
    nameAr?: string;
    nationalId?: string;
    commercialRegister?: string;
    email?: string;
    phone?: string;
    address: string;
    addressAr?: string;
    employerInfo?: {
      employerName?: string;
      employerNameAr?: string;
      workAddress?: string;
      workAddressAr?: string;
      salary?: number;
      currency?: string;
    };
    bankAccounts?: {
      bankName: string;
      bankNameAr?: string;
      accountNumber: string;
      iban?: string;
      estimatedBalance?: number;
      currency: string;
    }[];
    knownAssets: {
      type: 'real_estate' | 'vehicle' | 'business' | 'investment' | 'other';
      description: string;
      descriptionAr?: string;
      estimatedValue?: number;
      currency?: string;
      location?: string;
      locationAr?: string;
      registrationNumber?: string;
    }[];
  };
  
  // Financial details
  financialInfo: {
    originalAmount: number;
    currency: string;
    interestAmount?: number;
    feesAmount?: number;
    totalClaimedAmount: number;
    paidAmount: number;
    remainingAmount: number;
    
    // Payment history
    payments: {
      amount: number;
      paymentDate: Date;
      paymentMethod: string;
      receiptNumber?: string;
      notes?: string;
      notesAr?: string;
    }[];
    
    // Cost breakdown
    executionCosts: {
      courtFees: number;
      lawyerFees: number;
      enforcementFees: number;
      otherCosts: number;
      totalCosts: number;
    };
  };
  
  // Execution details
  executionDetails: {
    requestedActions: string[];
    requestedActionsAr: string[];
    specificInstructions?: string;
    specificInstructionsAr?: string;
    timeframe?: string;
    timeframeAr?: string;
    
    // Asset seizure details
    targetAssets?: {
      assetType: string;
      assetTypeAr?: string;
      description: string;
      descriptionAr?: string;
      location?: string;
      locationAr?: string;
      estimatedValue?: number;
      seizureDate?: Date;
      actualValue?: number;
      liquidationDate?: Date;
      liquidationAmount?: number;
    }[];
    
    // Garnishment details
    garnishmentDetails?: {
      employerName?: string;
      employerNameAr?: string;
      employerAddress?: string;
      employerAddressAr?: string;
      monthlyAmount?: number;
      percentage?: number;
      startDate?: Date;
      endDate?: Date;
    };
  };
  
  // Documents and evidence
  supportingDocuments: {
    documentType: string;
    documentTypeAr?: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
    isRequired: boolean;
    isVerified: boolean;
    verifiedBy?: mongoose.Types.ObjectId;
    verifiedAt?: Date;
    notes?: string;
    notesAr?: string;
  }[];
  
  // Execution progress
  executionProgress: {
    currentPhase: string;
    currentPhaseAr?: string;
    phaseStartDate?: Date;
    expectedCompletionDate?: Date;
    actualCompletionDate?: Date;
    completionPercentage: number;
    
    // Progress milestones
    milestones: {
      name: string;
      nameAr?: string;
      targetDate?: Date;
      completedDate?: Date;
      status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
      responsibleParty?: string;
      responsiblePartyAr?: string;
      notes?: string;
      notesAr?: string;
    }[];
    
    // Obstacles and challenges
    obstacles: {
      type: string;
      typeAr?: string;
      description: string;
      descriptionAr?: string;
      reportedDate: Date;
      reportedBy: mongoose.Types.ObjectId;
      resolution?: string;
      resolutionAr?: string;
      resolvedDate?: Date;
      resolvedBy?: mongoose.Types.ObjectId;
    }[];
  };
  
  // Communication log
  communicationLog: {
    date: Date;
    type: 'court' | 'debtor' | 'creditor' | 'enforcement_officer' | 'lawyer' | 'other';
    method: 'email' | 'phone' | 'meeting' | 'letter' | 'court_hearing' | 'other';
    summary: string;
    summaryAr?: string;
    outcome?: string;
    outcomeAr?: string;
    nextAction?: string;
    nextActionAr?: string;
    nextActionDate?: Date;
    conductedBy: mongoose.Types.ObjectId;
  }[];
  
  // Court proceedings
  courtProceedings: {
    hearingDate?: Date;
    hearingType: string;
    hearingTypeAr?: string;
    courtDecision?: string;
    courtDecisionAr?: string;
    decisionDate?: Date;
    nextHearingDate?: Date;
    attendees: {
      name: string;
      nameAr?: string;
      role: string;
      roleAr?: string;
      attended: boolean;
    }[];
    minutes?: string;
    minutesAr?: string;
  }[];
  
  // Compliance and legal requirements
  compliance: {
    requiredNotifications: {
      recipientType: string;
      recipientTypeAr?: string;
      notificationMethod: string;
      notificationDate?: Date;
      deliveryStatus: 'pending' | 'delivered' | 'failed' | 'acknowledged';
      acknowledgedDate?: Date;
      proofOfDelivery?: string;
    }[];
    
    legalDeadlines: {
      deadlineType: string;
      deadlineTypeAr?: string;
      dueDate: Date;
      completedDate?: Date;
      status: 'pending' | 'completed' | 'overdue' | 'extended';
      extension?: {
        newDate: Date;
        reason: string;
        reasonAr?: string;
        approvedBy?: string;
      };
    }[];
  };
  
  // Appeals and objections
  appeals?: {
    appealNumber?: string;
    appealDate?: Date;
    appealedBy: string;
    appealedByAr?: string;
    appealReason: string;
    appealReasonAr?: string;
    appealStatus: 'filed' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
    appealDecision?: string;
    appealDecisionAr?: string;
    appealDecisionDate?: Date;
    impactOnExecution: string;
    impactOnExecutionAr?: string;
  };
  
  // Related entities
  relatedCase?: mongoose.Types.ObjectId;
  relatedClient?: mongoose.Types.ObjectId;
  relatedDocuments: mongoose.Types.ObjectId[];
  
  // Team and assignments
  assignedTeam: {
    primaryLawyer: mongoose.Types.ObjectId;
    supportingLawyers?: mongoose.Types.ObjectId[];
    paralegal?: mongoose.Types.ObjectId;
    enforcementOfficer?: string;
    enforcementOfficerAr?: string;
    externalAgents?: {
      name: string;
      nameAr?: string;
      role: string;
      roleAr?: string;
      contact: string;
      specialization?: string;
    }[];
  };
  
  // Financial tracking
  costTracking: {
    budgetAllocated?: number;
    actualCosts: number;
    recoveredAmount: number;
    netRecovery: number;
    costEfficiencyRatio?: number;
    
    // Detailed cost breakdown
    costBreakdown: {
      category: string;
      categoryAr?: string;
      budgeted?: number;
      actual: number;
      variance?: number;
      notes?: string;
      notesAr?: string;
    }[];
  };
  
  // Success metrics
  successMetrics?: {
    recoveryRate?: number; // Percentage of amount recovered
    timeToCompletion?: number; // Days from start to completion
    costEffectiveness?: number; // Recovery amount / Total costs
    clientSatisfactionScore?: number;
    complexityRating?: number; // 1-10 scale
  };
  
  // Tags and categorization
  tags: string[];
  category?: string;
  
  // Law firm context
  lawFirmId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  departmentId?: string;
  
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

export interface ExecutionRequestDocument extends IExecutionRequest, Document {}

const executionRequestSchema = new Schema<ExecutionRequestDocument>({
  // Request identification
  executionNumber: {
    type: String,
    required: [true, 'Execution number is required'],
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
    enum: Object.values(ExecutionType),
    required: [true, 'Execution type is required'],
  },
  status: {
    type: String,
    enum: Object.values(ExecutionStatus),
    default: ExecutionStatus.DRAFT,
  },
  priority: {
    type: String,
    enum: Object.values(ExecutionPriority),
    default: ExecutionPriority.MEDIUM,
  },
  
  // Court information
  courtInfo: {
    courtName: {
      type: String,
      required: [true, 'Court name is required'],
      trim: true,
    },
    courtNameAr: {
      type: String,
      trim: true,
    },
    courtType: {
      type: String,
      required: [true, 'Court type is required'],
      trim: true,
    },
    courtTypeAr: {
      type: String,
      trim: true,
    },
    judgeNumber: {
      type: String,
      trim: true,
    },
    judgmentNumber: {
      type: String,
      required: [true, 'Judgment number is required'],
      trim: true,
    },
    judgmentDate: {
      type: Date,
      required: [true, 'Judgment date is required'],
    },
    judgmentAmount: {
      type: Number,
      min: [0, 'Judgment amount cannot be negative'],
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'SAR',
      uppercase: true,
    },
    isAppealable: {
      type: Boolean,
      default: true,
    },
    appealDeadline: Date,
  },
  
  // Creditor information
  creditor: {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
    },
    name: {
      type: String,
      required: [true, 'Creditor name is required'],
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
    commercialRegister: {
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
      required: [true, 'Creditor address is required'],
      trim: true,
    },
    addressAr: {
      type: String,
      trim: true,
    },
    legalRepresentative: {
      name: {
        type: String,
        trim: true,
      },
      nameAr: {
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
  },
  
  // Debtor information
  debtor: {
    name: {
      type: String,
      required: [true, 'Debtor name is required'],
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
    commercialRegister: {
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
      required: [true, 'Debtor address is required'],
      trim: true,
    },
    addressAr: {
      type: String,
      trim: true,
    },
    employerInfo: {
      employerName: {
        type: String,
        trim: true,
      },
      employerNameAr: {
        type: String,
        trim: true,
      },
      workAddress: {
        type: String,
        trim: true,
      },
      workAddressAr: {
        type: String,
        trim: true,
      },
      salary: {
        type: Number,
        min: [0, 'Salary cannot be negative'],
      },
      currency: {
        type: String,
        default: 'SAR',
      },
    },
    bankAccounts: [{
      bankName: {
        type: String,
        required: true,
        trim: true,
      },
      bankNameAr: {
        type: String,
        trim: true,
      },
      accountNumber: {
        type: String,
        required: true,
        trim: true,
      },
      iban: {
        type: String,
        trim: true,
      },
      estimatedBalance: {
        type: Number,
        min: [0, 'Estimated balance cannot be negative'],
      },
      currency: {
        type: String,
        default: 'SAR',
      },
    }],
    knownAssets: [{
      type: {
        type: String,
        enum: ['real_estate', 'vehicle', 'business', 'investment', 'other'],
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
      estimatedValue: {
        type: Number,
        min: [0, 'Estimated value cannot be negative'],
      },
      currency: {
        type: String,
        default: 'SAR',
      },
      location: {
        type: String,
        trim: true,
      },
      locationAr: {
        type: String,
        trim: true,
      },
      registrationNumber: {
        type: String,
        trim: true,
      },
    }],
  },
  
  // Financial information
  financialInfo: {
    originalAmount: {
      type: Number,
      required: [true, 'Original amount is required'],
      min: [0, 'Original amount cannot be negative'],
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'SAR',
      uppercase: true,
    },
    interestAmount: {
      type: Number,
      default: 0,
      min: [0, 'Interest amount cannot be negative'],
    },
    feesAmount: {
      type: Number,
      default: 0,
      min: [0, 'Fees amount cannot be negative'],
    },
    totalClaimedAmount: {
      type: Number,
      required: [true, 'Total claimed amount is required'],
      min: [0, 'Total claimed amount cannot be negative'],
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative'],
    },
    remainingAmount: {
      type: Number,
      required: [true, 'Remaining amount is required'],
      min: [0, 'Remaining amount cannot be negative'],
    },
    
    payments: [{
      amount: {
        type: Number,
        required: true,
        min: [0, 'Payment amount cannot be negative'],
      },
      paymentDate: {
        type: Date,
        required: true,
      },
      paymentMethod: {
        type: String,
        required: true,
        trim: true,
      },
      receiptNumber: {
        type: String,
        trim: true,
      },
      notes: {
        type: String,
        trim: true,
      },
      notesAr: {
        type: String,
        trim: true,
      },
    }],
    
    executionCosts: {
      courtFees: {
        type: Number,
        default: 0,
        min: [0, 'Court fees cannot be negative'],
      },
      lawyerFees: {
        type: Number,
        default: 0,
        min: [0, 'Lawyer fees cannot be negative'],
      },
      enforcementFees: {
        type: Number,
        default: 0,
        min: [0, 'Enforcement fees cannot be negative'],
      },
      otherCosts: {
        type: Number,
        default: 0,
        min: [0, 'Other costs cannot be negative'],
      },
      totalCosts: {
        type: Number,
        default: 0,
        min: [0, 'Total costs cannot be negative'],
      },
    },
  },
  
  // Execution details
  executionDetails: {
    requestedActions: [{
      type: String,
      trim: true,
    }],
    requestedActionsAr: [{
      type: String,
      trim: true,
    }],
    specificInstructions: {
      type: String,
      trim: true,
    },
    specificInstructionsAr: {
      type: String,
      trim: true,
    },
    timeframe: {
      type: String,
      trim: true,
    },
    timeframeAr: {
      type: String,
      trim: true,
    },
    
    targetAssets: [{
      assetType: {
        type: String,
        required: true,
        trim: true,
      },
      assetTypeAr: {
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
      location: {
        type: String,
        trim: true,
      },
      locationAr: {
        type: String,
        trim: true,
      },
      estimatedValue: {
        type: Number,
        min: [0, 'Estimated value cannot be negative'],
      },
      seizureDate: Date,
      actualValue: {
        type: Number,
        min: [0, 'Actual value cannot be negative'],
      },
      liquidationDate: Date,
      liquidationAmount: {
        type: Number,
        min: [0, 'Liquidation amount cannot be negative'],
      },
    }],
    
    garnishmentDetails: {
      employerName: {
        type: String,
        trim: true,
      },
      employerNameAr: {
        type: String,
        trim: true,
      },
      employerAddress: {
        type: String,
        trim: true,
      },
      employerAddressAr: {
        type: String,
        trim: true,
      },
      monthlyAmount: {
        type: Number,
        min: [0, 'Monthly amount cannot be negative'],
      },
      percentage: {
        type: Number,
        min: [0, 'Percentage cannot be negative'],
        max: [100, 'Percentage cannot exceed 100'],
      },
      startDate: Date,
      endDate: Date,
    },
  },
  
  // Supporting documents
  supportingDocuments: [{
    documentType: {
      type: String,
      required: true,
      trim: true,
    },
    documentTypeAr: {
      type: String,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: [0, 'File size cannot be negative'],
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
    isRequired: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    notes: {
      type: String,
      trim: true,
    },
    notesAr: {
      type: String,
      trim: true,
    },
  }],
  
  // Execution progress
  executionProgress: {
    currentPhase: {
      type: String,
      trim: true,
      default: 'Initial Review',
    },
    currentPhaseAr: {
      type: String,
      trim: true,
      default: 'المراجعة الأولية',
    },
    phaseStartDate: {
      type: Date,
      default: Date.now,
    },
    expectedCompletionDate: Date,
    actualCompletionDate: Date,
    completionPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Completion percentage cannot be negative'],
      max: [100, 'Completion percentage cannot exceed 100'],
    },
    
    milestones: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      nameAr: {
        type: String,
        trim: true,
      },
      targetDate: Date,
      completedDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'delayed', 'cancelled'],
        default: 'pending',
      },
      responsibleParty: {
        type: String,
        trim: true,
      },
      responsiblePartyAr: {
        type: String,
        trim: true,
      },
      notes: {
        type: String,
        trim: true,
      },
      notesAr: {
        type: String,
        trim: true,
      },
    }],
    
    obstacles: [{
      type: {
        type: String,
        required: true,
        trim: true,
      },
      typeAr: {
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
      reportedDate: {
        type: Date,
        required: true,
      },
      reportedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      resolution: {
        type: String,
        trim: true,
      },
      resolutionAr: {
        type: String,
        trim: true,
      },
      resolvedDate: Date,
      resolvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    }],
  },
  
  // Communication log
  communicationLog: [{
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['court', 'debtor', 'creditor', 'enforcement_officer', 'lawyer', 'other'],
      required: true,
    },
    method: {
      type: String,
      enum: ['email', 'phone', 'meeting', 'letter', 'court_hearing', 'other'],
      required: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    summaryAr: {
      type: String,
      trim: true,
    },
    outcome: {
      type: String,
      trim: true,
    },
    outcomeAr: {
      type: String,
      trim: true,
    },
    nextAction: {
      type: String,
      trim: true,
    },
    nextActionAr: {
      type: String,
      trim: true,
    },
    nextActionDate: Date,
    conductedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  }],
  
  // Court proceedings
  courtProceedings: [{
    hearingDate: Date,
    hearingType: {
      type: String,
      required: true,
      trim: true,
    },
    hearingTypeAr: {
      type: String,
      trim: true,
    },
    courtDecision: {
      type: String,
      trim: true,
    },
    courtDecisionAr: {
      type: String,
      trim: true,
    },
    decisionDate: Date,
    nextHearingDate: Date,
    attendees: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      nameAr: {
        type: String,
        trim: true,
      },
      role: {
        type: String,
        required: true,
        trim: true,
      },
      roleAr: {
        type: String,
        trim: true,
      },
      attended: {
        type: Boolean,
        default: false,
      },
    }],
    minutes: {
      type: String,
      trim: true,
    },
    minutesAr: {
      type: String,
      trim: true,
    },
  }],
  
  // Compliance
  compliance: {
    requiredNotifications: [{
      recipientType: {
        type: String,
        required: true,
        trim: true,
      },
      recipientTypeAr: {
        type: String,
        trim: true,
      },
      notificationMethod: {
        type: String,
        required: true,
        trim: true,
      },
      notificationDate: Date,
      deliveryStatus: {
        type: String,
        enum: ['pending', 'delivered', 'failed', 'acknowledged'],
        default: 'pending',
      },
      acknowledgedDate: Date,
      proofOfDelivery: {
        type: String,
        trim: true,
      },
    }],
    
    legalDeadlines: [{
      deadlineType: {
        type: String,
        required: true,
        trim: true,
      },
      deadlineTypeAr: {
        type: String,
        trim: true,
      },
      dueDate: {
        type: Date,
        required: true,
      },
      completedDate: Date,
      status: {
        type: String,
        enum: ['pending', 'completed', 'overdue', 'extended'],
        default: 'pending',
      },
      extension: {
        newDate: Date,
        reason: {
          type: String,
          trim: true,
        },
        reasonAr: {
          type: String,
          trim: true,
        },
        approvedBy: {
          type: String,
          trim: true,
        },
      },
    }],
  },
  
  // Appeals
  appeals: {
    appealNumber: {
      type: String,
      trim: true,
    },
    appealDate: Date,
    appealedBy: {
      type: String,
      trim: true,
    },
    appealedByAr: {
      type: String,
      trim: true,
    },
    appealReason: {
      type: String,
      trim: true,
    },
    appealReasonAr: {
      type: String,
      trim: true,
    },
    appealStatus: {
      type: String,
      enum: ['filed', 'under_review', 'accepted', 'rejected', 'withdrawn'],
    },
    appealDecision: {
      type: String,
      trim: true,
    },
    appealDecisionAr: {
      type: String,
      trim: true,
    },
    appealDecisionDate: Date,
    impactOnExecution: {
      type: String,
      trim: true,
    },
    impactOnExecutionAr: {
      type: String,
      trim: true,
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
  
  // Team assignments
  assignedTeam: {
    primaryLawyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Primary lawyer is required'],
    },
    supportingLawyers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    paralegal: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    enforcementOfficer: {
      type: String,
      trim: true,
    },
    enforcementOfficerAr: {
      type: String,
      trim: true,
    },
    externalAgents: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      nameAr: {
        type: String,
        trim: true,
      },
      role: {
        type: String,
        required: true,
        trim: true,
      },
      roleAr: {
        type: String,
        trim: true,
      },
      contact: {
        type: String,
        required: true,
        trim: true,
      },
      specialization: {
        type: String,
        trim: true,
      },
    }],
  },
  
  // Cost tracking
  costTracking: {
    budgetAllocated: {
      type: Number,
      min: [0, 'Budget allocated cannot be negative'],
    },
    actualCosts: {
      type: Number,
      default: 0,
      min: [0, 'Actual costs cannot be negative'],
    },
    recoveredAmount: {
      type: Number,
      default: 0,
      min: [0, 'Recovered amount cannot be negative'],
    },
    netRecovery: {
      type: Number,
      default: 0,
    },
    costEfficiencyRatio: {
      type: Number,
      min: [0, 'Cost efficiency ratio cannot be negative'],
    },
    
    costBreakdown: [{
      category: {
        type: String,
        required: true,
        trim: true,
      },
      categoryAr: {
        type: String,
        trim: true,
      },
      budgeted: {
        type: Number,
        min: [0, 'Budgeted amount cannot be negative'],
      },
      actual: {
        type: Number,
        required: true,
        min: [0, 'Actual amount cannot be negative'],
      },
      variance: Number,
      notes: {
        type: String,
        trim: true,
      },
      notesAr: {
        type: String,
        trim: true,
      },
    }],
  },
  
  // Success metrics
  successMetrics: {
    recoveryRate: {
      type: Number,
      min: [0, 'Recovery rate cannot be negative'],
      max: [100, 'Recovery rate cannot exceed 100'],
    },
    timeToCompletion: {
      type: Number,
      min: [0, 'Time to completion cannot be negative'],
    },
    costEffectiveness: {
      type: Number,
      min: [0, 'Cost effectiveness cannot be negative'],
    },
    clientSatisfactionScore: {
      type: Number,
      min: [1, 'Client satisfaction score must be at least 1'],
      max: [10, 'Client satisfaction score cannot exceed 10'],
    },
    complexityRating: {
      type: Number,
      min: [1, 'Complexity rating must be at least 1'],
      max: [10, 'Complexity rating cannot exceed 10'],
    },
  },
  
  // Tags and categorization
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  category: {
    type: String,
    trim: true,
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
executionRequestSchema.index({ lawFirmId: 1 });
executionRequestSchema.index({ executionNumber: 1 }, { unique: true });
executionRequestSchema.index({ type: 1 });
executionRequestSchema.index({ status: 1 });
executionRequestSchema.index({ priority: 1 });
executionRequestSchema.index({ 'courtInfo.judgmentDate': -1 });
executionRequestSchema.index({ 'assignedTeam.primaryLawyer': 1 });
executionRequestSchema.index({ 'creditor.name': 1 });
executionRequestSchema.index({ 'debtor.name': 1 });

// Compound indexes
executionRequestSchema.index({ lawFirmId: 1, status: 1 });
executionRequestSchema.index({ lawFirmId: 1, type: 1 });
executionRequestSchema.index({ 'assignedTeam.primaryLawyer': 1, status: 1 });

// Virtual for is overdue
executionRequestSchema.virtual('isOverdue').get(function() {
  if (!this.executionProgress?.expectedCompletionDate) return false;
  return this.executionProgress.expectedCompletionDate < new Date() && 
         this.status !== ExecutionStatus.COMPLETED;
});

// Virtual for recovery percentage
executionRequestSchema.virtual('recoveryPercentage').get(function() {
  if (!this.financialInfo?.totalClaimedAmount) return 0;
  return Math.round((this.costTracking?.recoveredAmount || 0) / this.financialInfo.totalClaimedAmount * 100);
});

// Virtual for days in progress
executionRequestSchema.virtual('daysInProgress').get(function() {
  const startDate = this.executionProgress?.phaseStartDate || this.createdAt;
  const endDate = this.executionProgress?.actualCompletionDate || new Date();
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
executionRequestSchema.pre('save', function(next) {
  // Calculate remaining amount
  if (this.financialInfo) {
    this.financialInfo.remainingAmount = this.financialInfo.totalClaimedAmount - this.financialInfo.paidAmount;
  }
  
  // Calculate total costs
  if (this.financialInfo?.executionCosts) {
    const costs = this.financialInfo.executionCosts;
    costs.totalCosts = (costs.courtFees || 0) + (costs.lawyerFees || 0) + 
                       (costs.enforcementFees || 0) + (costs.otherCosts || 0);
  }
  
  // Calculate net recovery
  if (this.costTracking) {
    this.costTracking.netRecovery = (this.costTracking.recoveredAmount || 0) - 
                                    (this.costTracking.actualCosts || 0);
  }
  
  next();
});

// Static method to generate execution number
executionRequestSchema.statics.generateExecutionNumber = async function(lawFirmId: mongoose.Types.ObjectId) {
  const year = new Date().getFullYear();
  const prefix = `EXE-${year}-`;
  
  // Find the last execution request for this year
  const lastExecution = await this.findOne({
    lawFirmId,
    executionNumber: { $regex: `^${prefix}` }
  }).sort({ executionNumber: -1 });
  
  let sequence = 1;
  if (lastExecution) {
    const lastSequence = parseInt(lastExecution.executionNumber.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(6, '0')}`;
};

export const ExecutionRequest = mongoose.model<ExecutionRequestDocument>('ExecutionRequest', executionRequestSchema);
