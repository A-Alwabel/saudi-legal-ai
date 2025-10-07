import mongoose, { Schema, Document } from 'mongoose';

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  EXPORT = 'export',
  IMPORT = 'import',
  MANAGE = 'manage',
  VIEW_ALL = 'view_all',
  VIEW_OWN = 'view_own',
  ASSIGN = 'assign',
  UNASSIGN = 'unassign',
}

export enum ResourceType {
  // Core entities
  USERS = 'users',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',
  LAW_FIRMS = 'law_firms',
  BRANCHES = 'branches',
  
  // Client management
  CLIENTS = 'clients',
  CLIENT_PORTAL = 'client_portal',
  CLIENT_REPORTS = 'client_reports',
  CONTACTS = 'contacts',
  
  // Case management
  CASES = 'cases',
  DOCUMENTS = 'documents',
  SESSIONS = 'sessions',
  EXECUTION_REQUESTS = 'execution_requests',
  POWER_OF_ATTORNEY = 'power_of_attorney',
  
  // Task and project management
  TASKS = 'tasks',
  APPOINTMENTS = 'appointments',
  REMINDERS = 'reminders',
  WORK_UPDATES = 'work_updates',
  
  // Financial management
  INVOICES = 'invoices',
  QUOTATIONS = 'quotations',
  PAYMENTS = 'payments',
  EXPENSES = 'expenses',
  TREASURY = 'treasury',
  FINANCIAL_REPORTS = 'financial_reports',
  
  // Human resources
  EMPLOYEES = 'employees',
  LEAVE_MANAGEMENT = 'leave_management',
  PERFORMANCE = 'performance',
  
  // System and communication
  MESSAGING = 'messaging',
  NOTIFICATIONS = 'notifications',
  ARCHIVE = 'archive',
  LEGAL_LIBRARY = 'legal_library',
  
  // AI and analytics
  AI_CHAT = 'ai_chat',
  ANALYTICS = 'analytics',
  
  // System administration
  SYSTEM_SETTINGS = 'system_settings',
  AUDIT_LOGS = 'audit_logs',
  BACKUPS = 'backups',
}

export interface IPermission {
  resource: ResourceType;
  actions: PermissionAction[];
  conditions?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'not_contains';
    value: any;
  }[];
  description?: string;
  descriptionAr?: string;
}

export interface IRole {
  _id?: string;
  
  // Role identification
  roleName: string;
  roleNameAr?: string;
  roleCode: string; // Unique identifier for the role
  
  // Role hierarchy and type
  roleLevel: number; // 1 = highest (admin), 10 = lowest
  roleType: 'system' | 'custom'; // System roles cannot be deleted
  parentRole?: mongoose.Types.ObjectId; // Role hierarchy
  
  // Permissions
  permissions: IPermission[];
  inheritPermissions: boolean; // Inherit from parent role
  
  // Role description and purpose
  description?: string;
  descriptionAr?: string;
  purpose?: string;
  purposeAr?: string;
  
  // Status and availability
  isActive: boolean;
  isDefault: boolean; // Default role for new users
  
  // Usage and assignment
  maxUsers?: number; // Maximum users that can have this role
  currentUsers: number; // Current count of users with this role
  autoAssign: boolean; // Automatically assign to new users
  
  // Department and branch restrictions
  allowedDepartments: string[];
  allowedBranches: mongoose.Types.ObjectId[];
  
  // Time-based restrictions
  accessHours?: {
    start: string; // HH:MM format
    end: string; // HH:MM format
    days: string[]; // ['monday', 'tuesday', ...]
    timezone: string;
  };
  
  // IP and location restrictions
  allowedIPs?: string[];
  allowedCountries?: string[];
  
  // Session and security settings
  sessionTimeout?: number; // Minutes
  requireMFA: boolean; // Multi-factor authentication
  passwordPolicy?: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
  };
  
  // Approval and workflow
  requiresApproval: boolean; // Role assignment requires approval
  approvers: mongoose.Types.ObjectId[]; // Users who can approve role assignments
  
  // Temporary role settings
  isTemporary: boolean;
  validFrom?: Date;
  validUntil?: Date;
  
  // Law firm association
  lawFirmId: mongoose.Types.ObjectId;
  
  // Metadata
  tags: string[]; // For categorization and search
  color?: string; // UI color for the role
  icon?: string; // UI icon for the role
  
  // Audit and compliance
  complianceNotes?: string;
  lastReviewDate?: Date;
  nextReviewDate?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  
  // Additional settings
  notes?: string;
  notesAr?: string;
  
  // Audit trail
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleDocument extends IRole, Document {}

