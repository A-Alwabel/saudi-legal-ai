import mongoose, { Schema, Document } from 'mongoose';

export enum ContactType {
  CLIENT = 'client',
  LAWYER = 'lawyer',
  JUDGE = 'judge',
  EXPERT_WITNESS = 'expert_witness',
  COURT_STAFF = 'court_staff',
  GOVERNMENT_OFFICIAL = 'government_official',
  VENDOR = 'vendor',
  PARTNER = 'partner',
  OPPOSING_COUNSEL = 'opposing_counsel',
  MEDIATOR = 'mediator',
  ARBITRATOR = 'arbitrator',
  OTHER = 'other',
}

export enum ContactStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
  ARCHIVED = 'archived',
}

export interface IContact {
  _id?: string;
  
  // Contact identification
  contactNumber: string;
  type: ContactType;
  status: ContactStatus;
  
  // Personal information
  firstName: string;
  firstNameAr?: string;
  lastName: string;
  lastNameAr?: string;
  middleName?: string;
  middleNameAr?: string;
  fullName: string;
  fullNameAr?: string;
  
  // Professional information
  title?: string;
  titleAr?: string;
  organization?: string;
  organizationAr?: string;
  department?: string;
  departmentAr?: string;
  position?: string;
  positionAr?: string;
  
  // Contact information
  emails: {
    email: string;
    type: 'primary' | 'work' | 'personal' | 'other';
    isVerified: boolean;
  }[];
  phones: {
    number: string;
    type: 'mobile' | 'work' | 'home' | 'fax' | 'other';
    countryCode: string;
    isPrimary: boolean;
  }[];
  
  // Address information
  addresses: {
    type: 'home' | 'work' | 'mailing' | 'other';
    street: string;
    streetAr?: string;
    city: string;
    cityAr?: string;
    state: string;
    stateAr?: string;
    postalCode: string;
    country: string;
    countryAr?: string;
    isPrimary: boolean;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  }[];
  
  // Identification documents
  identificationDocuments: {
    type: 'national_id' | 'passport' | 'license' | 'commercial_register' | 'other';
    number: string;
    issuingAuthority: string;
    issuingAuthorityAr?: string;
    issueDate?: Date;
    expiryDate?: Date;
    documentUrl?: string;
  }[];
  
  // Social media and web presence
  socialMedia: {
    platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'website' | 'other';
    url: string;
    handle?: string;
  }[];
  
  // Professional details
  practiceAreas?: string[];
  practiceAreasAr?: string[];
  specializations?: string[];
  specializationsAr?: string[];
  languages: string[];
  barNumber?: string;
  licenseNumber?: string;
  
  // Relationship and interaction
  relationshipType?: string;
  relationshipTypeAr?: string;
  importanceLevel: 'low' | 'medium' | 'high' | 'critical';
  trustLevel: 'unknown' | 'low' | 'medium' | 'high' | 'verified';
  
  // Communication preferences
  preferredContactMethod: 'email' | 'phone' | 'sms' | 'whatsapp' | 'in_person';
  preferredLanguage: 'ar' | 'en' | 'both';
  timeZone?: string;
  availabilityNotes?: string;
  availabilityNotesAr?: string;
  
  // Related entities
  relatedCases: mongoose.Types.ObjectId[];
  relatedClients: mongoose.Types.ObjectId[];
  
  // Communication history
  lastContactDate?: Date;
  lastContactMethod?: string;
  lastContactNotes?: string;
  lastContactNotesAr?: string;
  totalInteractions: number;
  
  // Emergency contact
  emergencyContact?: {
    name: string;
    nameAr?: string;
    relationship: string;
    relationshipAr?: string;
    phone: string;
    email?: string;
  };
  
  // Financial information
  billingInformation?: {
    paymentTerms?: string;
    creditLimit?: number;
    currency: string;
    taxId?: string;
    billingAddress?: string;
    billingAddressAr?: string;
  };
  
  // Tags and categorization
  tags: string[];
  categories: string[];
  
  // Privacy and consent
  privacySettings: {
    canContact: boolean;
    canEmail: boolean;
    canSMS: boolean;
    canCall: boolean;
    dataProcessingConsent: boolean;
    marketingConsent: boolean;
    consentDate?: Date;
  };
  
  // Additional information
  notes?: string;
  notesAr?: string;
  internalNotes?: string;
  
  // Birthday and important dates
  birthDate?: Date;
  anniversaryDate?: Date;
  importantDates: {
    name: string;
    nameAr?: string;
    date: Date;
    type: 'birthday' | 'anniversary' | 'appointment' | 'reminder' | 'other';
  }[];
  
