import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { Leave, LeaveBalance, LeaveType, LeaveStatus } from '../models/Leave';
import { Employee } from '../models/Employee';
import { Types } from 'mongoose';

const router = Router();

// All routes are protected
router.use(protect);

/**
 * @route POST /api/v1/leaves
 * @desc Create a new leave request
 * @access Private (All authenticated users)
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const {
    employeeId,
    leaveType,
    startDate,
    endDate,
    isHalfDay,
    halfDayPeriod,
    reason,
    reasonAr,
    description,
    descriptionAr,
    medicalCertificate,
    attachments,
    coveringEmployees,
    emergencyContact,
    notes,
    notesAr
  } = req.body;

  // Validate required fields
  if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
    return res.status(400).json({
      success: false,
      message: 'Employee, leave type, dates, and reason are required',
    });
  }

  // Validate employee exists and belongs to same law firm
  const employee = await Employee.findOne({
    _id: employeeId,
    lawFirmId: user.lawFirmId,
    status: 'active'
  });

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found or inactive',
    });
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (end <= start) {
    return res.status(400).json({
      success: false,
      message: 'End date must be after start date',
    });
  }

  // Check for overlapping leaves
  const overlappingLeave = await Leave.findOne({
    employeeId,
    lawFirmId: user.lawFirmId,
    status: { $in: [LeaveStatus.APPROVED, LeaveStatus.PENDING] },
    $or: [
      { startDate: { $lte: end }, endDate: { $gte: start } }
    ]
  });

  if (overlappingLeave) {
    return res.status(409).json({
      success: false,
      message: 'Employee already has leave request for overlapping dates',
    });
  }

  // Generate leave number
  const leaveNumber = await (Leave as any).generateLeaveNumber(user.lawFirmId);

  // Calculate working days
  let totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  let actualWorkingDays = 0;

  if (isHalfDay) {
    totalDays = 0.5;
    actualWorkingDays = 0.5;
  } else {
    // Calculate working days (Sunday to Thursday in Saudi Arabia)
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek >= 0 && dayOfWeek <= 4) { // Sunday (0) to Thursday (4)
        actualWorkingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  // Get current year's leave balance
  const currentYear = new Date().getFullYear();
  let leaveBalance = await LeaveBalance.findOne({
    employeeId,
    lawFirmId: user.lawFirmId,
    year: currentYear
  });

  // Create default leave balance if doesn't exist
  if (!leaveBalance) {
    leaveBalance = new LeaveBalance({
      employeeId,
      lawFirmId: user.lawFirmId,
      year: currentYear,
      balances: [
        { leaveType: LeaveType.ANNUAL, entitled: 21, used: 0, pending: 0, remaining: 21, carried: 0 },
        { leaveType: LeaveType.SICK, entitled: 30, used: 0, pending: 0, remaining: 30, carried: 0 },
        { leaveType: LeaveType.MATERNITY, entitled: 70, used: 0, pending: 0, remaining: 70, carried: 0 },
        { leaveType: LeaveType.PATERNITY, entitled: 3, used: 0, pending: 0, remaining: 3, carried: 0 },
        { leaveType: LeaveType.HAJJ, entitled: 10, used: 0, pending: 0, remaining: 10, carried: 0 },
        { leaveType: LeaveType.EMERGENCY, entitled: 5, used: 0, pending: 0, remaining: 5, carried: 0 },
        { leaveType: LeaveType.BEREAVEMENT, entitled: 3, used: 0, pending: 0, remaining: 3, carried: 0 },
        { leaveType: LeaveType.MARRIAGE, entitled: 5, used: 0, pending: 0, remaining: 5, carried: 0 },
      ],
      updatedBy: user._id
    });
    await leaveBalance.save();
  }

  // Check leave balance availability
  const typeBalance = leaveBalance.balances.find(b => b.leaveType === leaveType);
  const daysToDeduct = actualWorkingDays || totalDays;

  if (typeBalance && typeBalance.remaining < daysToDeduct) {
    return res.status(400).json({
      success: false,
      message: `Insufficient ${leaveType} leave balance. Available: ${typeBalance.remaining} days, Requested: ${daysToDeduct} days`,
    });
  }

  // Set up approval chain based on employee hierarchy
  const approvalChain = [];
  
  // Level 1: Direct manager
  if (employee.managerId) {
    approvalChain.push({
      approver: employee.managerId,
      level: 1,
      status: 'pending'
    });
  }

  // Level 2: HR or senior management (for leaves > 5 days or certain types)
  if (daysToDeduct > 5 || [LeaveType.MATERNITY, LeaveType.HAJJ, LeaveType.STUDY].includes(leaveType as LeaveType)) {
    // Find HR manager or admin
    const hrManager = await Employee.findOne({
      lawFirmId: user.lawFirmId,
      role: { $in: ['admin', 'hr_manager'] },
      status: 'active'
    });

    if (hrManager && hrManager.userId) {
      approvalChain.push({
        approver: hrManager.userId,
        level: 2,
        status: 'pending'
      });
    }
  }

  const newLeave = new Leave({
    leaveNumber,
    employeeId,
    leaveType,
    startDate: start,
    endDate: end,
    totalDays,
    actualWorkingDays,
    isHalfDay: isHalfDay || false,
    halfDayPeriod,
    reason,
    reasonAr,
    description,
    descriptionAr,
    medicalCertificate: medicalCertificate || false,
    attachments: attachments || [],
    coveringEmployees: coveringEmployees || [],
    emergencyContact,
    balanceDeduction: {
      leaveType: leaveType as LeaveType,
      daysDeducted: daysToDeduct,
      remainingBalance: typeBalance ? typeBalance.remaining - daysToDeduct : 0
    },
    approvalChain,
    notes,
    notesAr,
    lawFirmId: user.lawFirmId,
    submittedBy: user._id,
    createdBy: user._id
  });

  const savedLeave = await newLeave.save();

  // Update leave balance (mark as pending)
  if (typeBalance) {
    typeBalance.pending += daysToDeduct;
    typeBalance.remaining -= daysToDeduct;
    await leaveBalance.save();
  }

  // Populate response
  const populatedLeave = await Leave.findById(savedLeave._id)
    .populate('employeeId', 'firstName lastName firstNameAr lastNameAr employeeId position')
    .populate('approvalChain.approver', 'name email')
    .populate('coveringEmployees.employeeId', 'firstName lastName position');

  res.status(201).json({
    success: true,
    data: populatedLeave,
    message: 'Leave request submitted successfully',
  });
}));

/**
 * @route GET /api/v1/leaves
 * @desc Get all leave requests with filters and pagination
 * @access Private (All authenticated users)
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const {
    page = 1,
    limit = 10,
    status,
    leaveType,
    employeeId,
    startDate,
    endDate,
    pending_approval,
    my_leaves,
    my_team,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const filter: any = { lawFirmId: user.lawFirmId };

  // Filter by status
  if (status) filter.status = status;
  if (leaveType) filter.leaveType = leaveType;
  if (employeeId) filter.employeeId = employeeId;

  // Date range filters
  if (startDate || endDate) {
    filter.startDate = {};
    if (startDate) filter.startDate.$gte = new Date(startDate as string);
    if (endDate) filter.startDate.$lte = new Date(endDate as string);
  }

  // Special filters
  if (pending_approval === 'true') {
    filter.status = LeaveStatus.PENDING;
    filter['approvalChain.approver'] = user._id;
    filter['approvalChain.status'] = 'pending';
  }

  if (my_leaves === 'true') {
    // Find employee record for current user
    const employee = await Employee.findOne({ userId: user._id, lawFirmId: user.lawFirmId });
    if (employee) {
      filter.employeeId = employee._id;
    }
  }

  if (my_team === 'true') {
    // Find employees managed by current user
    const managedEmployees = await Employee.find({
      managerId: user._id,
      lawFirmId: user.lawFirmId,
      status: 'active'
    }).select('_id');
    
    if (managedEmployees.length > 0) {
      filter.employeeId = { $in: managedEmployees.map(emp => emp._id) };
    }
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build sort object
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  const [leaves, total] = await Promise.all([
    Leave.find(filter)
      .populate('employeeId', 'firstName lastName firstNameAr lastNameAr employeeId position department')
      .populate('approvalChain.approver', 'name email')
      .populate('finalApprover', 'name email')
      .populate('rejectedBy', 'name email')
      .populate('cancelledBy', 'name email')
      .populate('coveringEmployees.employeeId', 'firstName lastName position')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Leave.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: leaves,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Leave requests retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/leaves/dashboard
 * @desc Get leave dashboard data
 * @access Private (All authenticated users)
 */