const permissionSchema = new Schema<IPermission>({
  resource: {
    type: String,
    enum: Object.values(ResourceType),
    required: [true, 'Resource is required'],
  },
  actions: [{
    type: String,
    enum: Object.values(PermissionAction),
    required: true,
  }],
  conditions: [{
    field: {
      type: String,
      required: true,
      trim: true,
    },
    operator: {
      type: String,
      enum: ['equals', 'not_equals', 'in', 'not_in', 'contains', 'not_contains'],
      required: true,
    },
    value: Schema.Types.Mixed,
  }],
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
  },
  descriptionAr: {
    type: String,
    trim: true,
    maxlength: [200, 'Arabic description cannot exceed 200 characters'],
  },
}, { _id: false });

const roleSchema = new Schema<RoleDocument>({
  // Role identification
  roleName: {
    type: String,
    required: [true, 'Role name is required'],
    trim: true,
    maxlength: [50, 'Role name cannot exceed 50 characters'],
  },
  roleNameAr: {
    type: String,
    trim: true,
    maxlength: [50, 'Arabic role name cannot exceed 50 characters'],
  },
  roleCode: {
    type: String,
    required: [true, 'Role code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [20, 'Role code cannot exceed 20 characters'],
  },
  
  // Role hierarchy and type
  roleLevel: {
    type: Number,
    required: [true, 'Role level is required'],
    min: [1, 'Role level must be at least 1'],
    max: [10, 'Role level cannot exceed 10'],
  },
  roleType: {
    type: String,
    enum: ['system', 'custom'],
    default: 'custom',
  },
  parentRole: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
  },
  
  // Permissions
  permissions: [permissionSchema],
  inheritPermissions: {
    type: Boolean,
    default: false,
  },
  
  // Role description and purpose
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  descriptionAr: {
    type: String,
    trim: true,
    maxlength: [500, 'Arabic description cannot exceed 500 characters'],
  },
  purpose: {
    type: String,
    trim: true,
    maxlength: [300, 'Purpose cannot exceed 300 characters'],
  },
  purposeAr: {
    type: String,
    trim: true,
    maxlength: [300, 'Arabic purpose cannot exceed 300 characters'],
  },
  
  // Status and availability
  isActive: {
    type: Boolean,
    default: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  
  // Usage and assignment
  maxUsers: {
    type: Number,
    min: [1, 'Maximum users must be at least 1'],
  },
  currentUsers: {
    type: Number,
    default: 0,
    min: [0, 'Current users cannot be negative'],
  },
  autoAssign: {
    type: Boolean,
    default: false,
  },
  
  // Department and branch restrictions
  allowedDepartments: [{
    type: String,
    trim: true,
  }],
  allowedBranches: [{
    type: Schema.Types.ObjectId,
    ref: 'Branch',
  }],
  
  // Time-based restrictions
  accessHours: {
    start: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Start time must be in HH:MM format'
      }
    },
    end: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'End time must be in HH:MM format'
      }
    },
    days: [{
      type: String,
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    }],
    timezone: {
      type: String,
      default: 'Asia/Riyadh',
    },
  },
  
  // IP and location restrictions
  allowedIPs: [{
    type: String,
    validate: {
      validator: function(v: string) {
        // Basic IP validation (IPv4)
        return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v) ||
               /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(v); // IPv6 basic
      },
      message: 'Invalid IP address format'
    }
  }],
  allowedCountries: [{
    type: String,
    trim: true,
    uppercase: true,
    length: 2, // ISO country codes
  }],
  
  // Session and security settings
  sessionTimeout: {
    type: Number,
    min: [5, 'Session timeout must be at least 5 minutes'],
    max: [1440, 'Session timeout cannot exceed 24 hours'],
  },
  requireMFA: {
    type: Boolean,
    default: false,
  },
  passwordPolicy: {
    minLength: {
      type: Number,
      min: [6, 'Minimum password length must be at least 6'],
      max: [50, 'Minimum password length cannot exceed 50'],
      default: 8,
    },
    requireUppercase: {
      type: Boolean,
      default: true,
    },
    requireLowercase: {
      type: Boolean,
      default: true,
    },
    requireNumbers: {
      type: Boolean,
      default: true,
    },
    requireSpecialChars: {
      type: Boolean,
      default: false,
    },
    expiryDays: {
      type: Number,
      min: [30, 'Password expiry must be at least 30 days'],
      max: [365, 'Password expiry cannot exceed 365 days'],
      default: 90,
    },
  },
  
  // Approval and workflow
  requiresApproval: {
    type: Boolean,
    default: false,
  },
  approvers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  // Temporary role settings
  isTemporary: {
    type: Boolean,
    default: false,
  },
  validFrom: Date,
  validUntil: Date,
  
  // Law firm association
  lawFirmId: {
    type: Schema.Types.ObjectId,
    ref: 'LawFirm',
    required: [true, 'Law firm is required'],
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  color: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^#[0-9A-F]{6}$/i.test(v);
      },
      message: 'Color must be a valid hex color code'
    }
  },
  icon: {
    type: String,
    trim: true,
  },
  
  // Audit and compliance
  complianceNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Compliance notes cannot exceed 1000 characters'],
  },
  lastReviewDate: Date,
  nextReviewDate: Date,
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  
  // Additional settings
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
  },
  notesAr: {
    type: String,
    trim: true,
    maxlength: [1000, 'Arabic notes cannot exceed 1000 characters'],
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

// User Role Assignment Model
export interface IUserRole {
  _id?: string;
  
  userId: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
  
  // Assignment details
  assignedBy: mongoose.Types.ObjectId;
  assignedAt: Date;
  assignmentReason?: string;
  
  // Approval workflow
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
  
  // Temporary assignment
  isTemporary: boolean;
  validFrom?: Date;
  validUntil?: Date;
  
  // Context and restrictions
  context?: {
    department?: string;
    branch?: mongoose.Types.ObjectId;
    project?: mongoose.Types.ObjectId;
    conditions?: string[];
  };
  
  // Law firm
  lawFirmId: mongoose.Types.ObjectId;
  
  // Audit trail
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRoleDocument extends IUserRole, Document {}

const userRoleSchema = new Schema<UserRoleDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  roleId: {
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, 'Role is required'],
  },
  
  // Assignment details
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigner is required'],
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
  assignmentReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Assignment reason cannot exceed 500 characters'],
  },
  
  // Approval workflow
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'revoked'],
    default: 'approved', // Default to approved unless role requires approval
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: Date,
  rejectedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  rejectedAt: Date,
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
  },
  
  // Temporary assignment
  isTemporary: {
    type: Boolean,
    default: false,
  },
  validFrom: Date,
  validUntil: Date,
  
  // Context and restrictions
  context: {
    department: {
      type: String,
      trim: true,
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    conditions: [{
      type: String,
      trim: true,
    }],
  },
  
  // Law firm
  lawFirmId: {
    type: Schema.Types.ObjectId,
    ref: 'LawFirm',
    required: [true, 'Law firm is required'],
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
roleSchema.index({ lawFirmId: 1 });
roleSchema.index({ roleCode: 1 }, { unique: true });
roleSchema.index({ roleType: 1 });
roleSchema.index({ isActive: 1 });
roleSchema.index({ roleLevel: 1 });

userRoleSchema.index({ lawFirmId: 1 });
userRoleSchema.index({ userId: 1 });
userRoleSchema.index({ roleId: 1 });
userRoleSchema.index({ status: 1 });
userRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });

