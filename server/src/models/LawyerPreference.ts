import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILawyerPreference {
  _id?: string;
  userId: Types.ObjectId;
  lawFirmId: Types.ObjectId;
  
  // AI Response Preferences
  preferredLanguage: 'en' | 'ar' | 'both';
  responseStyle: 'formal' | 'conversational' | 'technical' | 'simplified';
  detailLevel: 'brief' | 'standard' | 'comprehensive';
  includeArabicTerms: boolean;
  includeCitations: boolean;
  includeExamples: boolean;
  
  // Legal Practice Preferences
  specializations: string[]; // e.g., ['commercial', 'family', 'criminal']
  preferredSources: string[]; // e.g., ['Saudi Commercial Law', 'Sharia Principles']
  practiceAreas: string[]; // e.g., ['contracts', 'litigation', 'arbitration']
  
  // Communication Preferences
  urgencyHandling: 'conservative' | 'balanced' | 'aggressive';
  clientCommunicationStyle: 'formal' | 'friendly' | 'educational';
  riskTolerance: 'low' | 'medium' | 'high';
  
  // Workflow Preferences
  preferredCaseTypes: string[];
  workingHours: {
    start: string; // e.g., '09:00'
    end: string;   // e.g., '17:00'
    timezone: string; // e.g., 'Asia/Riyadh'
  };
  
  // Learning Preferences
  feedbackFrequency: 'always' | 'weekly' | 'monthly' | 'never';
  improvementAreas: string[]; // Areas where lawyer wants AI to improve
  successMetrics: string[]; // How lawyer measures success
  
  // Notification Preferences
  aiSuggestionNotifications: boolean;
  learningUpdates: boolean;
  personalizedTips: boolean;
  
  // Audit trail
  createdAt: Date;
  updatedAt: Date;
}

export interface LawyerPreferenceDocument extends ILawyerPreference, Document {}

const lawyerPreferenceSchema = new Schema<LawyerPreferenceDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true, // One preference record per user
  },
  lawFirmId: {
    type: Schema.Types.ObjectId,
    ref: 'LawFirm',
    required: [true, 'Law firm ID is required'],
  },
  
  // AI Response Preferences
  preferredLanguage: {
    type: String,
    enum: ['en', 'ar', 'both'],
    default: 'both',
  },
  responseStyle: {
    type: String,
    enum: ['formal', 'conversational', 'technical', 'simplified'],
    default: 'formal',
  },
  detailLevel: {
    type: String,
    enum: ['brief', 'standard', 'comprehensive'],
    default: 'standard',
  },
  includeArabicTerms: {
    type: Boolean,
    default: true,
  },
  includeCitations: {
    type: Boolean,
    default: true,
  },
  includeExamples: {
    type: Boolean,
    default: true,
  },
  
  // Legal Practice Preferences
  specializations: [{
    type: String,
    trim: true,
  }],
  preferredSources: [{
    type: String,
    trim: true,
  }],
  practiceAreas: [{
    type: String,
    trim: true,
  }],
  
  // Communication Preferences
  urgencyHandling: {
    type: String,
    enum: ['conservative', 'balanced', 'aggressive'],
    default: 'balanced',
  },
  clientCommunicationStyle: {
    type: String,
    enum: ['formal', 'friendly', 'educational'],
    default: 'formal',
  },
  riskTolerance: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  
  // Workflow Preferences
  preferredCaseTypes: [{
    type: String,
    trim: true,
  }],
  workingHours: {
    start: {
      type: String,
      default: '09:00',
    },
    end: {
      type: String,
      default: '17:00',
    },
    timezone: {
      type: String,
      default: 'Asia/Riyadh',
    },
  },
  
  // Learning Preferences
  feedbackFrequency: {
    type: String,
    enum: ['always', 'weekly', 'monthly', 'never'],
    default: 'weekly',
  },
  improvementAreas: [{
    type: String,
    trim: true,
  }],
  successMetrics: [{
    type: String,
    trim: true,
  }],
  
  // Notification Preferences
  aiSuggestionNotifications: {
    type: Boolean,
    default: true,
  },
  learningUpdates: {
    type: Boolean,
    default: true,
  },
  personalizedTips: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
lawyerPreferenceSchema.index({ userId: 1 }, { unique: true });
lawyerPreferenceSchema.index({ lawFirmId: 1 });
lawyerPreferenceSchema.index({ specializations: 1 });
lawyerPreferenceSchema.index({ practiceAreas: 1 });

export const LawyerPreference = mongoose.model<LawyerPreferenceDocument>('LawyerPreference', lawyerPreferenceSchema);
