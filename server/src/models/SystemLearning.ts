import mongoose, { Schema, Document, Types } from 'mongoose';
import { SystemLearning as ISystemLearning } from '@shared/types';

export interface SystemLearningDocument extends Document {
  questionPattern: string;
  improvementId: Types.ObjectId;
  similarity: number;
  usageCount: number;
  lastUsed?: Date;
  effectiveDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const systemLearningSchema = new Schema<SystemLearningDocument>({
  questionPattern: {
    type: String,
    required: [true, 'Question pattern is required'],
    index: true,
  },
  improvementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnswerImprovement',
    required: [true, 'Improvement ID is required'],
    index: true,
  },
  similarity: {
    type: Number,
    required: [true, 'Similarity score is required'],
    min: [0, 'Similarity cannot be negative'],
    max: [1, 'Similarity cannot exceed 1'],
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative'],
  },
  lastUsed: {
    type: Date,
    default: Date.now,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for performance
systemLearningSchema.index({ questionPattern: 1, isActive: 1 });
systemLearningSchema.index({ similarity: -1, usageCount: -1 });
systemLearningSchema.index({ improvementId: 1 });
systemLearningSchema.index({ lastUsed: -1, isActive: 1 });

// Compound index for learning queries
systemLearningSchema.index({ 
  questionPattern: 'text', 
  isActive: 1, 
  similarity: -1 
});

// Virtual populate for improvement details
systemLearningSchema.virtual('improvement', {
  ref: 'AnswerImprovement',
  localField: 'improvementId',
  foreignField: '_id',
  justOne: true,
});

// Method to increment usage
systemLearningSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

export const SystemLearning = mongoose.model<SystemLearningDocument>('SystemLearning', systemLearningSchema);
