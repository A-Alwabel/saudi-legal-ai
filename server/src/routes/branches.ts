import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { Branch, BranchStatus, BranchType } from '../models/Branch';
import { Employee } from '../models/Employee';
import { Types } from 'mongoose';

const router = Router();

// All routes are protected and require admin or management permissions
router.use(protect);
router.use(authorize(['admin', 'manager', 'branch_manager']));

/**
 * @route POST /api/v1/branches
 * @desc Create a new branch
 * @access Private (Admin, Manager)
 */
router.post('/', authorize(['admin', 'manager']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const branchData = req.body;

  // Check if head office already exists for this law firm
  if (branchData.branchType === BranchType.HEAD_OFFICE) {
    const existingHeadOffice = await Branch.findOne({
      lawFirmId: user.lawFirmId,
      branchType: BranchType.HEAD_OFFICE,
      status: { $ne: BranchStatus.PERMANENTLY_CLOSED }
    });

    if (existingHeadOffice) {
      return res.status(409).json({
        success: false,
        message: 'Head office already exists for this law firm',
      });
    }
  }

  // Generate branch code if not provided
  if (!branchData.branchCode) {
    branchData.branchCode = await (Branch as any).generateBranchCode(user.lawFirmId, branchData.branchType);
  }

  // Validate branch manager if provided
  if (branchData.branchManager) {
    const manager = await Employee.findOne({
      _id: branchData.branchManager,
      lawFirmId: user.lawFirmId,
      status: 'active'
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Branch manager not found or inactive',
      });
    }
  }

  // Validate staff members if provided
  if (branchData.staff && branchData.staff.length > 0) {
    const staffMembers = await Employee.find({
      _id: { $in: branchData.staff },
      lawFirmId: user.lawFirmId,
      status: 'active'
    });

    if (staffMembers.length !== branchData.staff.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more staff members not found or inactive',
      });
    }
  }

  const newBranch = new Branch({
    ...branchData,
    lawFirmId: user.lawFirmId,
    createdBy: user._id,
  });

  const savedBranch = await newBranch.save();

  // Update parent branch's subordinate branches if applicable
  if (branchData.reportsTo) {
    await Branch.findByIdAndUpdate(
      branchData.reportsTo,
      { $addToSet: { subordinateBranches: savedBranch._id } }
    );
  }

  // Populate response
  const populatedBranch = await Branch.findById(savedBranch._id)
    .populate('branchManager', 'firstName lastName position email')
    .populate('staff', 'firstName lastName position')
    .populate('reportsTo', 'branchName branchCode')
    .populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    data: populatedBranch,
    message: 'Branch created successfully',
  });
}));

/**
 * @route GET /api/v1/branches
 * @desc Get all branches with filters and pagination
 * @access Private (Admin, Manager, Branch Manager)
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const {
    page = 1,
    limit = 10,
    status,
    branchType,
    city,
    province,
    managerId,
    search,
    sortBy = 'branchName',
    sortOrder = 'asc'
  } = req.query;

  const filter: any = { lawFirmId: user.lawFirmId };

  // Filter by status
  if (status) filter.status = status;
  if (branchType) filter.branchType = branchType;
  if (city) filter['address.city'] = city;
  if (province) filter['address.province'] = province;
  if (managerId) filter.branchManager = managerId;

  // Search filtering
  if (search) {
    filter.$or = [
      { branchCode: { $regex: search, $options: 'i' } },
      { branchName: { $regex: search, $options: 'i' } },
      { branchNameAr: { $regex: search, $options: 'i' } },
      { 'address.city': { $regex: search, $options: 'i' } },
      { 'address.province': { $regex: search, $options: 'i' } },
      { 'contactInfo.phone': { $regex: search, $options: 'i' } },
      { 'contactInfo.email': { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build sort object
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  const [branches, total] = await Promise.all([
    Branch.find(filter)
      .populate('branchManager', 'firstName lastName firstNameAr lastNameAr position email')
      .populate('staff', 'firstName lastName position')
      .populate('reportsTo', 'branchName branchCode')
      .populate('subordinateBranches', 'branchName branchCode')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Branch.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: branches,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Branches retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/branches/dashboard
 * @desc Get branch management dashboard data
 * @access Private (Admin, Manager)
 */
