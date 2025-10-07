import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { ArchiveItem, ArchivePolicy, ArchiveType, ArchiveStatus, RetentionPeriod, AccessLevel } from '../models/Archive';
import { Types } from 'mongoose';

const router = Router();

// All routes are protected
router.use(protect);

// Archive Items Routes

/**
 * @route POST /api/v1/archive/items
 * @desc Create a new archive item
 * @access Private (Admin, Manager, Lawyer)
 */
router.post('/items', authorize(['admin', 'manager', 'lawyer']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const archiveData = req.body;

  // Generate archive number
  const archiveNumber = await (ArchiveItem as any).generateArchiveNumber(
    user.lawFirmId, 
    archiveData.archiveType
  );

  const newArchiveItem = new ArchiveItem({
    ...archiveData,
    archiveNumber,
    lawFirmId: user.lawFirmId,
    archivedBy: user._id,
    createdBy: user._id,
  });

  const savedArchiveItem = await newArchiveItem.save();

  const populatedArchiveItem = await ArchiveItem.findById(savedArchiveItem._id)
    .populate('archivedBy', 'name email')
    .populate('authorizedUsers', 'name email')
    .populate('authorizedRoles', 'roleName roleCode')
    .populate('clientId', 'name nameAr')
    .populate('caseId', 'title titleAr caseNumber')
    .populate('branchId', 'branchName branchCode');

  res.status(201).json({
    success: true,
    data: populatedArchiveItem,
    message: 'Archive item created successfully',
  });
}));

/**
 * @route GET /api/v1/archive/items
 * @desc Get all archive items with filters and pagination
 * @access Private (Admin, Manager, Lawyer, Staff)
 */
