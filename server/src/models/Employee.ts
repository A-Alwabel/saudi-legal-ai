import mongoose, { Schema, Document } from 'mongoose';

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated',
  SUSPENDED = 'suspended',
}

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERN = 'intern',
  CONSULTANT = 'consultant',
}

export enum EmployeeRole {
  SENIOR_PARTNER = 'senior_partner',
  PARTNER = 'partner',
  SENIOR_LAWYER = 'senior_lawyer',
  LAWYER = 'lawyer',
  JUNIOR_LAWYER = 'junior_lawyer',
  PARALEGAL = 'paralegal',
  LEGAL_ASSISTANT = 'legal_assistant',
  SECRETARY = 'secretary',
  ADMIN = 'admin',
  HR = 'hr',
  FINANCE = 'finance',
  IT = 'it',
  INTERN = 'intern',
  OTHER = 'other',
}

export interface IEmployee {
  _id?: string;
  
  // Basic Information
  employeeId: string; // Unique employee identifier
  userId?: mongoose.Types.ObjectId; // Link to User account if they have system access
  
  // Personal Information
  firstName: string;
  lastName: string;
  firstNameAr?: string;
  lastNameAr?: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth?: Date;
  nationality?: string;
  nationalId?: string; // Saudi ID or Iqama
  passportNumber?: string;
  
  // Address Information
  address: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  
  // Employment Information
  status: EmployeeStatus;
  employmentType: EmploymentType;
  role: EmployeeRole;
  department?: string;
  position: string;
  positionAr?: string;
  
  // Dates
  hireDate: Date;
  probationEndDate?: Date;
  terminationDate?: Date;
  lastWorkingDay?: Date;
  
  // Reporting Structure
  managerId?: mongoose.Types.ObjectId; // Reports to
  directReports?: mongoose.Types.ObjectId[]; // Manages these employees
  
  // Compensation
  salary: {
    amount: number;
    currency: string;
    frequency: 'monthly' | 'annually'; // Saudi typically monthly
    effectiveDate: Date;
  };
  salaryHistory?: {
    amount: number;
    currency: string;
    frequency: 'monthly' | 'annually';
    effectiveDate: Date;
    reason?: string;
  }[];
  
  // Benefits
  benefits?: {
    healthInsurance: boolean;
    dentalInsurance: boolean;
    lifeInsurance: boolean;
    retirementPlan: boolean;
    paidTimeOff: number; // days per year
    sickLeave: number; // days per year
    maternityLeave?: number; // days
    paternityLeave?: number; // days
    other?: string[];
  };
  
  // Work Schedule
  workSchedule: {
    workingDays: ('sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday')[];
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    breakDuration?: number; // minutes
    hoursPerWeek: number;
  };
  
  // Skills and Qualifications
  qualifications?: {
    degree: string;
    institution: string;
    year?: number;
    field?: string;
  }[];
  certifications?: {
    name: string;
    issuingOrganization: string;
    issueDate?: Date;
    expiryDate?: Date;
    credentialId?: string;
  }[];
  skills?: string[];
  languages?: {
    language: string;
    proficiency: 'basic' | 'intermediate' | 'advanced' | 'native';
  }[];
  
  // Performance
  performanceReviews?: {
    reviewDate: Date;
    reviewer: mongoose.Types.ObjectId;
    rating: number; // 1-5 scale
    goals: string[];
    achievements: string[];
    areasForImprovement: string[];
    comments?: string;
  }[];
  
  // Disciplinary Actions
  disciplinaryActions?: {
    date: Date;
    type: 'verbal_warning' | 'written_warning' | 'suspension' | 'termination';
    reason: string;
    description: string;
    issuedBy: mongoose.Types.ObjectId;
    acknowledged: boolean;
    acknowledgedDate?: Date;
  }[];
  
  // Documents
  documents?: {
    type: string; // 'contract', 'id_copy', 'resume', 'certificate', etc.
    fileName: string;
    filePath: string;
    uploadDate: Date;
    uploadedBy: mongoose.Types.ObjectId;
  }[];
  
  // System Access
  systemAccess: {
    hasAccess: boolean;
    roles: string[];
    permissions: string[];
    lastLogin?: Date;
    accountStatus: 'active' | 'inactive' | 'locked';
  };
  
