import mongoose, { Schema, Document } from 'mongoose';

export enum AppointmentType {
  CONSULTATION = 'consultation',
  MEETING = 'meeting',
  COURT_HEARING = 'court_hearing',
  CLIENT_MEETING = 'client_meeting',
  INTERNAL_MEETING = 'internal_meeting',
  PHONE_CALL = 'phone_call',
  VIDEO_CALL = 'video_call',
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
  NO_SHOW = 'no_show',
}

export enum AppointmentPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface IAppointment {
  _id?: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  priority: AppointmentPriority;
  
  // Date and Time
  startDateTime: Date;
  endDateTime: Date;
  duration: number; // in minutes
  timezone: string;
  
  // Participants
  organizer: mongoose.Types.ObjectId; // User who created
  assignedLawyerId: mongoose.Types.ObjectId;
  clientId?: mongoose.Types.ObjectId;
  attendees: mongoose.Types.ObjectId[]; // Additional users
  
  // Location
  location?: {
    type: 'office' | 'court' | 'client_location' | 'online' | 'phone' | 'other';
    address?: string;
    room?: string;
    meetingLink?: string;
    phone?: string;
    notes?: string;
  };
  
  // Related Data
  caseId?: mongoose.Types.ObjectId;
  lawFirmId: mongoose.Types.ObjectId;
  
  // Reminders
  reminders: {
    type: 'email' | 'sms' | 'notification';
    minutesBefore: number;
    sent: boolean;
    sentAt?: Date;
  }[];
  
  // Recurrence
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number; // every X frequency
    endDate?: Date;
    occurrences?: number;
    parentAppointmentId?: mongoose.Types.ObjectId;
  };
  
  // Additional Info
  notes?: string;
  attachments?: string[];
  isPrivate: boolean;
  allowClientReschedule: boolean;
  
  // Tracking
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  cancelledBy?: mongoose.Types.ObjectId;
  cancelledAt?: Date;
  cancellationReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentDocument extends IAppointment, Document {}

const appointmentSchema = new Schema<AppointmentDocument>({
  title: {
    type: String,
    required: [true, 'Appointment title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters'],
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
  appointmentType: {
    type: String,
    enum: Object.values(AppointmentType),
    required: [true, 'Appointment type is required'],
  },
  status: {
    type: String,
    enum: Object.values(AppointmentStatus),
    default: AppointmentStatus.SCHEDULED,
    required: true,
  },
  priority: {
    type: String,
    enum: Object.values(AppointmentPriority),
    default: AppointmentPriority.MEDIUM,
    required: true,
  },
  
  // Date and Time
  startDateTime: {
    type: Date,
    required: [true, 'Start date and time is required'],
  },
  endDateTime: {
    type: Date,
    required: [true, 'End date and time is required'],
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [15, 'Minimum duration is 15 minutes'],
    max: [480, 'Maximum duration is 8 hours'],
  },
  timezone: {
    type: String,
    default: 'Asia/Riyadh',
    required: true,
  },
  
  // Participants
  organizer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer is required'],
  },
  assignedLawyerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned lawyer is required'],
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
  },
  attendees: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  // Location
  location: {
    type: {
      type: String,
      enum: ['office', 'court', 'client_location', 'online', 'phone', 'other'],
      default: 'office',
    },
    address: String,
    room: String,
    meetingLink: String,
    phone: String,
    notes: String,
  },
  
  // Related Data
  caseId: {
    type: Schema.Types.ObjectId,
    ref: 'Case',
  },
  lawFirmId: {
    type: Schema.Types.ObjectId,
    ref: 'LawFirm',
    required: [true, 'Law firm is required'],
  },
  
  // Reminders
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'notification'],
      required: true,
    },
    minutesBefore: {
      type: Number,
      required: true,
      min: [0, 'Minutes before cannot be negative'],
    },
    sent: {
      type: Boolean,
      default: false,
    },
    sentAt: Date,
  }],
  
  // Recurrence
  recurring: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    interval: {
      type: Number,
      min: [1, 'Interval must be at least 1'],
      max: [12, 'Interval cannot exceed 12'],
    },
    endDate: Date,
    occurrences: {
      type: Number,
      min: [1, 'Occurrences must be at least 1'],
      max: [365, 'Occurrences cannot exceed 365'],
    },
    parentAppointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
    },
  },
  
  // Additional Info
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters'],
  },
  attachments: [String],
  isPrivate: {
    type: Boolean,
    default: false,
  },
  allowClientReschedule: {
    type: Boolean,
    default: true,
  },
  
  // Tracking
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required'],
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  cancelledBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  cancelledAt: Date,
  cancellationReason: String,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
appointmentSchema.index({ lawFirmId: 1 });
appointmentSchema.index({ assignedLawyerId: 1 });
appointmentSchema.index({ clientId: 1 });
appointmentSchema.index({ startDateTime: 1 });
appointmentSchema.index({ endDateTime: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentType: 1 });
appointmentSchema.index({ caseId: 1 });

// Compound indexes
appointmentSchema.index({ lawFirmId: 1, startDateTime: 1 });
appointmentSchema.index({ assignedLawyerId: 1, startDateTime: 1 });
appointmentSchema.index({ lawFirmId: 1, status: 1, startDateTime: 1 });

// Validation
appointmentSchema.pre('save', function(next) {
  // Ensure end time is after start time
  if (this.endDateTime <= this.startDateTime) {
    next(new Error('End date/time must be after start date/time'));
    return;
  }
  
  // Calculate duration if not provided
  if (!this.duration) {
    this.duration = Math.round((this.endDateTime.getTime() - this.startDateTime.getTime()) / (1000 * 60));
  }
  
  next();
});

// Virtual for duration in hours
appointmentSchema.virtual('durationHours').get(function() {
  return Math.round((this.duration / 60) * 100) / 100;
});

// Virtual for is past appointment
appointmentSchema.virtual('isPast').get(function() {
  return this.endDateTime < new Date();
});

// Virtual for is today
appointmentSchema.virtual('isToday').get(function() {
  const today = new Date();
  const appointmentDate = new Date(this.startDateTime);
  return appointmentDate.toDateString() === today.toDateString();
});

export const Appointment = mongoose.model<AppointmentDocument>('Appointment', appointmentSchema);

