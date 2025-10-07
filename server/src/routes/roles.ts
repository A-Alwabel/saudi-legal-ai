import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { Role, UserRole, ResourceType, PermissionAction } from '../models/Role';
import { User } from '../models/User';
import { Types } from 'mongoose';

const router = Router();

// All routes are protected and require admin permissions
router.use(protect);
router.use(authorize(['admin', 'super_admin']));

/**
 * @route POST /api/v1/roles
 * @desc Create a new role
 * @access Private (Admin, Super Admin)
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const roleData = req.body;

  // Generate role code if not provided
  if (!roleData.roleCode) {
    roleData.roleCode = await (Role as any).generateRoleCode(user.lawFirmId, roleData.roleName);
  }

  // Ensure only one default role per law firm
  if (roleData.isDefault) {
    await Role.updateMany(
      { lawFirmId: user.lawFirmId },
      { isDefault: false }
    );
  }

  // Validate parent role if provided
  if (roleData.parentRole) {
    const parentRole = await Role.findOne({
      _id: roleData.parentRole,
      lawFirmId: user.lawFirmId,
      isActive: true
    });

    if (!parentRole) {
      return res.status(404).json({
        success: false,
        message: 'Parent role not found or inactive',
      });
    }

    // Ensure role level is higher than parent
    if (roleData.roleLevel <= parentRole.roleLevel) {
      return res.status(400).json({
        success: false,
        message: 'Role level must be higher than parent role level',
      });
    }
  }

  const newRole = new Role({
    ...roleData,
    lawFirmId: user.lawFirmId,
    createdBy: user._id,
  });

  const savedRole = await newRole.save();

  const populatedRole = await Role.findById(savedRole._id)
    .populate('parentRole', 'roleName roleCode')
    .populate('approvers', 'name email')
    .populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    data: populatedRole,
    message: 'Role created successfully',
  });
}));

/**
 * @route GET /api/v1/roles
 * @desc Get all roles with filters and pagination
 * @access Private (Admin, Super Admin)
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const {
    page = 1,
    limit = 10,
    roleType,
    isActive,
    roleLevel,
    search,
    sortBy = 'roleLevel',
    sortOrder = 'asc'
  } = req.query;

  const filter: any = { lawFirmId: user.lawFirmId };

  if (roleType) filter.roleType = roleType;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (roleLevel) filter.roleLevel = parseInt(roleLevel as string);

  // Search filtering
  if (search) {
    filter.$or = [
      { roleName: { $regex: search, $options: 'i' } },
      { roleNameAr: { $regex: search, $options: 'i' } },
      { roleCode: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { purpose: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  const [roles, total] = await Promise.all([
    Role.find(filter)
      .populate('parentRole', 'roleName roleCode roleLevel')
      .populate('approvers', 'name email')
      .populate('allowedBranches', 'branchName branchCode')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Role.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: roles,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Roles retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/roles/dashboard
 * @desc Get roles dashboard data
 * @access Private (Admin, Super Admin)
 */