  // Law firm context
  lawFirmId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId; // Primary contact person
  
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

export interface ContactDocument extends IContact, Document {}

const contactSchema = new Schema<ContactDocument>({
  // Contact identification
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  type: {
    type: String,
    enum: Object.values(ContactType),
    required: [true, 'Contact type is required'],
  },
  status: {
    type: String,
    enum: Object.values(ContactStatus),
    default: ContactStatus.ACTIVE,
  },
  
  // Personal information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
  },
  firstNameAr: {
    type: String,
    trim: true,
    maxlength: [50, 'Arabic first name cannot exceed 50 characters'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },
  lastNameAr: {
    type: String,
    trim: true,
    maxlength: [50, 'Arabic last name cannot exceed 50 characters'],
  },
  middleName: {
    type: String,
    trim: true,
    maxlength: [50, 'Middle name cannot exceed 50 characters'],
  },
  middleNameAr: {
    type: String,
    trim: true,
    maxlength: [50, 'Arabic middle name cannot exceed 50 characters'],
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [150, 'Full name cannot exceed 150 characters'],
  },
  fullNameAr: {
    type: String,
    trim: true,
    maxlength: [150, 'Arabic full name cannot exceed 150 characters'],
  },
  
  // Professional information
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  titleAr: {
    type: String,
    trim: true,
    maxlength: [100, 'Arabic title cannot exceed 100 characters'],
  },
  organization: {
    type: String,
    trim: true,
    maxlength: [200, 'Organization cannot exceed 200 characters'],
  },
  organizationAr: {
    type: String,
    trim: true,
    maxlength: [200, 'Arabic organization cannot exceed 200 characters'],
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters'],
  },
  departmentAr: {
    type: String,
    trim: true,
    maxlength: [100, 'Arabic department cannot exceed 100 characters'],
  },
  position: {
    type: String,
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters'],
  },
  positionAr: {
    type: String,
    trim: true,
    maxlength: [100, 'Arabic position cannot exceed 100 characters'],
  },
  
  // Contact information
  emails: [{
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: ['primary', 'work', 'personal', 'other'],
      default: 'primary',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  }],
  phones: [{
    number: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['mobile', 'work', 'home', 'fax', 'other'],
      default: 'mobile',
    },
    countryCode: {
      type: String,
      default: '+966',
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  }],
  
  // Address information
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'mailing', 'other'],
      default: 'work',
    },
    street: {
      type: String,
      required: true,
      trim: true,
    },
    streetAr: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    cityAr: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    stateAr: {
      type: String,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'Saudi Arabia',
    },
    countryAr: {
      type: String,
      trim: true,
      default: 'المملكة العربية السعودية',
    },
    isPrimary: {
      type: Boolean,
      default: false,
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
  }],
  
  // Identification documents
  identificationDocuments: [{
    type: {
      type: String,
      enum: ['national_id', 'passport', 'license', 'commercial_register', 'other'],
      required: true,
    },
    number: {
      type: String,
      required: true,
      trim: true,
    },
    issuingAuthority: {
      type: String,
      required: true,
      trim: true,
    },
    issuingAuthorityAr: {
      type: String,
      trim: true,
    },
    issueDate: Date,
    expiryDate: Date,
    documentUrl: {
      type: String,
      trim: true,
    },
  }],
  
  // Social media and web presence
  socialMedia: [{
    platform: {
      type: String,
      enum: ['linkedin', 'twitter', 'facebook', 'instagram', 'website', 'other'],
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    handle: {
      type: String,
      trim: true,
    },
  }],
  
  // Professional details
  practiceAreas: [{
    type: String,
    trim: true,
  }],
  practiceAreasAr: [{
    type: String,
    trim: true,
  }],
  specializations: [{
    type: String,
    trim: true,
  }],
  specializationsAr: [{
    type: String,
    trim: true,
  }],
  languages: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  barNumber: {
    type: String,
    trim: true,
  },
  licenseNumber: {
    type: String,
    trim: true,
  },
  
  // Relationship and interaction
  relationshipType: {
    type: String,
    trim: true,
  },
  relationshipTypeAr: {
    type: String,
    trim: true,
  },
  importanceLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  trustLevel: {
    type: String,
    enum: ['unknown', 'low', 'medium', 'high', 'verified'],
    default: 'unknown',
  },
  
  // Communication preferences
  preferredContactMethod: {
    type: String,
    enum: ['email', 'phone', 'sms', 'whatsapp', 'in_person'],
    default: 'email',
  },
  preferredLanguage: {
    type: String,
    enum: ['ar', 'en', 'both'],
    default: 'ar',
  },
  timeZone: {
    type: String,
    default: 'Asia/Riyadh',
  },
  availabilityNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Availability notes cannot exceed 500 characters'],
  },
  availabilityNotesAr: {
    type: String,
    trim: true,
    maxlength: [500, 'Arabic availability notes cannot exceed 500 characters'],
  },
  
  // Related entities
  relatedCases: [{
    type: Schema.Types.ObjectId,
    ref: 'Case',
  }],
  relatedClients: [{
    type: Schema.Types.ObjectId,
    ref: 'Client',
  }],
  
  // Communication history
  lastContactDate: Date,
  lastContactMethod: {
    type: String,
    trim: true,
  },
  lastContactNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Last contact notes cannot exceed 1000 characters'],
  },
  lastContactNotesAr: {
    type: String,
    trim: true,
    maxlength: [1000, 'Arabic last contact notes cannot exceed 1000 characters'],
  },
  totalInteractions: {
    type: Number,
    default: 0,
    min: [0, 'Total interactions cannot be negative'],
  },
  
  // Emergency contact
  emergencyContact: {
    name: {
      type: String,
      trim: true,
    },
    nameAr: {
      type: String,
      trim: true,
    },
    relationship: {
      type: String,
      trim: true,
    },
    relationshipAr: {
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
  
  // Financial information
  billingInformation: {
    paymentTerms: {
      type: String,
      trim: true,
    },
    creditLimit: {
      type: Number,
      min: [0, 'Credit limit cannot be negative'],
    },
    currency: {
      type: String,
      default: 'SAR',
      uppercase: true,
    },
    taxId: {
      type: String,
      trim: true,
    },
    billingAddress: {
      type: String,
      trim: true,
    },
    billingAddressAr: {
      type: String,
      trim: true,
    },
  },
  
  // Tags and categorization
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  categories: [{
    type: String,
    trim: true,
  }],
  
  // Privacy and consent
  privacySettings: {
    canContact: {
      type: Boolean,
      default: true,
    },
    canEmail: {
      type: Boolean,
      default: true,
    },
    canSMS: {
      type: Boolean,
      default: true,
    },
    canCall: {
      type: Boolean,
      default: true,
    },
    dataProcessingConsent: {
      type: Boolean,
      default: false,
    },
    marketingConsent: {
      type: Boolean,
      default: false,
    },
    consentDate: Date,
  },
  
  // Additional information
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
  
  // Birthday and important dates
  birthDate: Date,
  anniversaryDate: Date,
  importantDates: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nameAr: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['birthday', 'anniversary', 'appointment', 'reminder', 'other'],
      required: true,
    },
  }],
  
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
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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
contactSchema.index({ lawFirmId: 1 });
contactSchema.index({ contactNumber: 1 }, { unique: true });
contactSchema.index({ type: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ fullName: 1 });
contactSchema.index({ 'emails.email': 1 });
contactSchema.index({ 'phones.number': 1 });

