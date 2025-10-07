import mongoose, { Schema, Document } from 'mongoose';
import { Document as IDocument, DocumentType, DocumentStatus } from '@shared/types';

export interface DocumentDocument extends IDocument, Document {}

const documentSchema = new Schema<DocumentDocument>({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true,
    minlength: [3, 'Document title must be at least 3 characters'],
    maxlength: [200, 'Document title cannot exceed 200 characters'],
  },
  titleAr: {
    type: String,
    trim: true,
    maxlength: [200, 'Arabic title cannot exceed 200 characters'],
  },
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
  documentType: {
    type: String,
    enum: Object.values(DocumentType),
    required: [true, 'Document type is required'],
  },
  status: {
    type: String,
    enum: Object.values(DocumentStatus),
    default: DocumentStatus.DRAFT,
    required: true,
  },
  filePath: {
    type: String,
    required: [true, 'File path is required'],
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative'],
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required'],
  },
  checksum: {
    type: String,
    required: [true, 'File checksum is required'],
  },
  caseId: {
    type: Schema.Types.ObjectId,
    ref: 'Case',
    required: [true, 'Case ID is required'],
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client ID is required'],
  },
  lawFirmId: {
    type: Schema.Types.ObjectId,
    ref: 'LawFirm',
    required: [true, 'Law firm ID is required'],
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploaded by user ID is required'],
  },
  version: {
    type: Number,
    default: 1,
    min: [1, 'Version must be at least 1'],
  },
  parentDocumentId: {
    type: Schema.Types.ObjectId,
    ref: 'Document',
  },
  isTemplate: {
    type: Boolean,
    default: false,
  },
  templateCategory: {
    type: String,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  metadata: {
    author: { type: String, trim: true },
    subject: { type: String, trim: true },
    keywords: [{ type: String, trim: true }],
    pageCount: { type: Number, min: 0 },
    wordCount: { type: Number, min: 0 },
    language: {
      type: String,
      enum: ['en', 'ar', 'mixed'],
      default: 'en',
    },
  },
  accessControl: {
    isPublic: {
      type: Boolean,
      default: false,
    },
    allowedUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    allowedRoles: [{
      type: String,
      enum: ['admin', 'lawyer', 'paralegal', 'client'],
    }],
  },
  reviewHistory: [{
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['approved', 'rejected', 'pending_revision'],
      required: true,
    },
    comments: {
      type: String,
      trim: true,
    },
  }],
  expiryDate: {
    type: Date,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  archivedAt: {
    type: Date,
  },
  archivedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
documentSchema.index({ caseId: 1 });
documentSchema.index({ clientId: 1 });
documentSchema.index({ lawFirmId: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ documentType: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ isTemplate: 1 });
documentSchema.index({ isArchived: 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ createdAt: -1 });

// Compound indexes
documentSchema.index({ caseId: 1, status: 1 });
documentSchema.index({ lawFirmId: 1, documentType: 1 });

// Virtual for display title based on language
documentSchema.virtual('displayTitle').get(function() {
  return this.titleAr || this.title;
});

// Virtual for display description based on language
documentSchema.virtual('displayDescription').get(function() {
  return this.descriptionAr || this.description;
});

// Virtual for file extension
documentSchema.virtual('fileExtension').get(function() {
  return this.fileName.split('.').pop()?.toLowerCase();
});

// Virtual for human readable file size
documentSchema.virtual('humanFileSize').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Pre-save middleware
documentSchema.pre('save', function(next) {
  // Auto-archive if status is set to archived
  if (this.isArchived && !this.archivedAt) {
    this.archivedAt = new Date();
  }
  
  // Clear archive info if document is unarchived
  if (!this.isArchived) {
    this.archivedAt = undefined;
    this.archivedBy = undefined;
  }
  
  next();
});

// Static method to find documents by case
documentSchema.statics.findByCase = function(caseId: string) {
  return this.find({ caseId, isArchived: false }).sort({ createdAt: -1 });
};

// Static method to find templates
documentSchema.statics.findTemplates = function(category?: string) {
  const query: any = { isTemplate: true, isArchived: false };
  if (category) {
    query.templateCategory = category;
  }
  return this.find(query).sort({ title: 1 });
};

export const Document = mongoose.model<DocumentDocument>('Document', documentSchema);