// Compound indexes
roleSchema.index({ lawFirmId: 1, isActive: 1 });
roleSchema.index({ lawFirmId: 1, roleType: 1 });
userRoleSchema.index({ lawFirmId: 1, status: 1 });
userRoleSchema.index({ userId: 1, status: 1 });

// Virtual for effective permissions (including inherited)
roleSchema.virtual('effectivePermissions').get(function() {
  // This would be computed based on the role's permissions and parent role permissions
  // Implementation would involve recursive permission resolution
  return this.permissions;
});

// Virtual for is expired (for temporary roles)
roleSchema.virtual('isExpired').get(function() {
  if (!this.isTemporary || !this.validUntil) return false;
  return new Date() > this.validUntil;
});

// Virtual for days until expiry
roleSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.isTemporary || !this.validUntil) return null;
  const diffTime = this.validUntil.getTime() - new Date().getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware for roles
roleSchema.pre('save', function(next) {
  // Ensure only one default role per law firm
  if (this.isDefault && this.isNew) {
    // This validation would need to be handled in the route
  }
  
  // Set next review date if not provided
  if (!this.nextReviewDate) {
    const nextReview = new Date();
    nextReview.setFullYear(nextReview.getFullYear() + 1); // Default to 1 year
    this.nextReviewDate = nextReview;
  }
  
  next();
});

// Pre-save middleware for user roles
userRoleSchema.pre('save', function(next) {
  // Set default status based on role requirements
  if (this.isNew) {
    // This would be set based on the role's requiresApproval field
  }
  
  next();
});

// Static method to generate role code
roleSchema.statics.generateRoleCode = async function(lawFirmId: mongoose.Types.ObjectId, roleName: string) {
  const baseCode = roleName.replace(/[^A-Z0-9]/gi, '').toUpperCase().substring(0, 6);
  let sequence = 1;
  let roleCode = baseCode;
  
  // Check if code exists and increment if needed
  while (await this.findOne({ roleCode })) {
    roleCode = `${baseCode}${sequence}`;
    sequence++;
  }
  
  return roleCode;
};

export const Role = mongoose.model<RoleDocument>('Role', roleSchema);
export const UserRole = mongoose.model<UserRoleDocument>('UserRole', userRoleSchema);