router.get('/dashboard', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const currentYear = new Date().getFullYear();
  const currentDate = new Date();

  const [
    totalLeaves,
    pendingLeaves,
    approvedLeaves,
    currentLeaves,
    upcomingLeaves,
    leavesByType,
    leavesByStatus,
    monthlyLeaveStats,
    myLeaveBalance
  ] = await Promise.all([
    Leave.countDocuments({ lawFirmId: user.lawFirmId }),
    Leave.countDocuments({ lawFirmId: user.lawFirmId, status: LeaveStatus.PENDING }),
    Leave.countDocuments({ lawFirmId: user.lawFirmId, status: LeaveStatus.APPROVED }),
    Leave.countDocuments({
      lawFirmId: user.lawFirmId,
      status: LeaveStatus.APPROVED,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    }),
    Leave.find({
      lawFirmId: user.lawFirmId,
      status: LeaveStatus.APPROVED,
      startDate: { $gt: currentDate, $lte: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000) }
    })
      .populate('employeeId', 'firstName lastName position')
      .limit(10),
    Leave.aggregate([
      { $match: { lawFirmId: user.lawFirmId } },
      { $group: { _id: '$leaveType', count: { $sum: 1 } } }
    ]),
    Leave.aggregate([
      { $match: { lawFirmId: user.lawFirmId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Leave.aggregate([
      {
        $match: {
          lawFirmId: user.lawFirmId,
          createdAt: { $gte: new Date(currentYear, 0, 1) }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$status', LeaveStatus.APPROVED] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', LeaveStatus.PENDING] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', LeaveStatus.REJECTED] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    (async () => {
      const employee = await Employee.findOne({ userId: user._id, lawFirmId: user.lawFirmId });
      if (!employee) return null;
      
      return LeaveBalance.findOne({
        employeeId: employee._id,
        lawFirmId: user.lawFirmId,
        year: currentYear
      });
    })()
  ]);

  res.json({
    success: true,
    data: {
      statistics: {
        totalLeaves,
        pendingLeaves,
        approvedLeaves,
        currentLeaves,
      },
      charts: {
        leavesByType: leavesByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        leavesByStatus: leavesByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        monthlyStats: monthlyLeaveStats,
      },
      upcomingLeaves,
      myLeaveBalance,
    },
    message: 'Leave dashboard data retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/leaves/:id
 * @desc Get a specific leave request
 * @access Private (All authenticated users)
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const leaveId = req.params.id;

  if (!Types.ObjectId.isValid(leaveId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid leave ID format',
    });
  }

  const leave = await Leave.findOne({
    _id: leaveId,
    lawFirmId: user.lawFirmId
  })
    .populate('employeeId', 'firstName lastName firstNameAr lastNameAr employeeId position department email phone')
    .populate('approvalChain.approver', 'name email')
    .populate('finalApprover', 'name email')
    .populate('rejectedBy', 'name email')
    .populate('cancelledBy', 'name email')
    .populate('coveringEmployees.employeeId', 'firstName lastName position email phone')
    .populate('submittedBy', 'name email')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!leave) {
    return res.status(404).json({
      success: false,
      message: 'Leave request not found',
    });
  }

  res.json({
    success: true,
    data: leave,
    message: 'Leave request retrieved successfully',
  });
}));

/**
 * @route PUT /api/v1/leaves/:id
 * @desc Update a leave request (only if pending)
 * @access Private (Employee who created the leave)
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const leaveId = req.params.id;

  if (!Types.ObjectId.isValid(leaveId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid leave ID format',
    });
  }

  const leave = await Leave.findOne({
    _id: leaveId,
    lawFirmId: user.lawFirmId,
    submittedBy: user._id,
    status: LeaveStatus.PENDING
  });

  if (!leave) {
    return res.status(404).json({
      success: false,
      message: 'Leave request not found or cannot be modified',
    });
  }

  const allowedFields = [
    'startDate', 'endDate', 'isHalfDay', 'halfDayPeriod', 'reason', 'reasonAr',
    'description', 'descriptionAr', 'attachments', 'coveringEmployees',
    'emergencyContact', 'notes', 'notesAr'
  ];

  // Update allowed fields
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      leave[field] = req.body[field];
    }
  });

  leave.updatedBy = user._id;

  // Recalculate days if dates changed
  if (req.body.startDate || req.body.endDate) {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    
    leave.totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Recalculate working days
    let actualWorkingDays = 0;
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek >= 0 && dayOfWeek <= 4) {
        actualWorkingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    leave.actualWorkingDays = actualWorkingDays;
  }

  const updatedLeave = await leave.save();

  const populatedLeave = await Leave.findById(updatedLeave._id)
    .populate('employeeId', 'firstName lastName position')
    .populate('approvalChain.approver', 'name email');

  res.json({
    success: true,
    data: populatedLeave,
    message: 'Leave request updated successfully',
  });
}));

/**
 * @route POST /api/v1/leaves/:id/approve
 * @desc Approve a leave request
 * @access Private (Managers/HR)
 */
router.post('/:id/approve', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const leaveId = req.params.id;
  const { comments } = req.body;

  const leave = await Leave.findOne({
    _id: leaveId,
    lawFirmId: user.lawFirmId,
    status: LeaveStatus.PENDING
  });

  if (!leave) {
    return res.status(404).json({
      success: false,
      message: 'Leave request not found or already processed',
    });
  }

  // Find the current user's approval level
  const approvalStep = leave.approvalChain.find(
    step => step.approver.toString() === user._id.toString() && step.status === 'pending'
  );

  if (!approvalStep) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to approve this leave request',
    });
  }

  // Update the approval step
  approvalStep.status = 'approved';
  approvalStep.approvedAt = new Date();
  approvalStep.comments = comments;

  // Check if all approvals are complete
  const allApproved = leave.approvalChain.every(step => step.status === 'approved');

  if (allApproved) {
    leave.status = LeaveStatus.APPROVED;
    leave.finalApprover = user._id;
    leave.finalApprovalDate = new Date();

    // Update leave balance - move from pending to used
    const currentYear = new Date().getFullYear();
    const leaveBalance = await LeaveBalance.findOne({
      employeeId: leave.employeeId,
      lawFirmId: user.lawFirmId,
      year: currentYear
    });

    if (leaveBalance) {
      const typeBalance = leaveBalance.balances.find(b => b.leaveType === leave.leaveType);
      if (typeBalance) {
        typeBalance.pending -= leave.balanceDeduction.daysDeducted;
        typeBalance.used += leave.balanceDeduction.daysDeducted;
        await leaveBalance.save();
      }
    }
  }

  await leave.save();

  const populatedLeave = await Leave.findById(leave._id)
    .populate('employeeId', 'firstName lastName position email')
    .populate('approvalChain.approver', 'name email');

  res.json({
    success: true,
    data: populatedLeave,
    message: allApproved ? 'Leave request fully approved' : 'Leave request approved at your level',
  });
}));