// Compound indexes
contactSchema.index({ lawFirmId: 1, status: 1 });
contactSchema.index({ lawFirmId: 1, type: 1 });
contactSchema.index({ fullName: 'text', fullNameAr: 'text', organization: 'text', organizationAr: 'text' });

// Pre-save middleware to generate full name
contactSchema.pre('save', function(next) {
  // Generate full name from parts
  if (this.firstName && this.lastName) {
    const nameParts = [this.firstName];
    if (this.middleName) nameParts.push(this.middleName);
    nameParts.push(this.lastName);
    this.fullName = nameParts.join(' ');
  }
  
  if (this.firstNameAr && this.lastNameAr) {
    const namePartsAr = [this.firstNameAr];
    if (this.middleNameAr) namePartsAr.push(this.middleNameAr);
    namePartsAr.push(this.lastNameAr);
    this.fullNameAr = namePartsAr.join(' ');
  }
  
  next();
});

// Static method to generate contact number
contactSchema.statics.generateContactNumber = async function(lawFirmId: mongoose.Types.ObjectId) {
  const year = new Date().getFullYear();
  const prefix = `CON-${year}-`;
  
  // Find the last contact for this year
  const lastContact = await this.findOne({
    lawFirmId,
    contactNumber: { $regex: `^${prefix}` }
  }).sort({ contactNumber: -1 });
  
  let sequence = 1;
  if (lastContact) {
    const lastSequence = parseInt(lastContact.contactNumber.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(6, '0')}`;
};

export const Contact = mongoose.model<ContactDocument>('Contact', contactSchema);