  // Law firm
  lawFirmId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  
  // Additional Information
  notes?: string;
  notesAr?: string;
  
  // Audit trail
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeDocument extends IEmployee, Document {}

const employeeSchema = new Schema<EmployeeDocument>({
  // Basic Information
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [100, 'First name cannot exceed 100 characters'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [100, 'Last name cannot exceed 100 characters'],
  },
  firstNameAr: {
    type: String,
    trim: true,
    maxlength: [100, 'Arabic first name cannot exceed 100 characters'],
  },
  lastNameAr: {
    type: String,
    trim: true,
    maxlength: [100, 'Arabic last name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    unique: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true,
  },
  alternatePhone: {
    type: String,
    trim: true,
  },
  dateOfBirth: Date,
  nationality: {
    type: String,
    trim: true,
  },
  nationalId: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },
  passportNumber: {
    type: String,
    trim: true,
  },
  
  // Address Information
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },
  },
  emergencyContact: {
    name: {
      type: String,
      required: [true, 'Emergency contact name is required'],
      trim: true,
    },
    relationship: {
      type: String,
      required: [true, 'Emergency contact relationship is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Emergency contact phone is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  
  // Employment Information
  status: {
    type: String,
    enum: Object.values(EmployeeStatus),
    default: EmployeeStatus.ACTIVE,
    required: true,
  },
  employmentType: {
    type: String,
    enum: Object.values(EmploymentType),
    required: [true, 'Employment type is required'],
  },
  role: {
    type: String,
    enum: Object.values(EmployeeRole),
    required: [true, 'Employee role is required'],
  },
  department: {
    type: String,
    trim: true,
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
  },
  positionAr: {
    type: String,
    trim: true,
  },
  
  // Dates
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required'],
  },
  probationEndDate: Date,
  terminationDate: Date,
  lastWorkingDay: Date,
  
  // Reporting Structure
  managerId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
  },
  directReports: [{
    type: Schema.Types.ObjectId,
    ref: 'Employee',
  }],
  
  // Compensation
  salary: {
    amount: {
      type: Number,
      required: [true, 'Salary amount is required'],
      min: [0, 'Salary cannot be negative'],
    },
    currency: {
      type: String,
      default: 'SAR',
      required: true,
      uppercase: true,
    },
    frequency: {
      type: String,
      enum: ['monthly', 'annually'],
      default: 'monthly',
      required: true,
    },
    effectiveDate: {
      type: Date,
      required: [true, 'Salary effective date is required'],
    },
  },
  salaryHistory: [{
    amount: {
      type: Number,
      required: true,
      min: [0, 'Salary cannot be negative'],
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
    },
    frequency: {
      type: String,
      enum: ['monthly', 'annually'],
      required: true,
    },
    effectiveDate: {
      type: Date,
      required: true,
    },
    reason: String,
  }],
  
  // Benefits
  benefits: {
    healthInsurance: {
      type: Boolean,
      default: false,
    },
    dentalInsurance: {
      type: Boolean,
      default: false,
    },
    lifeInsurance: {
      type: Boolean,
      default: false,
    },
    retirementPlan: {
      type: Boolean,
      default: false,
    },
    paidTimeOff: {
      type: Number,
      default: 21, // Standard in Saudi Arabia
      min: [0, 'PTO days cannot be negative'],
    },
    sickLeave: {
      type: Number,
      default: 30, // Standard in Saudi Arabia
      min: [0, 'Sick leave days cannot be negative'],
    },
    maternityLeave: {
      type: Number,
      default: 70, // Standard in Saudi Arabia
      min: [0, 'Maternity leave days cannot be negative'],
    },
    paternityLeave: {
      type: Number,
      default: 3, // Standard in Saudi Arabia
      min: [0, 'Paternity leave days cannot be negative'],
    },
    other: [String],
  },
  
  // Work Schedule
  workSchedule: {
    workingDays: [{
      type: String,
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    }],
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'],
    },
    breakDuration: {
      type: Number,
      default: 60, // 1 hour break
      min: [0, 'Break duration cannot be negative'],
    },
    hoursPerWeek: {
      type: Number,
      required: [true, 'Hours per week is required'],
      min: [1, 'Hours per week must be at least 1'],
      max: [80, 'Hours per week cannot exceed 80'],
    },
  },
  