router.get('/dashboard', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const filter = { lawFirmId: user.lawFirmId };

  const [
    totalRoles,
    activeRoles,
    systemRoles,
    customRoles,
    rolesByLevel,
    roleUsage,
    recentRoles,
    expiringSoon
  ] = await Promise.all([
    Role.countDocuments(filter),
    Role.countDocuments({ ...filter, isActive: true }),
    Role.countDocuments({ ...filter, roleType: 'system' }),
    Role.countDocuments({ ...filter, roleType: 'custom' }),
    Role.aggregate([
      { $match: filter },
      { $group: { _id: '$roleLevel', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Role.aggregate([
      { $match: filter },
      {
        $project: {
          roleName: 1,
          roleCode: 1,
          currentUsers: 1,
          maxUsers: 1,
          utilizationRate: {
            $cond: {
              if: { $gt: ['$maxUsers', 0] },
              then: { $divide: ['$currentUsers', '$maxUsers'] },
              else: 0
            }
          }
        }
      },
      { $sort: { utilizationRate: -1 } },
      { $limit: 10 }
    ]),
    Role.find(filter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('roleName roleCode roleType isActive currentUsers')
      .populate('createdBy', 'name'),
    Role.find({
      ...filter,
      isTemporary: true,
      validUntil: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
      }
    })
      .select('roleName roleCode validUntil')
      .limit(10)
  ]);

  res.json({
    success: true,
    data: {
      statistics: {
        totalRoles,
        activeRoles,
        systemRoles,
        customRoles,
      },
      charts: {
        rolesByLevel: rolesByLevel.reduce((acc, item) => {
          acc[`Level ${item._id}`] = item.count;
          return acc;
        }, {} as Record<string, number>),
      },
      roleUsage,
      recentRoles,
      expiringSoon,
    },
    message: 'Roles dashboard data retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/roles/:id
 * @desc Get a specific role
 * @access Private (Admin, Super Admin)
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const roleId = req.params.id;

  if (!Types.ObjectId.isValid(roleId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role ID format',
    });
  }

  const role = await Role.findOne({
    _id: roleId,
    lawFirmId: user.lawFirmId
  })
    .populate('parentRole', 'roleName roleCode roleLevel')
    .populate('approvers', 'name email')
    .populate('allowedBranches', 'branchName branchCode')
    .populate('reviewedBy', 'name email')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!role) {
    return res.status(404).json({
      success: false,
      message: 'Role not found',
    });
  }

  // Get users with this role
  const userRoles = await UserRole.find({
    roleId: roleId,
    lawFirmId: user.lawFirmId,
    status: 'approved'
  })
    .populate('userId', 'name email isActive')
    .limit(50);

  res.json({
    success: true,
    data: {
      ...role.toObject(),
      assignedUsers: userRoles
    },
    message: 'Role retrieved successfully',
  });
}));

/**
 * @route PUT /api/v1/roles/:id
 * @desc Update a role
 * @access Private (Admin, Super Admin)
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const roleId = req.params.id;

  if (!Types.ObjectId.isValid(roleId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role ID format',
    });
  }

  const role = await Role.findOne({
    _id: roleId,
    lawFirmId: user.lawFirmId
  });

  if (!role) {
    return res.status(404).json({
      success: false,
      message: 'Role not found',
    });
  }

  // Prevent modification of system roles
  if (role.roleType === 'system') {
    return res.status(403).json({
      success: false,
      message: 'System roles cannot be modified',
    });
  }

  // Ensure only one default role per law firm
  if (req.body.isDefault && !role.isDefault) {
    await Role.updateMany(
      { lawFirmId: user.lawFirmId, _id: { $ne: roleId } },
      { isDefault: false }
    );
  }

  // Update allowed fields
  const allowedFields = [
    'roleName', 'roleNameAr', 'roleLevel', 'parentRole', 'permissions',
    'inheritPermissions', 'description', 'descriptionAr', 'purpose', 'purposeAr',
    'isActive', 'isDefault', 'maxUsers', 'autoAssign', 'allowedDepartments',
    'allowedBranches', 'accessHours', 'allowedIPs', 'allowedCountries',
    'sessionTimeout', 'requireMFA', 'passwordPolicy', 'requiresApproval',
    'approvers', 'isTemporary', 'validFrom', 'validUntil', 'tags', 'color',
    'icon', 'complianceNotes', 'notes', 'notesAr'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      role[field] = req.body[field];
    }
  });

  role.updatedBy = user._id;

  const updatedRole = await role.save();

  const populatedRole = await Role.findById(updatedRole._id)
    .populate('parentRole', 'roleName roleCode')
    .populate('approvers', 'name email');

  res.json({
    success: true,
    data: populatedRole,
    message: 'Role updated successfully',
  });
}));

/**
 * @route DELETE /api/v1/roles/:id
 * @desc Delete a role (soft delete by deactivating)
 * @access Private (Admin, Super Admin)
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const roleId = req.params.id;

  if (!Types.ObjectId.isValid(roleId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role ID format',
    });
  }

  const role = await Role.findOne({
    _id: roleId,
    lawFirmId: user.lawFirmId
  });

  if (!role) {
    return res.status(404).json({
      success: false,
      message: 'Role not found',
    });
  }

  // Prevent deletion of system roles
  if (role.roleType === 'system') {
    return res.status(403).json({
      success: false,
      message: 'System roles cannot be deleted',
    });
  }

  // Check if role has active users
  const activeUserRoles = await UserRole.countDocuments({
    roleId: roleId,
    lawFirmId: user.lawFirmId,
    status: 'approved'
  });

  if (activeUserRoles > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete role. ${activeUserRoles} users are currently assigned to this role.`,
    });
  }

  // Deactivate role instead of hard delete
  role.isActive = false;
  role.updatedBy = user._id;
  await role.save();

  res.json({
    success: true,
    message: 'Role deactivated successfully',
  });
}));

/**
 * @route POST /api/v1/roles/:roleId/assign/:userId
 * @desc Assign a role to a user
 * @access Private (Admin, Super Admin)
 */
router.post('/:roleId/assign/:userId', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { roleId, userId } = req.params;
  const { assignmentReason, isTemporary, validFrom, validUntil, context } = req.body;

  // Validate IDs
  if (!Types.ObjectId.isValid(roleId) || !Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role or user ID format',
    });
  }

  // Validate role exists and is active
  const role = await Role.findOne({
    _id: roleId,
    lawFirmId: user.lawFirmId,
    isActive: true
  });

  if (!role) {
    return res.status(404).json({
      success: false,
      message: 'Role not found or inactive',
    });
  }

  // Validate user exists and belongs to same law firm
  const targetUser = await User.findOne({
    _id: userId,
    lawFirmId: user.lawFirmId,
    isActive: true
  });

  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found or inactive',
    });
  }

  // Check if assignment already exists
  const existingAssignment = await UserRole.findOne({
    userId,
    roleId,
    lawFirmId: user.lawFirmId,
    status: { $in: ['pending', 'approved'] }
  });

  if (existingAssignment) {
    return res.status(409).json({
      success: false,
      message: 'User already has this role assigned',
    });
  }

  // Check role capacity
  if (role.maxUsers && role.currentUsers >= role.maxUsers) {
    return res.status(400).json({
      success: false,
      message: 'Role has reached maximum user capacity',
    });
  }

  // Create role assignment
  const userRole = new UserRole({
    userId,
    roleId,
    assignedBy: user._id,
    assignmentReason,
    status: role.requiresApproval ? 'pending' : 'approved',
    isTemporary: isTemporary || false,
    validFrom: validFrom ? new Date(validFrom) : undefined,
    validUntil: validUntil ? new Date(validUntil) : undefined,
    context,
    lawFirmId: user.lawFirmId,
  });

  await userRole.save();

  // Update role user count if approved
  if (userRole.status === 'approved') {
    role.currentUsers += 1;
    await role.save();
  }

  const populatedUserRole = await UserRole.findById(userRole._id)
    .populate('userId', 'name email')
    .populate('roleId', 'roleName roleCode')
    .populate('assignedBy', 'name email');

  res.status(201).json({
    success: true,
    data: populatedUserRole,
    message: role.requiresApproval ? 
      'Role assignment created and pending approval' : 
      'Role assigned successfully',
  });
}));

