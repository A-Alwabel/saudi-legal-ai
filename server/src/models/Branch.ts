import mongoose, { Schema, Document } from 'mongoose';

export enum BranchStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNDER_CONSTRUCTION = 'under_construction',
  TEMPORARILY_CLOSED = 'temporarily_closed',
  PERMANENTLY_CLOSED = 'permanently_closed',
}

export enum BranchType {
  HEAD_OFFICE = 'head_office',
  BRANCH_OFFICE = 'branch_office',
  REPRESENTATIVE_OFFICE = 'representative_office',
  SERVICE_CENTER = 'service_center',
  VIRTUAL_OFFICE = 'virtual_office',
}

export interface IBranch {
  _id?: string;
  
  // Branch identification
  branchCode: string;
  branchName: string;
  branchNameAr?: string;
  branchType: BranchType;
  status: BranchStatus;
  
  // Location details
  address: {
    street: string;
    streetAr?: string;
    district: string;
    districtAr?: string;
    city: string;
    cityAr?: string;
    province: string;
    provinceAr?: string;
    postalCode: string;
    country: string;
    countryAr?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Contact information
  contactInfo: {
    phone: string;
    alternatePhone?: string;
    fax?: string;
    email: string;
    website?: string;
  };
  
  // Operating hours
  operatingHours: {
    [key: string]: {
      isOpen: boolean;
      openTime?: string; // HH:MM format
      closeTime?: string; // HH:MM format
      breakStart?: string;
      breakEnd?: string;
    };
  };
  
  // Services offered
  services: {
    serviceId: string;
    serviceName: string;
    serviceNameAr?: string;
    isActive: boolean;
    pricing?: {
      basePrice: number;
      currency: string;
      pricingModel: 'fixed' | 'hourly' | 'consultation';
    };
  }[];
  
  // Staff and management
  branchManager?: mongoose.Types.ObjectId; // Employee ID
  staff: mongoose.Types.ObjectId[]; // Employee IDs
  capacity: {
    maxStaff: number;
    currentStaff: number;
    maxClients: number; // Daily capacity
    consultationRooms: number;
    meetingRooms: number;
    parkingSpaces?: number;
  };
  
  // Financial information
  financials: {
    monthlyRent?: number;
    securityDeposit?: number;
    utilities?: number;
    insurance?: number;
    otherExpenses?: number;
    currency: string;
    budgetAllocated?: number;
    revenueTarget?: number;
  };
  
  // Legal and compliance
  licenses: {
    licenseType: string;
    licenseNumber: string;
    issuingAuthority: string;
    issueDate: Date;
    expiryDate: Date;
    status: 'active' | 'expired' | 'suspended' | 'pending_renewal';
    renewalDate?: Date;
    attachments?: string[];
  }[];
  
  // Technology and infrastructure
  infrastructure: {
    internetSpeed?: string;
    phoneLines: number;
    computerWorkstations: number;
    printers: number;
    securitySystem: boolean;
    cctv: boolean;
    fireAlarm: boolean;
    accessControl: boolean;
    backup: {
      powerBackup: boolean;
      dataBackup: boolean;
      internetBackup: boolean;
    };
  };
  
  // Performance metrics
  metrics: {
    monthlyRevenue?: number;
    monthlyExpenses?: number;
    clientSatisfactionScore?: number;
    caseCompletionRate?: number;
    averageResponseTime?: number; // in hours
    employeeSatisfactionScore?: number;
  };
  
  // Reporting and hierarchy
  reportsTo?: mongoose.Types.ObjectId; // Parent branch ID
  subordinateBranches: mongoose.Types.ObjectId[]; // Child branch IDs
  
  // Operational dates
  establishedDate: Date;
  openingDate?: Date;
  closingDate?: Date;
  lastInspectionDate?: Date;
  nextInspectionDate?: Date;
  
  // Additional information
  description?: string;
  descriptionAr?: string;
  specializations: string[]; // Legal specializations
  languages: string[]; // Languages supported
  clientTypes: string[]; // Types of clients served
  
  // Marketing and visibility
  isPubliclyVisible: boolean;
  marketingMaterials?: {
    brochures: string[];
    photos: string[];
    videos: string[];
    virtualTour?: string;
  };
  
  // Emergency and safety
  emergencyContacts: {
    name: string;
    position: string;
    phone: string;
    email?: string;
    relationship: string;
  }[];
  
  safetyProtocols: {
    evacuationPlan: boolean;
    firstAidKit: boolean;
    emergencyExits: number;
    safetyOfficer?: mongoose.Types.ObjectId;
    lastSafetyDrill?: Date;
  };
  
  // Law firm
  lawFirmId: mongoose.Types.ObjectId;
  
  // Additional notes
  notes?: string;
  notesAr?: string;
  internalNotes?: string; // Management notes, not visible to all staff
  
  // Audit trail
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchDocument extends IBranch, Document {}

const branchSchema = new Schema<BranchDocument>({
  // Branch identification
  branchCode: {
    type: String,
    required: [true, 'Branch code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [10, 'Branch code cannot exceed 10 characters'],
  },
  branchName: {
    type: String,
    required: [true, 'Branch name is required'],
    trim: true,
    maxlength: [100, 'Branch name cannot exceed 100 characters'],
  },
  branchNameAr: {
    type: String,
    trim: true,
    maxlength: [100, 'Arabic branch name cannot exceed 100 characters'],
  },
  branchType: {
    type: String,
    enum: Object.values(BranchType),
    required: [true, 'Branch type is required'],
  },
  status: {
    type: String,
    enum: Object.values(BranchStatus),
    default: BranchStatus.ACTIVE,
  },
  
  // Location details
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
    },
    streetAr: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    districtAr: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    cityAr: {
      type: String,
      trim: true,
    },
    province: {
      type: String,
      required: [true, 'Province is required'],
      trim: true,
    },
    provinceAr: {
      type: String,
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      default: 'Saudi Arabia',
    },
    countryAr: {
      type: String,
      trim: true,
      default: 'المملكة العربية السعودية',
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
      },
    },
  },
  
  // Contact information
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
    },
    fax: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    website: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  
  // Operating hours
  operatingHours: {
    type: Map,
    of: {
      isOpen: {
        type: Boolean,
        default: true,
      },
      openTime: String,
      closeTime: String,
      breakStart: String,
      breakEnd: String,
    },
    default: {
      sunday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
      monday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
      tuesday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
      wednesday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
      thursday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
      friday: { isOpen: false },
      saturday: { isOpen: false },
    },
  },
  