  // Skills and Qualifications
  qualifications: [{
    degree: {
      type: String,
      required: true,
      trim: true,
    },
    institution: {
      type: String,
      required: true,
      trim: true,
    },
    year: Number,
    field: {
      type: String,
      trim: true,
    },
  }],
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    issuingOrganization: {
      type: String,
      required: true,
      trim: true,
    },
    issueDate: Date,
    expiryDate: Date,
    credentialId: {
      type: String,
      trim: true,
    },
  }],
  skills: [{
    type: String,
    trim: true,
  }],
  languages: [{
    language: {
      type: String,
      required: true,
      trim: true,
    },
    proficiency: {
      type: String,
      enum: ['basic', 'intermediate', 'advanced', 'native'],
      required: true,
    },
  }],
  
  // Performance
  performanceReviews: [{
    reviewDate: {
      type: Date,
      required: true,
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    goals: [String],
    achievements: [String],
    areasForImprovement: [String],
    comments: String,
  }],
  
  // Disciplinary Actions
  disciplinaryActions: [{
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['verbal_warning', 'written_warning', 'suspension', 'termination'],
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    acknowledged: {
      type: Boolean,
      default: false,
    },
    acknowledgedDate: Date,
  }],
  
  // Documents
  documents: [{
    type: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    filePath: {
      type: String,
      required: true,
      trim: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  }],
  
  // System Access
  systemAccess: {
    hasAccess: {
      type: Boolean,
      default: false,
    },
    roles: [String],
    permissions: [String],
    lastLogin: Date,
    accountStatus: {
      type: String,
      enum: ['active', 'inactive', 'locked'],
      default: 'inactive',
    },
  },
  
  // Law firm
  lawFirmId: {
    type: Schema.Types.ObjectId,
    ref: 'LawFirm',
    required: [true, 'Law firm is required'],
  },
  branchId: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
  },
  
  // Additional Information
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
employeeSchema.index({ lawFirmId: 1 });
employeeSchema.index({ employeeId: 1 }, { unique: true });
employeeSchema.index({ email: 1 }, { unique: true });
employeeSchema.index({ nationalId: 1 }, { unique: true, sparse: true });
employeeSchema.index({ status: 1 });
employeeSchema.index({ role: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ managerId: 1 });
employeeSchema.index({ hireDate: 1 });

// Compound indexes
employeeSchema.index({ lawFirmId: 1, status: 1 });
employeeSchema.index({ lawFirmId: 1, role: 1 });
employeeSchema.index({ lawFirmId: 1, department: 1 });

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for full Arabic name
employeeSchema.virtual('fullNameAr').get(function() {
  if (this.firstNameAr && this.lastNameAr) {
    return `${this.firstNameAr} ${this.lastNameAr}`;
  }
  return this.fullName;
});

// Virtual for years of service
employeeSchema.virtual('yearsOfService').get(function() {
  const endDate = this.terminationDate || new Date();
  const years = (endDate.getTime() - this.hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.round(years * 100) / 100;
});

// Virtual for current age
employeeSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const age = today.getFullYear() - this.dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - this.dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.dateOfBirth.getDate())) {
    return age - 1;
  }
  return age;
});

// Virtual for annual salary
employeeSchema.virtual('annualSalary').get(function() {
  if (this.salary.frequency === 'annually') {
    return this.salary.amount;
  }
  return this.salary.amount * 12;
});

// Pre-save middleware
employeeSchema.pre('save', function(next) {
  // Set default working days for Saudi Arabia (Sunday to Thursday)
  if (!this.workSchedule.workingDays || this.workSchedule.workingDays.length === 0) {
    this.workSchedule.workingDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
  }
  
  next();
});

// Static method to generate employee ID
employeeSchema.statics.generateEmployeeId = async function(lawFirmId: mongoose.Types.ObjectId) {
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = `EMP${year}`;
  
  // Find the last employee for this year
  const lastEmployee = await this.findOne({
    lawFirmId,
    employeeId: { $regex: `^${prefix}` }
  }).sort({ employeeId: -1 });
  
  let sequence = 1;
  if (lastEmployee) {
    const lastSequence = parseInt(lastEmployee.employeeId.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(4, '0')}`;
};

export const Employee = mongoose.model<EmployeeDocument>('Employee', employeeSchema);