/**
 * @route DELETE /api/v1/roles/:roleId/revoke/:userId
 * @desc Revoke a role from a user
 * @access Private (Admin, Super Admin)
 */
router.delete('/:roleId/revoke/:userId', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { roleId, userId } = req.params;

  // Validate IDs
  if (!Types.ObjectId.isValid(roleId) || !Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role or user ID format',
    });
  }

  // Find the role assignment
  const userRole = await UserRole.findOne({
    userId,
    roleId,
    lawFirmId: user.lawFirmId,
    status: { $in: ['pending', 'approved'] }
  });

  if (!userRole) {
    return res.status(404).json({
      success: false,
      message: 'Role assignment not found',
    });
  }

  // Update assignment status
  userRole.status = 'revoked';
  await userRole.save();

  // Update role user count if it was approved
  if (userRole.status === 'approved') {
    await Role.findByIdAndUpdate(roleId, { $inc: { currentUsers: -1 } });
  }

  res.json({
    success: true,
    message: 'Role revoked successfully',
  });
}));

/**
 * @route GET /api/v1/roles/permissions/resources
 * @desc Get available resources and actions for permission configuration
 * @access Private (Admin, Super Admin)
 */
router.get('/permissions/resources', asyncHandler(async (req: Request, res: Response) => {
  const resources = Object.values(ResourceType).map(resource => ({
    resource,
    actions: Object.values(PermissionAction),
    description: getResourceDescription(resource)
  }));

  res.json({
    success: true,
    data: {
      resources,
      actions: Object.values(PermissionAction)
    },
    message: 'Permission resources retrieved successfully',
  });
}));