  // Services offered
  services: [{
    serviceId: {
      type: String,
      required: true,
      trim: true,
    },
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    serviceNameAr: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    pricing: {
      basePrice: {
        type: Number,
        min: [0, 'Base price cannot be negative'],
      },
      currency: {
        type: String,
        default: 'SAR',
        uppercase: true,
      },
      pricingModel: {
        type: String,
        enum: ['fixed', 'hourly', 'consultation'],
        default: 'consultation',
      },
    },
  }],
  
  // Staff and management
  branchManager: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
  },
  staff: [{
    type: Schema.Types.ObjectId,
    ref: 'Employee',
  }],
  capacity: {
    maxStaff: {
      type: Number,
      required: [true, 'Maximum staff capacity is required'],
      min: [1, 'Maximum staff must be at least 1'],
    },
    currentStaff: {
      type: Number,
      default: 0,
      min: [0, 'Current staff cannot be negative'],
    },
    maxClients: {
      type: Number,
      required: [true, 'Maximum client capacity is required'],
      min: [1, 'Maximum clients must be at least 1'],
    },
    consultationRooms: {
      type: Number,
      required: [true, 'Number of consultation rooms is required'],
      min: [0, 'Consultation rooms cannot be negative'],
    },
    meetingRooms: {
      type: Number,
      required: [true, 'Number of meeting rooms is required'],
      min: [0, 'Meeting rooms cannot be negative'],
    },
    parkingSpaces: {
      type: Number,
      min: [0, 'Parking spaces cannot be negative'],
    },
  },
  
  // Financial information
  financials: {
    monthlyRent: {
      type: Number,
      min: [0, 'Monthly rent cannot be negative'],
    },
    securityDeposit: {
      type: Number,
      min: [0, 'Security deposit cannot be negative'],
    },
    utilities: {
      type: Number,
      min: [0, 'Utilities cost cannot be negative'],
    },
    insurance: {
      type: Number,
      min: [0, 'Insurance cost cannot be negative'],
    },
    otherExpenses: {
      type: Number,
      min: [0, 'Other expenses cannot be negative'],
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'SAR',
      uppercase: true,
    },
    budgetAllocated: {
      type: Number,
      min: [0, 'Budget allocated cannot be negative'],
    },
    revenueTarget: {
      type: Number,
      min: [0, 'Revenue target cannot be negative'],
    },
  },
  
  // Legal and compliance
  licenses: [{
    licenseType: {
      type: String,
      required: true,
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true,
    },
    issuingAuthority: {
      type: String,
      required: true,
      trim: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'suspended', 'pending_renewal'],
      default: 'active',
    },
    renewalDate: Date,
    attachments: [String],
  }],
  
  // Technology and infrastructure
  infrastructure: {
    internetSpeed: String,
    phoneLines: {
      type: Number,
      required: [true, 'Number of phone lines is required'],
      min: [0, 'Phone lines cannot be negative'],
    },
    computerWorkstations: {
      type: Number,
      required: [true, 'Number of computer workstations is required'],
      min: [0, 'Computer workstations cannot be negative'],
    },
    printers: {
      type: Number,
      required: [true, 'Number of printers is required'],
      min: [0, 'Printers cannot be negative'],
    },
    securitySystem: {
      type: Boolean,
      default: false,
    },
    cctv: {
      type: Boolean,
      default: false,
    },
    fireAlarm: {
      type: Boolean,
      default: false,
    },
    accessControl: {
      type: Boolean,
      default: false,
    },
    backup: {
      powerBackup: {
        type: Boolean,
        default: false,
      },
      dataBackup: {
        type: Boolean,
        default: false,
      },
      internetBackup: {
        type: Boolean,
        default: false,
      },
    },
  },
  
  // Performance metrics
  metrics: {
    monthlyRevenue: {
      type: Number,
      min: [0, 'Monthly revenue cannot be negative'],
    },
    monthlyExpenses: {
      type: Number,
      min: [0, 'Monthly expenses cannot be negative'],
    },
    clientSatisfactionScore: {
      type: Number,
      min: [1, 'Client satisfaction score must be between 1 and 5'],
      max: [5, 'Client satisfaction score must be between 1 and 5'],
    },
    caseCompletionRate: {
      type: Number,
      min: [0, 'Case completion rate must be between 0 and 1'],
      max: [1, 'Case completion rate must be between 0 and 1'],
    },
    averageResponseTime: {
      type: Number,
      min: [0, 'Average response time cannot be negative'],
    },
    employeeSatisfactionScore: {
      type: Number,
      min: [1, 'Employee satisfaction score must be between 1 and 5'],
      max: [5, 'Employee satisfaction score must be between 1 and 5'],
    },
  },
  
  // Reporting and hierarchy
  reportsTo: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
  },
  subordinateBranches: [{
    type: Schema.Types.ObjectId,
    ref: 'Branch',
  }],
  
  // Operational dates
  establishedDate: {
    type: Date,
    required: [true, 'Established date is required'],
  },
  openingDate: Date,
  closingDate: Date,
  lastInspectionDate: Date,
  nextInspectionDate: Date,
  
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
  specializations: [{
    type: String,
    trim: true,
  }],
  languages: [{
    type: String,
    trim: true,
  }],
  clientTypes: [{
    type: String,
    trim: true,
  }],
  
  // Marketing and visibility
  isPubliclyVisible: {
    type: Boolean,
    default: true,
  },
  marketingMaterials: {
    brochures: [String],
    photos: [String],
    videos: [String],
    virtualTour: String,
  },
  
  // Emergency and safety
  emergencyContacts: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    relationship: {
      type: String,
      required: true,
      trim: true,
    },
  }],
  
  safetyProtocols: {
    evacuationPlan: {
      type: Boolean,
      default: false,
    },
    firstAidKit: {
      type: Boolean,
      default: false,
    },
    emergencyExits: {
      type: Number,
      required: [true, 'Number of emergency exits is required'],
      min: [1, 'Must have at least 1 emergency exit'],
    },
    safetyOfficer: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
    lastSafetyDrill: Date,
  },
  
  // Law firm
  lawFirmId: {
    type: Schema.Types.ObjectId,
    ref: 'LawFirm',
    required: [true, 'Law firm is required'],
  },
  
  // Additional notes
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
branchSchema.index({ lawFirmId: 1 });
branchSchema.index({ branchCode: 1 }, { unique: true });
branchSchema.index({ branchType: 1 });
branchSchema.index({ status: 1 });
branchSchema.index({ 'address.city': 1 });
branchSchema.index({ 'address.province': 1 });