router.get('/dashboard', authorize(['admin', 'manager']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const filter = { lawFirmId: user.lawFirmId };

  const [
    totalBranches,
    activeBranches,
    branchesByType,
    branchesByStatus,
    branchesByProvince,
    totalStaff,
    totalCapacity,
    recentBranches,
    performanceMetrics
  ] = await Promise.all([
    Branch.countDocuments(filter),
    Branch.countDocuments({ ...filter, status: BranchStatus.ACTIVE }),
    Branch.aggregate([
      { $match: filter },
      { $group: { _id: '$branchType', count: { $sum: 1 } } }
    ]),
    Branch.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Branch.aggregate([
      { $match: filter },
      { $group: { _id: '$address.province', count: { $sum: 1 } } }
    ]),
    Branch.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$capacity.currentStaff' } } }
    ]),
    Branch.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$capacity.maxStaff' } } }
    ]),
    Branch.find(filter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('branchName branchCode branchType status establishedDate')
      .populate('branchManager', 'firstName lastName'),
    Branch.aggregate([
      { $match: { ...filter, 'metrics.monthlyRevenue': { $exists: true } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$metrics.monthlyRevenue' },
          totalExpenses: { $sum: '$metrics.monthlyExpenses' },
          avgSatisfaction: { $avg: '$metrics.clientSatisfactionScore' },
          avgCompletion: { $avg: '$metrics.caseCompletionRate' }
        }
      }
    ])
  ]);

  const staffUtilization = totalCapacity[0]?.total > 0 ? 
    (totalStaff[0]?.total || 0) / totalCapacity[0].total : 0;

  res.json({
    success: true,
    data: {
      statistics: {
        totalBranches,
        activeBranches,
        totalStaff: totalStaff[0]?.total || 0,
        totalCapacity: totalCapacity[0]?.total || 0,
        staffUtilization,
      },
      charts: {
        branchesByType: branchesByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        branchesByStatus: branchesByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        branchesByProvince: branchesByProvince.reduce((acc, item) => {
          acc[item._id || 'Unknown'] = item.count;
          return acc;
        }, {} as Record<string, number>),
      },
      recentBranches,
      performanceMetrics: performanceMetrics[0] || {
        totalRevenue: 0,
        totalExpenses: 0,
        avgSatisfaction: 0,
        avgCompletion: 0
      },
    },
    message: 'Branch dashboard data retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/branches/:id
 * @desc Get a specific branch
 * @access Private (Admin, Manager, Branch Manager)
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const branchId = req.params.id;

  if (!Types.ObjectId.isValid(branchId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid branch ID format',
    });
  }

  const branch = await Branch.findOne({
    _id: branchId,
    lawFirmId: user.lawFirmId
  })
    .populate('branchManager', 'firstName lastName firstNameAr lastNameAr position email phone')
    .populate('staff', 'firstName lastName firstNameAr lastNameAr position email')
    .populate('reportsTo', 'branchName branchCode branchType')
    .populate('subordinateBranches', 'branchName branchCode branchType status')
    .populate('safetyProtocols.safetyOfficer', 'firstName lastName position')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!branch) {
    return res.status(404).json({
      success: false,
      message: 'Branch not found',
    });
  }

  res.json({
    success: true,
    data: branch,
    message: 'Branch retrieved successfully',
  });
}));

/**
 * @route PUT /api/v1/branches/:id
 * @desc Update a branch
 * @access Private (Admin, Manager)
 */