router.get('/items', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const {
    page = 1,
    limit = 10,
    archiveType,
    status,
    accessLevel,
    clientId,
    caseId,
    retentionPeriod,
    search,
    startDate,
    endDate,
    sortBy = 'archivedDate',
    sortOrder = 'desc'
  } = req.query;

  const filter: any = { 
    lawFirmId: user.lawFirmId,
    isDeleted: false
  };

  // Apply filters
  if (archiveType) filter.archiveType = archiveType;
  if (status) filter.status = status;
  if (accessLevel) filter.accessLevel = accessLevel;
  if (clientId) filter.clientId = clientId;
  if (caseId) filter.caseId = caseId;
  if (retentionPeriod) filter.retentionPeriod = retentionPeriod;

  // Date range filter
  if (startDate || endDate) {
    filter.archivedDate = {};
    if (startDate) filter.archivedDate.$gte = new Date(startDate as string);
    if (endDate) filter.archivedDate.$lte = new Date(endDate as string);
  }

  // Search filter
  if (search) {
    filter.$text = { $search: search as string };
  }

  // Access control - users can only see items they have access to
  const accessFilter = {
    $or: [
      { createdBy: user._id },
      { archivedBy: user._id },
      { authorizedUsers: user._id },
      // Add role-based access if user roles are populated
    ]
  };

  const finalFilter = { ...filter, ...accessFilter };

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  const [archiveItems, total] = await Promise.all([
    ArchiveItem.find(finalFilter)
      .populate('archivedBy', 'name email')
      .populate('authorizedUsers', 'name email')
      .populate('clientId', 'name nameAr')
      .populate('caseId', 'title titleAr caseNumber')
      .populate('branchId', 'branchName branchCode')
      .populate('reviewedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    ArchiveItem.countDocuments(finalFilter)
  ]);

  res.json({
    success: true,
    data: archiveItems,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Archive items retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/archive/items/dashboard
 * @desc Get archive dashboard data
 * @access Private (Admin, Manager)
 */
router.get('/items/dashboard', authorize(['admin', 'manager']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const filter = { lawFirmId: user.lawFirmId, isDeleted: false };

  const [
    totalItems,
    activeItems,
    archivedItems,
    itemsByType,
    itemsByStatus,
    itemsByAccessLevel,
    expiringItems,
    recentItems,
    storageStats
  ] = await Promise.all([
    ArchiveItem.countDocuments(filter),
    ArchiveItem.countDocuments({ ...filter, status: ArchiveStatus.ACTIVE }),
    ArchiveItem.countDocuments({ ...filter, status: ArchiveStatus.ARCHIVED }),
    ArchiveItem.aggregate([
      { $match: filter },
      { $group: { _id: '$archiveType', count: { $sum: 1 } } }
    ]),
    ArchiveItem.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    ArchiveItem.aggregate([
      { $match: filter },
      { $group: { _id: '$accessLevel', count: { $sum: 1 } } }
    ]),
    ArchiveItem.find({
      ...filter,
      retentionEndDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // Next 90 days
      }
    })
      .populate('clientId', 'name nameAr')
      .populate('caseId', 'title titleAr')
      .limit(10),
    ArchiveItem.find(filter)
      .populate('archivedBy', 'name')
      .populate('clientId', 'name nameAr')
      .sort({ archivedDate: -1 })
      .limit(5),
    ArchiveItem.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$storageLocation.type',
          count: { $sum: 1 },
          totalSize: { $sum: { $sum: '$files.fileSize' } }
        }
      }
    ])
  ]);

  res.json({
    success: true,
    data: {
      statistics: {
        totalItems,
        activeItems,
        archivedItems,
      },
      charts: {
        itemsByType: itemsByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        itemsByStatus: itemsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        itemsByAccessLevel: itemsByAccessLevel.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
      },
      expiringItems,
      recentItems,
      storageStats,
    },
    message: 'Archive dashboard data retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/archive/items/:id
 * @desc Get a specific archive item
 * @access Private (Based on access permissions)
 */
router.get('/items/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const archiveId = req.params.id;

  if (!Types.ObjectId.isValid(archiveId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid archive item ID format',
    });
  }

  const archiveItem = await ArchiveItem.findOne({
    _id: archiveId,
    lawFirmId: user.lawFirmId,
    isDeleted: false,
    $or: [
      { createdBy: user._id },
      { archivedBy: user._id },
      { authorizedUsers: user._id },
    ]
  })
    .populate('archivedBy', 'name email')
    .populate('authorizedUsers', 'name email')
    .populate('authorizedRoles', 'roleName roleCode')
    .populate('clientId', 'name nameAr email phone')
    .populate('caseId', 'title titleAr caseNumber status')
    .populate('branchId', 'branchName branchCode')
    .populate('reviewedBy', 'name email')
    .populate('accessLog.userId', 'name email')
    .populate('restorationHistory.restoredBy', 'name email')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!archiveItem) {
    return res.status(404).json({
      success: false,
      message: 'Archive item not found or access denied',
    });
  }

  // Log access
  archiveItem.accessLog.push({
    userId: user._id,
    accessDate: new Date(),
    accessType: 'view',
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
  });

  await archiveItem.save();

  res.json({
    success: true,
    data: archiveItem,
    message: 'Archive item retrieved successfully',
  });
}));

/**
 * @route PUT /api/v1/archive/items/:id
 * @desc Update an archive item
 * @access Private (Admin, Manager, Creator)
 */
router.put('/items/:id', authorize(['admin', 'manager']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const archiveId = req.params.id;

  if (!Types.ObjectId.isValid(archiveId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid archive item ID format',
    });
  }

  const archiveItem = await ArchiveItem.findOne({
    _id: archiveId,
    lawFirmId: user.lawFirmId,
    isDeleted: false
  });

  if (!archiveItem) {
    return res.status(404).json({
      success: false,
      message: 'Archive item not found',
    });
  }

  // Update allowed fields
  const allowedFields = [
    'archiveTitle', 'archiveTitleAr', 'archiveReason', 'archiveReasonAr',
    'retentionPeriod', 'accessLevel', 'authorizedUsers', 'authorizedRoles',
    'keywords', 'keywordsAr', 'tags', 'categories', 'description', 'descriptionAr',
    'notes', 'notesAr', 'internalNotes', 'complianceNotes', 'legalRequirement',
    'legalRequirementAr'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      archiveItem[field] = req.body[field];
    }
  });

  archiveItem.updatedBy = user._id;
  archiveItem.version += 1;

  const updatedArchiveItem = await archiveItem.save();

  const populatedArchiveItem = await ArchiveItem.findById(updatedArchiveItem._id)
    .populate('authorizedUsers', 'name email')
    .populate('authorizedRoles', 'roleName roleCode');

  res.json({
    success: true,
    data: populatedArchiveItem,
    message: 'Archive item updated successfully',
  });
}));