/**
 * @route POST /api/v1/leaves/:id/reject
 * @desc Reject a leave request
 * @access Private (Managers/HR)
 */
router.post('/:id/reject', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const leaveId = req.params.id;
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required',
    });
  }

  const leave = await Leave.findOne({
    _id: leaveId,
    lawFirmId: user.lawFirmId,
    status: LeaveStatus.PENDING
  });

  if (!leave) {
    return res.status(404).json({
      success: false,
      message: 'Leave request not found or already processed',
    });
  }

  // Check if user can reject this leave
  const canReject = leave.approvalChain.some(
    step => step.approver.toString() === user._id.toString()
  );

  if (!canReject) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to reject this leave request',
    });
  }

  leave.status = LeaveStatus.REJECTED;
  leave.rejectedBy = user._id;
  leave.rejectedAt = new Date();
  leave.rejectionReason = reason;

  // Restore leave balance
  const currentYear = new Date().getFullYear();
  const leaveBalance = await LeaveBalance.findOne({
    employeeId: leave.employeeId,
    lawFirmId: user.lawFirmId,
    year: currentYear
  });

  if (leaveBalance) {
    const typeBalance = leaveBalance.balances.find(b => b.leaveType === leave.leaveType);
    if (typeBalance) {
      typeBalance.pending -= leave.balanceDeduction.daysDeducted;
      typeBalance.remaining += leave.balanceDeduction.daysDeducted;
      await leaveBalance.save();
    }
  }

  await leave.save();

  const populatedLeave = await Leave.findById(leave._id)
    .populate('employeeId', 'firstName lastName position email')
    .populate('rejectedBy', 'name email');

  res.json({
    success: true,
    data: populatedLeave,
    message: 'Leave request rejected',
  });
}));