router.put('/:id', authorize(['admin', 'manager']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const branchId = req.params.id;

  if (!Types.ObjectId.isValid(branchId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid branch ID format',
    });
  }

  const branch = await Branch.findOne({
    _id: branchId,
    lawFirmId: user.lawFirmId
  });

  if (!branch) {
    return res.status(404).json({
      success: false,
      message: 'Branch not found',
    });
  }

  // Check if trying to change head office type
  if (req.body.branchType === BranchType.HEAD_OFFICE && branch.branchType !== BranchType.HEAD_OFFICE) {
    const existingHeadOffice = await Branch.findOne({
      lawFirmId: user.lawFirmId,
      branchType: BranchType.HEAD_OFFICE,
      status: { $ne: BranchStatus.PERMANENTLY_CLOSED },
      _id: { $ne: branchId }
    });

    if (existingHeadOffice) {
      return res.status(409).json({
        success: false,
        message: 'Head office already exists for this law firm',
      });
    }
  }

  // Validate branch manager if provided
  if (req.body.branchManager) {
    const manager = await Employee.findOne({
      _id: req.body.branchManager,
      lawFirmId: user.lawFirmId,
      status: 'active'
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Branch manager not found or inactive',
      });
    }
  }

  // Handle hierarchy changes
  const oldReportsTo = branch.reportsTo?.toString();
  const newReportsTo = req.body.reportsTo;

  // Update allowed fields
  const allowedFields = [
    'branchName', 'branchNameAr', 'branchType', 'status', 'address', 'contactInfo',
    'operatingHours', 'services', 'branchManager', 'staff', 'capacity', 'financials',
    'licenses', 'infrastructure', 'metrics', 'reportsTo', 'establishedDate',
    'openingDate', 'closingDate', 'lastInspectionDate', 'nextInspectionDate',
    'description', 'descriptionAr', 'specializations', 'languages', 'clientTypes',
    'isPubliclyVisible', 'marketingMaterials', 'emergencyContacts', 'safetyProtocols',
    'notes', 'notesAr', 'internalNotes'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      branch[field] = req.body[field];
    }
  });

  branch.updatedBy = user._id;

  const updatedBranch = await branch.save();

  // Update hierarchy relationships if changed
  if (oldReportsTo !== newReportsTo) {
    // Remove from old parent's subordinates
    if (oldReportsTo) {
      await Branch.findByIdAndUpdate(
        oldReportsTo,
        { $pull: { subordinateBranches: branchId } }
      );
    }
    
    // Add to new parent's subordinates
    if (newReportsTo) {
      await Branch.findByIdAndUpdate(
        newReportsTo,
        { $addToSet: { subordinateBranches: branchId } }
      );
    }
  }

  // Populate the response
  const populatedBranch = await Branch.findById(updatedBranch._id)
    .populate('branchManager', 'firstName lastName position')
    .populate('staff', 'firstName lastName position')
    .populate('reportsTo', 'branchName branchCode');

  res.json({
    success: true,
    data: populatedBranch,
    message: 'Branch updated successfully',
  });
}));

/**
 * @route DELETE /api/v1/branches/:id
 * @desc Deactivate a branch (soft delete)
 * @access Private (Admin)
 */