/**
 * @route POST /api/v1/archive/items/:id/restore
 * @desc Restore an archived item
 * @access Private (Admin, Manager, Authorized Users)
 */
router.post('/items/:id/restore', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const archiveId = req.params.id;
  const { restorationReason, notes } = req.body;

  if (!restorationReason) {
    return res.status(400).json({
      success: false,
      message: 'Restoration reason is required',
    });
  }

  const archiveItem = await ArchiveItem.findOne({
    _id: archiveId,
    lawFirmId: user.lawFirmId,
    status: ArchiveStatus.ARCHIVED,
    isDeleted: false,
    $or: [
      { createdBy: user._id },
      { archivedBy: user._id },
      { authorizedUsers: user._id },
    ]
  });

  if (!archiveItem) {
    return res.status(404).json({
      success: false,
      message: 'Archive item not found or cannot be restored',
    });
  }

  // Update status and add restoration history
  archiveItem.status = ArchiveStatus.ACTIVE;
  archiveItem.restorationHistory.push({
    restoredDate: new Date(),
    restoredBy: user._id,
    restorationReason,
    notes,
  });

  // Log access
  archiveItem.accessLog.push({
    userId: user._id,
    accessDate: new Date(),
    accessType: 'restore',
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
  });

  await archiveItem.save();

  res.json({
    success: true,
    data: archiveItem,
    message: 'Archive item restored successfully',
  });
}));

/**
 * @route DELETE /api/v1/archive/items/:id
 * @desc Permanently delete an archive item
 * @access Private (Admin only)
 */
router.delete('/items/:id', authorize(['admin']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const archiveId = req.params.id;
  const { deletionReason } = req.body;

  if (!deletionReason) {
    return res.status(400).json({
      success: false,
      message: 'Deletion reason is required',
    });
  }

  const archiveItem = await ArchiveItem.findOne({
    _id: archiveId,
    lawFirmId: user.lawFirmId,
    isDeleted: false
  });

  if (!archiveItem) {
    return res.status(404).json({
      success: false,
      message: 'Archive item not found',
    });
  }

  // Soft delete
  archiveItem.isDeleted = true;
  archiveItem.deletedBy = user._id;
  archiveItem.deletedAt = new Date();
  archiveItem.deletionReason = deletionReason;
  archiveItem.status = ArchiveStatus.PERMANENTLY_DELETED;

  // Log access
  archiveItem.accessLog.push({
    userId: user._id,
    accessDate: new Date(),
    accessType: 'delete',
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    notes: deletionReason,
  });

  await archiveItem.save();

  res.json({
    success: true,
    message: 'Archive item deleted successfully',
  });
}));

// Archive Policies Routes

/**
 * @route POST /api/v1/archive/policies
 * @desc Create a new archive policy
 * @access Private (Admin, Manager)
 */
router.post('/policies', authorize(['admin', 'manager']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const policyData = req.body;

  // Generate policy code if not provided
  if (!policyData.policyCode) {
    const baseCode = policyData.policyName.replace(/[^A-Z0-9]/gi, '').toUpperCase().substring(0, 8);
    const timestamp = Date.now().toString().slice(-4);
    policyData.policyCode = `${baseCode}_${timestamp}`;
  }

  const newPolicy = new ArchivePolicy({
    ...policyData,
    lawFirmId: user.lawFirmId,
    createdBy: user._id,
  });

  const savedPolicy = await newPolicy.save();

  const populatedPolicy = await ArchivePolicy.findById(savedPolicy._id)
    .populate('approvers', 'name email')
    .populate('notifyUsers', 'name email')
    .populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    data: populatedPolicy,
    message: 'Archive policy created successfully',
  });
}));

/**
 * @route GET /api/v1/archive/policies
 * @desc Get all archive policies
 * @access Private (Admin, Manager)
 */