/**
 * @route POST /api/v1/leaves/:id/cancel
 * @desc Cancel a leave request
 * @access Private (Employee who created the leave or HR)
 */
router.post('/:id/cancel', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const leaveId = req.params.id;
  const { reason } = req.body;

  const leave = await Leave.findOne({
    _id: leaveId,
    lawFirmId: user.lawFirmId,
    status: { $in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] }
  });

  if (!leave) {
    return res.status(404).json({
      success: false,
      message: 'Leave request not found or cannot be cancelled',
    });
  }

  // Check if user can cancel (employee who created it or HR)
  const employee = await Employee.findOne({ userId: user._id, lawFirmId: user.lawFirmId });
  const canCancel = leave.submittedBy.toString() === user._id.toString() ||
                    (employee && ['admin', 'hr_manager'].includes(employee.role));

  if (!canCancel) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to cancel this leave request',
    });
  }

  leave.status = LeaveStatus.CANCELLED;
  leave.cancelledBy = user._id;
  leave.cancelledAt = new Date();
  leave.cancellationReason = reason;

  // Restore leave balance
  const currentYear = new Date().getFullYear();
  const leaveBalance = await LeaveBalance.findOne({
    employeeId: leave.employeeId,
    lawFirmId: user.lawFirmId,
    year: currentYear
  });

  if (leaveBalance) {
    const typeBalance = leaveBalance.balances.find(b => b.leaveType === leave.leaveType);
    if (typeBalance) {
      if (leave.status === LeaveStatus.APPROVED) {
        typeBalance.used -= leave.balanceDeduction.daysDeducted;
      } else {
        typeBalance.pending -= leave.balanceDeduction.daysDeducted;
      }
      typeBalance.remaining += leave.balanceDeduction.daysDeducted;
      await leaveBalance.save();
    }
  }

  await leave.save();

  const populatedLeave = await Leave.findById(leave._id)
    .populate('employeeId', 'firstName lastName position')
    .populate('cancelledBy', 'name email');

  res.json({
    success: true,
    data: populatedLeave,
    message: 'Leave request cancelled',
  });
}));