// Compound indexes
branchSchema.index({ lawFirmId: 1, status: 1 });
branchSchema.index({ lawFirmId: 1, branchType: 1 });
branchSchema.index({ reportsTo: 1 });

// Virtual for full address
branchSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.district}, ${this.address.city}, ${this.address.province} ${this.address.postalCode}`;
});

// Virtual for full Arabic address
branchSchema.virtual('fullAddressAr').get(function() {
  return `${this.address.streetAr || this.address.street}, ${this.address.districtAr || this.address.district}, ${this.address.cityAr || this.address.city}, ${this.address.provinceAr || this.address.province} ${this.address.postalCode}`;
});

// Virtual for is head office
branchSchema.virtual('isHeadOffice').get(function() {
  return this.branchType === BranchType.HEAD_OFFICE;
});

// Virtual for total monthly expenses
branchSchema.virtual('totalMonthlyExpenses').get(function() {
  return (this.financials.monthlyRent || 0) +
         (this.financials.utilities || 0) +
         (this.financials.insurance || 0) +
         (this.financials.otherExpenses || 0);
});

// Virtual for staff utilization
branchSchema.virtual('staffUtilization').get(function() {
  return this.capacity.maxStaff > 0 ? (this.capacity.currentStaff / this.capacity.maxStaff) : 0;
});

// Virtual for is operating today
branchSchema.virtual('isOperatingToday').get(function() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
  const todayHours = this.operatingHours.get(today);
  return todayHours?.isOpen || false;
});

// Pre-save middleware
branchSchema.pre('save', function(next) {
  // Update current staff count based on staff array
  this.capacity.currentStaff = this.staff.length;
  
  // Ensure head office is unique per law firm
  if (this.branchType === BranchType.HEAD_OFFICE && this.isNew) {
    // This validation would need to be handled in the route or with a custom validator
  }
  
  next();
});

// Validation
branchSchema.pre('save', function(next) {
  // Validate that expiry dates are after issue dates for licenses
  for (const license of this.licenses) {
    if (license.expiryDate <= license.issueDate) {
      next(new Error('License expiry date must be after issue date'));
      return;
    }
  }
  
  // Validate that current staff doesn't exceed max staff
  if (this.capacity.currentStaff > this.capacity.maxStaff) {
    next(new Error('Current staff cannot exceed maximum staff capacity'));
    return;
  }
  
  next();
});

// Static method to generate branch code
branchSchema.statics.generateBranchCode = async function(lawFirmId: mongoose.Types.ObjectId, branchType: BranchType) {
  const typePrefix = branchType === BranchType.HEAD_OFFICE ? 'HQ' : 
                    branchType === BranchType.BRANCH_OFFICE ? 'BR' :
                    branchType === BranchType.REPRESENTATIVE_OFFICE ? 'REP' :
                    branchType === BranchType.SERVICE_CENTER ? 'SC' : 'VO';
  
  // Find the last branch for this type
  const lastBranch = await this.findOne({
    lawFirmId,
    branchCode: { $regex: `^${typePrefix}` }
  }).sort({ branchCode: -1 });
  
  let sequence = 1;
  if (lastBranch) {
    const lastSequence = parseInt(lastBranch.branchCode.replace(`${typePrefix}`, ''));
    sequence = lastSequence + 1;
  }
  
  return `${typePrefix}${sequence.toString().padStart(3, '0')}`;
};

export const Branch = mongoose.model<BranchDocument>('Branch', branchSchema);
