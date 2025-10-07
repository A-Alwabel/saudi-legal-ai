import mongoose, { Document, Schema } from 'mongoose';
import { LawFirm as ILawFirm, SubscriptionPlan } from '@shared/types';

export interface LawFirmDocument extends ILawFirm, Document {}

const lawFirmSchema = new Schema<LawFirmDocument>({
  name: {
    type: String,
    required: [true, 'Law firm name is required'],
    trim: true,
    maxlength: [100, 'Law firm name cannot exceed 100 characters'],
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  subscriptionPlan: {
    type: String,
    enum: Object.values(SubscriptionPlan),
    default: SubscriptionPlan.BASIC,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
lawFirmSchema.index({ email: 1 });
lawFirmSchema.index({ licenseNumber: 1 });
lawFirmSchema.index({ isActive: 1 });

// Virtual for user count
lawFirmSchema.virtual('userCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'lawFirmId',
  count: true,
});

// Ensure virtual fields are serialized
lawFirmSchema.set('toJSON', { virtuals: true });
lawFirmSchema.set('toObject', { virtuals: true });

export default mongoose.model<LawFirmDocument>('LawFirm', lawFirmSchema);