/**
 * @route GET /api/v1/leaves/balance/:employeeId
 * @desc Get leave balance for an employee
 * @access Private (Employee themselves or HR)
 */
router.get('/balance/:employeeId', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const employeeId = req.params.employeeId;
  const { year = new Date().getFullYear() } = req.query;

  if (!Types.ObjectId.isValid(employeeId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid employee ID format',
    });
  }

  // Check authorization - employee themselves or HR
  const employee = await Employee.findOne({ _id: employeeId, lawFirmId: user.lawFirmId });
  const currentUserEmployee = await Employee.findOne({ userId: user._id, lawFirmId: user.lawFirmId });

  const canView = employee?.userId?.toString() === user._id.toString() ||
                  (currentUserEmployee && ['admin', 'hr_manager'].includes(currentUserEmployee.role));

  if (!canView) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to view this employee\'s leave balance',
    });
  }

  const leaveBalance = await LeaveBalance.findOne({
    employeeId,
    lawFirmId: user.lawFirmId,
    year: parseInt(year as string)
  });

  if (!leaveBalance) {
    return res.status(404).json({
      success: false,
      message: 'Leave balance not found for this employee and year',
    });
  }

  res.json({
    success: true,
    data: leaveBalance,
    message: 'Leave balance retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/leaves/calendar
 * @desc Get leave calendar data
 * @access Private (All authenticated users)
 */
router.get('/calendar/data', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { startDate, endDate, employeeId } = req.query;

  const filter: any = {
    lawFirmId: user.lawFirmId,
    status: { $in: [LeaveStatus.APPROVED, LeaveStatus.IN_PROGRESS] }
  };

  if (startDate && endDate) {
    filter.$or = [
      { startDate: { $lte: new Date(endDate as string) }, endDate: { $gte: new Date(startDate as string) } }
    ];
  }

  if (employeeId) {
    filter.employeeId = employeeId;
  }

  const leaves = await Leave.find(filter)
    .populate('employeeId', 'firstName lastName firstNameAr lastNameAr position department')
    .sort({ startDate: 1 });

  // Format for calendar display
  const calendarEvents = leaves.map(leave => ({
    id: leave._id,
    title: `${(leave.employeeId as any).firstName} ${(leave.employeeId as any).lastName} - ${leave.leaveType}`,
    titleAr: `${(leave.employeeId as any).firstNameAr || (leave.employeeId as any).firstName} ${(leave.employeeId as any).lastNameAr || (leave.employeeId as any).lastName} - ${leave.leaveType}`,
    start: leave.startDate,
    end: leave.endDate,
    allDay: !leave.isHalfDay,
    backgroundColor: getLeaveTypeColor(leave.leaveType),
    borderColor: getLeaveTypeColor(leave.leaveType),
    extendedProps: {
      leaveType: leave.leaveType,
      status: leave.status,
      employee: leave.employeeId,
      duration: leave.totalDays,
      isHalfDay: leave.isHalfDay,
      halfDayPeriod: leave.halfDayPeriod
    }
  }));

  res.json({
    success: true,
    data: calendarEvents,
    message: 'Leave calendar data retrieved successfully',
  });
}));

// Helper function to get color for leave types
function getLeaveTypeColor(leaveType: string): string {
  const colors: Record<string, string> = {
    [LeaveType.ANNUAL]: '#4CAF50',
    [LeaveType.SICK]: '#FF9800',
    [LeaveType.MATERNITY]: '#E91E63',
    [LeaveType.PATERNITY]: '#2196F3',
    [LeaveType.HAJJ]: '#9C27B0',
    [LeaveType.EMERGENCY]: '#F44336',
    [LeaveType.BEREAVEMENT]: '#795548',
    [LeaveType.MARRIAGE]: '#FF5722',
    [LeaveType.STUDY]: '#3F51B5',
    [LeaveType.UNPAID]: '#9E9E9E',
    [LeaveType.COMPENSATORY]: '#00BCD4',
    [LeaveType.OTHER]: '#607D8B',
  };
  return colors[leaveType] || '#607D8B';
}

export { router as leaveRoutes };