router.delete('/:id', authorize(['admin']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const branchId = req.params.id;

  if (!Types.ObjectId.isValid(branchId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid branch ID format',
    });
  }

  const branch = await Branch.findOne({
    _id: branchId,
    lawFirmId: user.lawFirmId
  });

  if (!branch) {
    return res.status(404).json({
      success: false,
      message: 'Branch not found',
    });
  }

  // Prevent deletion of head office if it has subordinate branches
  if (branch.branchType === BranchType.HEAD_OFFICE && branch.subordinateBranches.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot deactivate head office with active subordinate branches',
    });
  }

  // Update branch status
  branch.status = BranchStatus.PERMANENTLY_CLOSED;
  branch.closingDate = new Date();
  branch.updatedBy = user._id;

  await branch.save();

  // Remove from parent's subordinate branches
  if (branch.reportsTo) {
    await Branch.findByIdAndUpdate(
      branch.reportsTo,
      { $pull: { subordinateBranches: branchId } }
    );
  }

  // Reassign subordinate branches to parent or remove hierarchy
  if (branch.subordinateBranches.length > 0) {
    await Branch.updateMany(
      { _id: { $in: branch.subordinateBranches } },
      { 
        $set: { reportsTo: branch.reportsTo },
        $unset: branch.reportsTo ? {} : { reportsTo: 1 }
      }
    );

    // Update new parent's subordinates
    if (branch.reportsTo) {
      await Branch.findByIdAndUpdate(
        branch.reportsTo,
        { $addToSet: { subordinateBranches: { $each: branch.subordinateBranches } } }
      );
    }
  }

  res.json({
    success: true,
    message: 'Branch deactivated successfully',
  });
}));

/**
 * @route GET /api/v1/branches/hierarchy/tree
 * @desc Get branch organizational hierarchy
 * @access Private (Admin, Manager)
 */
router.get('/hierarchy/tree', authorize(['admin', 'manager']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  const branches = await Branch.find({
    lawFirmId: user.lawFirmId,
    status: { $ne: BranchStatus.PERMANENTLY_CLOSED }
  })
    .populate('branchManager', 'firstName lastName position')
    .populate('reportsTo', 'branchName branchCode')
    .select('branchName branchCode branchType status reportsTo subordinateBranches capacity.currentStaff capacity.maxStaff');

  // Build hierarchy tree
  const buildHierarchy = (branches: any[], parentId: any = null): any[] => {
    return branches
      .filter(branch => {
        if (parentId === null) {
          return !branch.reportsTo;
        }
        return branch.reportsTo && branch.reportsTo._id.toString() === parentId.toString();
      })
      .map(branch => ({
        ...branch.toObject(),
        children: buildHierarchy(branches, branch._id)
      }));
  };

  const hierarchy = buildHierarchy(branches);

  res.json({
    success: true,
    data: hierarchy,
    message: 'Branch hierarchy retrieved successfully',
  });
}));

/**
 * @route PUT /api/v1/branches/:id/metrics
 * @desc Update branch performance metrics
 * @access Private (Admin, Manager, Branch Manager)
 */
router.put('/:id/metrics', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const branchId = req.params.id;
  const { metrics } = req.body;

  if (!metrics) {
    return res.status(400).json({
      success: false,
      message: 'Metrics data is required',
    });
  }

  const branch = await Branch.findOne({
    _id: branchId,
    lawFirmId: user.lawFirmId
  });

  if (!branch) {
    return res.status(404).json({
      success: false,
      message: 'Branch not found',
    });
  }

  // Update metrics
  branch.metrics = { ...branch.metrics, ...metrics };
  branch.updatedBy = user._id;

  await branch.save();

  res.json({
    success: true,
    data: branch.metrics,
    message: 'Branch metrics updated successfully',
  });
}));

/**
 * @route GET /api/v1/branches/public/locations
 * @desc Get public branch locations for client use
 * @access Public
 */
router.get('/public/locations', asyncHandler(async (req: Request, res: Response) => {
  const { city, province, services } = req.query;

  const filter: any = {
    status: BranchStatus.ACTIVE,
    isPubliclyVisible: true
  };

  if (city) filter['address.city'] = city;
  if (province) filter['address.province'] = province;
  if (services) {
    filter['services.serviceId'] = { $in: (services as string).split(',') };
    filter['services.isActive'] = true;
  }

  const branches = await Branch.find(filter)
    .select('branchName branchNameAr branchType address contactInfo operatingHours services specializations languages')
    .sort({ branchType: 1, branchName: 1 });

  res.json({
    success: true,
    data: branches,
    message: 'Public branch locations retrieved successfully',
  });
}));

export { router as branchRoutes };