router.get('/policies', authorize(['admin', 'manager']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { page = 1, limit = 10, isActive, applicableType } = req.query;

  const filter: any = { lawFirmId: user.lawFirmId };
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (applicableType) filter.applicableTypes = applicableType;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [policies, total] = await Promise.all([
    ArchivePolicy.find(filter)
      .populate('approvers', 'name email')
      .populate('notifyUsers', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    ArchivePolicy.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: policies,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Archive policies retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/archive/search
 * @desc Advanced search in archive
 * @access Private (All authenticated users)
 */
router.get('/search', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const {
    query,
    archiveType,
    accessLevel,
    dateFrom,
    dateTo,
    tags,
    clientId,
    caseId,
    page = 1,
    limit = 20
  } = req.query;

  const filter: any = { 
    lawFirmId: user.lawFirmId,
    isDeleted: false,
    $or: [
      { createdBy: user._id },
      { archivedBy: user._id },
      { authorizedUsers: user._id },
    ]
  };

  // Apply filters
  if (archiveType) filter.archiveType = archiveType;
  if (accessLevel) filter.accessLevel = accessLevel;
  if (clientId) filter.clientId = clientId;
  if (caseId) filter.caseId = caseId;

  // Date range
  if (dateFrom || dateTo) {
    filter.archivedDate = {};
    if (dateFrom) filter.archivedDate.$gte = new Date(dateFrom as string);
    if (dateTo) filter.archivedDate.$lte = new Date(dateTo as string);
  }

  // Tags filter
  if (tags) {
    const tagsArray = (tags as string).split(',').map(tag => tag.trim());
    filter.tags = { $in: tagsArray };
  }

  // Text search
  if (query) {
    filter.$text = { $search: query as string };
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [results, total] = await Promise.all([
    ArchiveItem.find(filter)
      .populate('clientId', 'name nameAr')
      .populate('caseId', 'title titleAr caseNumber')
      .populate('archivedBy', 'name')
      .select('archiveNumber archiveTitle archiveTitleAr archiveType status archivedDate tags keywords')
      .sort(query ? { score: { $meta: 'textScore' } } : { archivedDate: -1 })
      .skip(skip)
      .limit(limitNum),
    ArchiveItem.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: results,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Archive search completed successfully',
  });
}));

/**
 * @route GET /api/v1/archive/reports/retention
 * @desc Get retention compliance report
 * @access Private (Admin, Manager)
 */
router.get('/reports/retention', authorize(['admin', 'manager']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { startDate, endDate } = req.query;

  const filter: any = { lawFirmId: user.lawFirmId, isDeleted: false };

  if (startDate || endDate) {
    filter.archivedDate = {};
    if (startDate) filter.archivedDate.$gte = new Date(startDate as string);
    if (endDate) filter.archivedDate.$lte = new Date(endDate as string);
  }

  const [
    retentionSummary,
    expiringItems,
    overRetentionItems,
    complianceStats
  ] = await Promise.all([
    ArchiveItem.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$retentionPeriod',
          count: { $sum: 1 },
          totalSize: { $sum: { $sum: '$files.fileSize' } }
        }
      }
    ]),
    ArchiveItem.find({
      ...filter,
      retentionEndDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // Next 180 days
      }
    })
      .populate('clientId', 'name nameAr')
      .populate('caseId', 'title titleAr')
      .select('archiveNumber archiveTitle retentionEndDate')
      .sort({ retentionEndDate: 1 }),
    ArchiveItem.find({
      ...filter,
      retentionEndDate: { $lt: new Date() },
      retentionPeriod: { $ne: RetentionPeriod.PERMANENT }
    })
      .populate('clientId', 'name nameAr')
      .select('archiveNumber archiveTitle retentionEndDate')
      .sort({ retentionEndDate: 1 }),
    ArchiveItem.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          compliantItems: {
            $sum: {
              $cond: [
                { $or: [
                  { $eq: ['$retentionPeriod', 'permanent'] },
                  { $gte: ['$retentionEndDate', new Date()] }
                ]},
                1,
                0
              ]
            }
          }
        }
      }
    ])
  ]);

  const complianceRate = complianceStats[0] ? 
    (complianceStats[0].compliantItems / complianceStats[0].totalItems) * 100 : 100;

  res.json({
    success: true,
    data: {
      retentionSummary: retentionSummary.reduce((acc, item) => {
        acc[item._id] = { count: item.count, totalSize: item.totalSize };
        return acc;
      }, {} as Record<string, { count: number; totalSize: number }>),
      expiringItems,
      overRetentionItems,
      complianceRate: Math.round(complianceRate * 100) / 100,
      totalItems: complianceStats[0]?.totalItems || 0,
      compliantItems: complianceStats[0]?.compliantItems || 0,
    },
    message: 'Retention compliance report generated successfully',
  });
}));

export { router as archiveRoutes };
