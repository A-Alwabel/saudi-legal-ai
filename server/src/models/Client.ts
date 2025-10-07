import mongoose, { Schema, Document, Types } from 'mongoose';
import { Client as IClient, ClientType, ClientStatus } from '@shared/types';

export interface ClientDocument extends Document {
  name: string;
  nameAr?: string;
  email: string;
  phone: string;
  nationalId?: string;
  commercialRegister?: string;
  clientType: ClientType;
  status: ClientStatus;
  address?: {
    street?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  };
  lawFirmId: Types.ObjectId;
  assignedLawyerId?: Types.ObjectId;
  company?: {
    name?: string;
    nameAr?: string;
    position?: string;
    industry?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  preferences?: {
    language?: string;
    notifications?: boolean;
    communicationMethod?: string;
  };
  notes?: Array<{
    content: string;
    addedBy: Types.ObjectId;
    addedAt: Date;
  }>;
  tags?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<ClientDocument>({
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    minlength: [2, 'Client name must be at least 2 characters'],
    maxlength: [100, 'Client name cannot exceed 100 characters'],
  },
  nameAr: {
    type: String,
    trim: true,
    maxlength: [100, 'Arabic name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^(\+966|0)?[0-9]{9}$/, 'Please provide a valid Saudi phone number'],
  },
  nationalId: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'National ID must be 10 digits'],
    unique: true,
    sparse: true,
  },
  commercialRegister: {
    type: String,
    trim: true,
    sparse: true,
  },
  clientType: {
    type: String,
    enum: Object.values(ClientType),
    required: [true, 'Client type is required'],
    default: ClientType.INDIVIDUAL,
  },
  status: {
    type: String,
    enum: Object.values(ClientStatus),
    default: ClientStatus.ACTIVE,
    required: true,
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    province: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, default: 'Saudi Arabia' },
  },
  lawFirmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LawFirm',
    required: [true, 'Law firm is required'],
  },
  assignedLawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  company: {
    name: { type: String, trim: true },
    nameAr: { type: String, trim: true },
    position: { type: String, trim: true },
    industry: { type: String, trim: true },
  },
  emergencyContact: {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    relationship: { type: String, trim: true },
  },
  notes: [{
    content: {
      type: String,
      required: true,
      trim: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  preferences: {
    language: {
      type: String,
      enum: ['en', 'ar'],
      default: 'en',
    },
    communicationMethod: {
      type: String,
      enum: ['email', 'phone', 'whatsapp', 'sms'],
      default: 'email',
    },
    timezone: {
      type: String,
      default: 'Asia/Riyadh',
    },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
clientSchema.index({ lawFirmId: 1 });
clientSchema.index({ assignedLawyerId: 1 });
clientSchema.index({ email: 1 });
clientSchema.index({ nationalId: 1 });
clientSchema.index({ clientType: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ 'company.name': 1 });

// Virtual for full name
clientSchema.virtual('fullName').get(function(this: ClientDocument) {
  return this.nameAr && this.preferences?.language === 'ar' ? this.nameAr : this.name;
});

// Virtual for case count
clientSchema.virtual('caseCount', {
  ref: 'Case',
  localField: '_id',
  foreignField: 'clientId',
  count: true,
});

// Pre-save middleware
clientSchema.pre<ClientDocument>('save', function(next) {
  // Ensure commercial register is only for companies
  if (this.clientType === ClientType.INDIVIDUAL && this.commercialRegister) {
    this.commercialRegister = undefined;
  }
  
  // Ensure national ID is only for individuals
  if (this.clientType === ClientType.COMPANY && this.nationalId) {
    this.nationalId = undefined;
  }
  
  next();
});

export const Client = mongoose.model<ClientDocument>('Client', clientSchema);