// Helper function to get resource descriptions
function getResourceDescription(resource: ResourceType): { en: string; ar: string } {
  const descriptions: Record<ResourceType, { en: string; ar: string }> = {
    [ResourceType.USERS]: { en: 'User Management', ar: 'إدارة المستخدمين' },
    [ResourceType.ROLES]: { en: 'Role Management', ar: 'إدارة الأدوار' },
    [ResourceType.PERMISSIONS]: { en: 'Permission Management', ar: 'إدارة الصلاحيات' },
    [ResourceType.LAW_FIRMS]: { en: 'Law Firm Management', ar: 'إدارة المكاتب القانونية' },
    [ResourceType.BRANCHES]: { en: 'Branch Management', ar: 'إدارة الفروع' },
    [ResourceType.CLIENTS]: { en: 'Client Management', ar: 'إدارة العملاء' },
    [ResourceType.CLIENT_PORTAL]: { en: 'Client Portal', ar: 'بوابة العميل' },
    [ResourceType.CLIENT_REPORTS]: { en: 'Client Reports', ar: 'تقارير العملاء' },
    [ResourceType.CONTACTS]: { en: 'Contact Management', ar: 'إدارة جهات الاتصال' },
    [ResourceType.CASES]: { en: 'Case Management', ar: 'إدارة القضايا' },
    [ResourceType.DOCUMENTS]: { en: 'Document Management', ar: 'إدارة المستندات' },
    [ResourceType.SESSIONS]: { en: 'Session Management', ar: 'إدارة الجلسات' },
    [ResourceType.EXECUTION_REQUESTS]: { en: 'Execution Requests', ar: 'طلبات التنفيذ' },
    [ResourceType.POWER_OF_ATTORNEY]: { en: 'Power of Attorney', ar: 'الوكالات' },
    [ResourceType.TASKS]: { en: 'Task Management', ar: 'إدارة المهام' },
    [ResourceType.APPOINTMENTS]: { en: 'Appointment Management', ar: 'إدارة المواعيد' },
    [ResourceType.REMINDERS]: { en: 'Reminder Management', ar: 'إدارة التذكيرات' },
    [ResourceType.WORK_UPDATES]: { en: 'Work Updates', ar: 'مستجدات العمل' },
    [ResourceType.INVOICES]: { en: 'Invoice Management', ar: 'إدارة الفواتير' },
    [ResourceType.QUOTATIONS]: { en: 'Quotation Management', ar: 'إدارة عروض الأسعار' },
    [ResourceType.PAYMENTS]: { en: 'Payment Management', ar: 'إدارة المدفوعات' },
    [ResourceType.EXPENSES]: { en: 'Expense Management', ar: 'إدارة المصروفات' },
    [ResourceType.TREASURY]: { en: 'Treasury Management', ar: 'إدارة الخزينة' },
    [ResourceType.FINANCIAL_REPORTS]: { en: 'Financial Reports', ar: 'التقارير المالية' },
    [ResourceType.EMPLOYEES]: { en: 'Employee Management', ar: 'إدارة الموظفين' },
    [ResourceType.LEAVE_MANAGEMENT]: { en: 'Leave Management', ar: 'إدارة الإجازات' },
    [ResourceType.PERFORMANCE]: { en: 'Performance Management', ar: 'إدارة الأداء' },
    [ResourceType.MESSAGING]: { en: 'Messaging System', ar: 'نظام المراسلة' },
    [ResourceType.NOTIFICATIONS]: { en: 'Notification System', ar: 'نظام الإشعارات' },
    [ResourceType.ARCHIVE]: { en: 'Archive System', ar: 'نظام الأرشيف' },
    [ResourceType.LEGAL_LIBRARY]: { en: 'Legal Library', ar: 'المكتبة القانونية' },
    [ResourceType.AI_CHAT]: { en: 'AI Chat System', ar: 'نظام المحادثة الذكية' },
    [ResourceType.ANALYTICS]: { en: 'Analytics & Reports', ar: 'التحليلات والتقارير' },
    [ResourceType.SYSTEM_SETTINGS]: { en: 'System Settings', ar: 'إعدادات النظام' },
    [ResourceType.AUDIT_LOGS]: { en: 'Audit Logs', ar: 'سجلات المراجعة' },
    [ResourceType.BACKUPS]: { en: 'Backup Management', ar: 'إدارة النسخ الاحتياطية' },
  };

  return descriptions[resource] || { en: resource, ar: resource };
}

export { router as roleRoutes };
