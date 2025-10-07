import mongoose, { Schema, Document, Types } from 'mongoose';
import { LawyerFeedback as ILawyerFeedback, FeedbackType, FeedbackStatus, AdminDecision } from '@shared/types';

export interface LawyerFeedbackDocument extends Document {
  consultationId: string;
  userId: Types.ObjectId;
  lawFirmId: Types.ObjectId;
  rating: number;
  feedbackType: string;
  improvementSuggestion?: string;
  urgencyLevel?: string;
  originalQuery: string;
  originalAnswer: string;
  status: string;
  adminReviewed: boolean;
  adminDecision?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const lawyerFeedbackSchema = new Schema<LawyerFeedbackDocument>({
  consultationId: {
    type: String,
    required: [true, 'Consultation ID is required'],
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  lawFirmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LawFirm',
    required: [true, 'Law firm ID is required'],
    index: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  feedbackType: {
    type: String,
    enum: Object.values(FeedbackType),
    required: [true, 'Feedback type is required'],
  },
  improvementSuggestion: {
    type: String,
    maxlength: [2000, 'Improvement suggestion cannot exceed 2000 characters'],
  },
  urgencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  originalQuery: {
    type: String,
    required: [true, 'Original query is required'],
  },
  originalAnswer: {
    type: String,
    required: [true, 'Original answer is required'],
  },
  status: {
    type: String,
    enum: Object.values(FeedbackStatus),
    default: FeedbackStatus.PENDING,
    index: true,
  },
  adminReviewed: {
    type: Boolean,
    default: false,
    index: true,
  },
  adminDecision: {
    type: String,
    enum: Object.values(AdminDecision),
  },
  adminNotes: {
    type: String,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters'],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for performance
lawyerFeedbackSchema.index({ consultationId: 1 });
lawyerFeedbackSchema.index({ userId: 1, createdAt: -1 });
lawyerFeedbackSchema.index({ lawFirmId: 1, status: 1 });
lawyerFeedbackSchema.index({ adminReviewed: 1, urgencyLevel: 1 });
lawyerFeedbackSchema.index({ feedbackType: 1, rating: 1 });

// Virtual populate for user details
lawyerFeedbackSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Virtual populate for law firm details
lawyerFeedbackSchema.virtual('lawFirm', {
  ref: 'LawFirm',
  localField: 'lawFirmId',
  foreignField: '_id',
  justOne: true,
});

export const LawyerFeedback = mongoose.model<LawyerFeedbackDocument>('LawyerFeedback', lawyerFeedbackSchema);
