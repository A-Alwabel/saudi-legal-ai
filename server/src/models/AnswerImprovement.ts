import mongoose, { Schema, Document, Types } from 'mongoose';
import { AnswerImprovement as IAnswerImprovement } from '@shared/types';

export interface AnswerImprovementDocument extends Document {
  feedbackId: Types.ObjectId;
  originalAnswer: string;
  improvedAnswer: string;
  verifiedBy?: Types.ObjectId;
  verificationDate?: Date;
  legalReferences?: string[];
  verificationLevel: string;
  questionPattern: string;
  isActive: boolean;
  effectiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const answerImprovementSchema = new Schema<AnswerImprovementDocument>({
  feedbackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LawyerFeedback',
    required: [true, 'Feedback ID is required'],
    index: true,
  },
  originalAnswer: {
    type: String,
    required: [true, 'Original answer is required'],
  },
  improvedAnswer: {
    type: String,
    required: [true, 'Improved answer is required'],
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  verificationDate: {
    type: Date,
  },
  legalReferences: [{
    type: String,
    required: true,
  }],
  verificationLevel: {
    type: String,
    enum: ['admin_corrected', 'lawyer_verified'],
    required: [true, 'Verification level is required'],
    index: true,
  },
  questionPattern: {
    type: String,
    required: [true, 'Question pattern is required'],
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  effectiveDate: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for performance
answerImprovementSchema.index({ feedbackId: 1 });
answerImprovementSchema.index({ questionPattern: 1, isActive: 1 });
answerImprovementSchema.index({ verificationLevel: 1, effectiveDate: -1 });
answerImprovementSchema.index({ verifiedBy: 1, verificationDate: -1 });

// Virtual populate for feedback details
answerImprovementSchema.virtual('feedback', {
  ref: 'LawyerFeedback',
  localField: 'feedbackId',
  foreignField: '_id',
  justOne: true,
});

// Virtual populate for verifier details
answerImprovementSchema.virtual('verifier', {
  ref: 'User',
  localField: 'verifiedBy',
  foreignField: '_id',
  justOne: true,
});

export const AnswerImprovement = mongoose.model<AnswerImprovementDocument>('AnswerImprovement', answerImprovementSchema);
