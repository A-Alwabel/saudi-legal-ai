import mongoose, { Schema, Document } from 'mongoose';

export enum SessionType {
  COURT_HEARING = 'court_hearing',
  CLIENT_MEETING = 'client_meeting',
  MEDIATION = 'mediation',
  ARBITRATION = 'arbitration',
  DEPOSITION = 'deposition',
  NEGOTIATION = 'negotiation',
  CONSULTATION = 'consultation',
  INTERNAL_MEETING = 'internal_meeting',
  TRAINING_SESSION = 'training_session',
  CONFERENCE_CALL = 'conference_call',
  VIDEO_CONFERENCE = 'video_conference',
  OTHER = 'other',
}

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed',
  NO_SHOW = 'no_show',
}

export interface ISession {
  _id?: string;
  
  // Session identification
  sessionNumber: string;
  title: string;
  titleAr?: string;
  type: SessionType;
  status: SessionStatus;
  
  // Timing
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  duration?: number; // in minutes
  
  // Location and venue
  location?: {
    type: 'physical' | 'virtual' | 'hybrid';
    venue?: string;
    venueAr?: string;
    address?: string;
    room?: string;
    floor?: string;
    virtualLink?: string;
    dialInNumber?: string;
    accessCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Related entities
  caseId?: mongoose.Types.ObjectId;
  clientId?: mongoose.Types.ObjectId;
  
  // Participants
  participants: {
    userId: mongoose.Types.ObjectId;
    role: 'lawyer' | 'client' | 'witness' | 'expert' | 'judge' | 'mediator' | 'arbitrator' | 'other';
    isRequired: boolean;
    attendanceStatus: 'invited' | 'accepted' | 'declined' | 'tentative' | 'attended' | 'absent';
    joinedAt?: Date;
    leftAt?: Date;
    notes?: string;
  }[];
  
  // External participants (non-users)
  externalParticipants: {
    name: string;
    nameAr?: string;
    role: string;
    organization?: string;
    organizationAr?: string;
    email?: string;
    phone?: string;
    isRequired: boolean;
    attendanceStatus: 'invited' | 'confirmed' | 'declined' | 'attended' | 'absent';
    notes?: string;
  }[];
  
  // Session details
  description?: string;
  descriptionAr?: string;
  agenda?: string;
  agendaAr?: string;
  objectives: string[];
  objectivesAr: string[];
  
  // Preparation and materials
  preparationNotes?: string;
  preparationNotesAr?: string;
  requiredDocuments: {
    documentId?: mongoose.Types.ObjectId;
    title: string;
    isRequired: boolean;
    uploadedBy?: mongoose.Types.ObjectId;
    uploadedAt?: Date;
  }[];
  
  // Session outcomes
  outcomes?: {
    summary: string;
    summaryAr?: string;
    decisions: string[];
    decisionsAr: string[];
    actionItems: {
      description: string;
      descriptionAr?: string;
      assignedTo?: mongoose.Types.ObjectId;
      dueDate?: Date;
      status: 'pending' | 'in_progress' | 'completed';
    }[];
    nextSteps: string[];
    nextStepsAr: string[];
    followUpRequired: boolean;
    followUpDate?: Date;
  };
  
  // Recording and documentation
  recording?: {
    isRecorded: boolean;
    recordingUrl?: string;
    recordingDuration?: number;
    transcriptUrl?: string;
    recordingConsent: boolean;
    consentGivenBy: mongoose.Types.ObjectId[];
  };
  
  // Minutes and notes
  minutes?: {
    content: string;
    contentAr?: string;
    takenBy: mongoose.Types.ObjectId;
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    isOfficial: boolean;
  };
  
  // Financial information
  billing?: {
    isBillable: boolean;
    hourlyRate?: number;
    totalAmount?: number;
    currency: string;
    invoiceId?: mongoose.Types.ObjectId;
    billingNotes?: string;
  };
  
  // Reminders and notifications
  reminders: {
    type: 'email' | 'sms' | 'push' | 'in_app';
    sendTo: 'all' | 'participants' | 'specific';
    specificUsers?: mongoose.Types.ObjectId[];
    minutesBefore: number;
    sent: boolean;
    sentAt?: Date;
  }[];
  
  // Recurrence (for recurring sessions)
  recurrence?: {
    isRecurring: boolean;
    pattern: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval: number;
    daysOfWeek?: number[];
    endDate?: Date;
    maxOccurrences?: number;
    parentSessionId?: mongoose.Types.ObjectId;
  };
  
  // Cancellation/Postponement details
  cancellation?: {
    reason: string;
    reasonAr?: string;
    cancelledBy: mongoose.Types.ObjectId;
    cancelledAt: Date;
    refundAmount?: number;
    notificationSent: boolean;
  };
  
  postponement?: {
    reason: string;
    reasonAr?: string;
    postponedBy: mongoose.Types.ObjectId;
    postponedAt: Date;
    newScheduledStartTime?: Date;
    newScheduledEndTime?: Date;
    notificationSent: boolean;
  };
  
  // Integration data
  integrationData?: {
    calendarEventId?: string;
    zoomMeetingId?: string;
    teamsEventId?: string;
    googleMeetLink?: string;
    syncEnabled: boolean;
    lastSynced?: Date;
  };
  
  // Attachments and files
  attachments: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
    isPublic: boolean;
  }[];
  
  // Tags and categorization
  tags: string[];
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Confidentiality
  confidentialityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  accessControlList: mongoose.Types.ObjectId[];
  
  // Law firm context
  lawFirmId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  departmentId?: string;
  
  // Additional metadata
  notes?: string;
  notesAr?: string;
  internalNotes?: string;
  
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

export interface SessionDocument extends ISession, Document {}

const sessionSchema = new Schema<SessionDocument>({
  // Session identification
  sessionNumber: {
    type: String,
    required: [true, 'Session number is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  titleAr: {
    type: String,
    trim: true,
    maxlength: [200, 'Arabic title cannot exceed 200 characters'],
  },
  type: {
    type: String,
    enum: Object.values(SessionType),
    required: [true, 'Session type is required'],
  },
  status: {
    type: String,
    enum: Object.values(SessionStatus),
    default: SessionStatus.SCHEDULED,
  },
  
  // Timing
  scheduledStartTime: {
    type: Date,
    required: [true, 'Scheduled start time is required'],
  },
  scheduledEndTime: {
    type: Date,
    required: [true, 'Scheduled end time is required'],
  },
  actualStartTime: Date,
  actualEndTime: Date,
  duration: {
    type: Number,
    min: [0, 'Duration cannot be negative'],
  },
  
  // Location and venue
  location: {
    type: {
      type: String,
      enum: ['physical', 'virtual', 'hybrid'],
      default: 'physical',
    },
    venue: {
      type: String,
      trim: true,
    },
    venueAr: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    room: {
      type: String,
      trim: true,
    },
    floor: {
      type: String,
      trim: true,
    },
    virtualLink: {
      type: String,
      trim: true,
    },
    dialInNumber: {
      type: String,
      trim: true,
    },
    accessCode: {
      type: String,
      trim: true,
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
  
  // Related entities
  caseId: {
    type: Schema.Types.ObjectId,
    ref: 'Case',
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
  },
  
  // Participants
  participants: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['lawyer', 'client', 'witness', 'expert', 'judge', 'mediator', 'arbitrator', 'other'],
      required: true,
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    attendanceStatus: {
      type: String,
      enum: ['invited', 'accepted', 'declined', 'tentative', 'attended', 'absent'],
      default: 'invited',
    },
    joinedAt: Date,
    leftAt: Date,
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Participant notes cannot exceed 500 characters'],
    },
  }],
  
  // External participants
  externalParticipants: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nameAr: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    organization: {
      type: String,
      trim: true,
    },
    organizationAr: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    attendanceStatus: {
      type: String,
      enum: ['invited', 'confirmed', 'declined', 'attended', 'absent'],
      default: 'invited',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'External participant notes cannot exceed 500 characters'],
    },
  }],
  
  // Session details
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  descriptionAr: {
    type: String,
    trim: true,
    maxlength: [2000, 'Arabic description cannot exceed 2000 characters'],
  },
  agenda: {
    type: String,
    trim: true,
    maxlength: [5000, 'Agenda cannot exceed 5000 characters'],
  },
  agendaAr: {
    type: String,
    trim: true,
    maxlength: [5000, 'Arabic agenda cannot exceed 5000 characters'],
  },
  objectives: [{
    type: String,
    trim: true,
    maxlength: [500, 'Objective cannot exceed 500 characters'],
  }],
  objectivesAr: [{
    type: String,
    trim: true,
    maxlength: [500, 'Arabic objective cannot exceed 500 characters'],
  }],
  
  // Preparation and materials
  preparationNotes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Preparation notes cannot exceed 2000 characters'],
  },
  preparationNotesAr: {
    type: String,
    trim: true,
    maxlength: [2000, 'Arabic preparation notes cannot exceed 2000 characters'],
  },
  requiredDocuments: [{
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Session outcomes
  outcomes: {
    summary: {
      type: String,
      trim: true,
      maxlength: [5000, 'Summary cannot exceed 5000 characters'],
    },
    summaryAr: {
      type: String,
      trim: true,
      maxlength: [5000, 'Arabic summary cannot exceed 5000 characters'],
    },
    decisions: [{
      type: String,
      trim: true,
      maxlength: [1000, 'Decision cannot exceed 1000 characters'],
    }],
    decisionsAr: [{
      type: String,
      trim: true,
      maxlength: [1000, 'Arabic decision cannot exceed 1000 characters'],
    }],
    actionItems: [{
      description: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Action item description cannot exceed 500 characters'],
      },
      descriptionAr: {
        type: String,
        trim: true,
        maxlength: [500, 'Arabic action item description cannot exceed 500 characters'],
      },
      assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      dueDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending',
      },
    }],
    nextSteps: [{
      type: String,
      trim: true,
      maxlength: [500, 'Next step cannot exceed 500 characters'],
    }],
    nextStepsAr: [{
      type: String,
      trim: true,
      maxlength: [500, 'Arabic next step cannot exceed 500 characters'],
    }],
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: Date,
  },
  
  // Recording and documentation
  recording: {
    isRecorded: {
      type: Boolean,
      default: false,
    },
    recordingUrl: {
      type: String,
      trim: true,
    },
    recordingDuration: {
      type: Number,
      min: [0, 'Recording duration cannot be negative'],
    },
    transcriptUrl: {
      type: String,
      trim: true,
    },
    recordingConsent: {
      type: Boolean,
      default: false,
    },
    consentGivenBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  
  // Minutes and notes
  minutes: {
    content: {
      type: String,
      trim: true,
    },
    contentAr: {
      type: String,
      trim: true,
    },
    takenBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    isOfficial: {
      type: Boolean,
      default: false,
    },
  },
  
  // Financial information
  billing: {
    isBillable: {
      type: Boolean,
      default: false,
    },
    hourlyRate: {
      type: Number,
      min: [0, 'Hourly rate cannot be negative'],
    },
    totalAmount: {
      type: Number,
      min: [0, 'Total amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'SAR',
      uppercase: true,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    billingNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Billing notes cannot exceed 500 characters'],
    },
  },
  
  // Reminders and notifications
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'in_app'],
      required: true,
    },
    sendTo: {
      type: String,
      enum: ['all', 'participants', 'specific'],
      default: 'participants',
    },
    specificUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    minutesBefore: {
      type: Number,
      required: true,
      min: [1, 'Minutes before must be at least 1'],
    },
    sent: {
      type: Boolean,
      default: false,
    },
    sentAt: Date,
  }],
  
  // Recurrence
  recurrence: {
    isRecurring: {
      type: Boolean,
      default: false,
    },
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'custom'],
    },
    interval: {
      type: Number,
      min: [1, 'Recurrence interval must be at least 1'],
    },
    daysOfWeek: [{
      type: Number,
      min: [0, 'Day of week must be 0-6'],
      max: [6, 'Day of week must be 0-6'],
    }],
    endDate: Date,
    maxOccurrences: {
      type: Number,
      min: [1, 'Max occurrences must be at least 1'],
    },
    parentSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'Session',
    },
  },
  
  // Cancellation/Postponement details
  cancellation: {
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    reasonAr: {
      type: String,
      trim: true,
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cancelledAt: {
      type: Date,
      default: Date.now,
    },
    refundAmount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative'],
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  
  postponement: {
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    reasonAr: {
      type: String,
      trim: true,
    },
    postponedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postponedAt: {
      type: Date,
      default: Date.now,
    },
    newScheduledStartTime: Date,
    newScheduledEndTime: Date,
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  
  // Integration data
  integrationData: {
    calendarEventId: {
      type: String,
      trim: true,
    },
    zoomMeetingId: {
      type: String,
      trim: true,
    },
    teamsEventId: {
      type: String,
      trim: true,
    },
    googleMeetLink: {
      type: String,
      trim: true,
    },
    syncEnabled: {
      type: Boolean,
      default: false,
    },
    lastSynced: Date,
  },
  
  // Attachments and files
  attachments: [{
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: [0, 'File size cannot be negative'],
    },
    fileType: {
      type: String,
      required: true,
      trim: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  }],
  
  // Tags and categorization
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  category: {
    type: String,
    trim: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  
  // Confidentiality
  confidentialityLevel: {
    type: String,
    enum: ['public', 'internal', 'confidential', 'restricted'],
    default: 'internal',
  },
  accessControlList: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
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
  departmentId: {
    type: String,
    trim: true,
  },
  
  // Additional metadata
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
sessionSchema.index({ lawFirmId: 1 });
sessionSchema.index({ sessionNumber: 1 }, { unique: true });
sessionSchema.index({ type: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ scheduledStartTime: 1 });
sessionSchema.index({ caseId: 1 });
sessionSchema.index({ clientId: 1 });
sessionSchema.index({ 'participants.userId': 1 });

// Compound indexes
sessionSchema.index({ lawFirmId: 1, status: 1 });
sessionSchema.index({ lawFirmId: 1, scheduledStartTime: 1 });
sessionSchema.index({ caseId: 1, scheduledStartTime: 1 });

// Virtual for actual duration
sessionSchema.virtual('actualDuration').get(function() {
  if (this.actualStartTime && this.actualEndTime) {
    return Math.round((this.actualEndTime.getTime() - this.actualStartTime.getTime()) / (1000 * 60));
  }
  return null;
});

// Virtual for is in progress
sessionSchema.virtual('isInProgress').get(function() {
  return this.status === SessionStatus.IN_PROGRESS;
});

// Virtual for is upcoming
sessionSchema.virtual('isUpcoming').get(function() {
  return this.status === SessionStatus.SCHEDULED && this.scheduledStartTime > new Date();
});

// Virtual for is overdue
sessionSchema.virtual('isOverdue').get(function() {
  return this.status === SessionStatus.SCHEDULED && this.scheduledEndTime < new Date();
});

// Pre-save middleware
sessionSchema.pre('save', function(next) {
  // Calculate duration if actual times are provided
  if (this.actualStartTime && this.actualEndTime) {
    this.duration = Math.round((this.actualEndTime.getTime() - this.actualStartTime.getTime()) / (1000 * 60));
  }
  
  // Validate scheduled times
  if (this.scheduledEndTime <= this.scheduledStartTime) {
    next(new Error('Scheduled end time must be after start time'));
    return;
  }
  
  next();
});

// Static method to generate session number
sessionSchema.statics.generateSessionNumber = async function(lawFirmId: mongoose.Types.ObjectId, sessionType: SessionType) {
  const year = new Date().getFullYear();
  const typePrefix = sessionType.toUpperCase().substring(0, 3);
  const prefix = `SES-${typePrefix}-${year}-`;
  
  // Find the last session for this year and type
  const lastSession = await this.findOne({
    lawFirmId,
    type: sessionType,
    sessionNumber: { $regex: `^${prefix}` }
  }).sort({ sessionNumber: -1 });
  
  let sequence = 1;
  if (lastSession) {
    const lastSequence = parseInt(lastSession.sessionNumber.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(6, '0')}`;
};

export const Session = mongoose.model<SessionDocument>('Session', sessionSchema);
