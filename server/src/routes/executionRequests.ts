import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { ExecutionRequest, ExecutionType, ExecutionStatus, ExecutionPriority } from '../models/ExecutionRequest';
import { Types } from 'mongoose';

const router = Router();
router.use(protect);

/**
 * @route POST /api/v1/execution-requests
 * @desc Create a new execution request
 * @access Private (Lawyers, Admin)
 */
router.post('/', authorize(['admin', 'lawyer']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const executionData = req.body;

  const executionNumber = await (ExecutionRequest as any).generateExecutionNumber(user.lawFirmId);

  const newExecution = new ExecutionRequest({
    ...executionData,
    executionNumber,
    lawFirmId: user.lawFirmId,
    createdBy: user._id,
    'assignedTeam.primaryLawyer': executionData.assignedTeam?.primaryLawyer || user._id,
  });

  const savedExecution = await newExecution.save();

  const populatedExecution = await ExecutionRequest.findById(savedExecution._id)
    .populate('createdBy', 'name email')
    .populate('assignedTeam.primaryLawyer', 'name email')
    .populate('assignedTeam.supportingLawyers', 'name email')
    .populate('relatedCase', 'title caseNumber')
    .populate('relatedClient', 'name email');

  res.status(201).json({
    success: true,
    data: populatedExecution,
    message: 'Execution request created successfully',
  });
}));

/**
 * @route GET /api/v1/execution-requests
 * @desc Get execution requests with filters
 * @access Private (All authenticated users)
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const {
    page = 1,
    limit = 20,
    type,
    status,
    priority,
    assignedTo,
    overdue,
    search,
    startDate,
    endDate
  } = req.query;

  const filter: any = {
    lawFirmId: user.lawFirmId,
    isDeleted: false
  };

  if (type) filter.type = type;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter['assignedTeam.primaryLawyer'] = assignedTo;
  if (overdue === 'true') {
    filter['executionProgress.expectedCompletionDate'] = { $lt: new Date() };
    filter.status = { $nin: [ExecutionStatus.COMPLETED, ExecutionStatus.CANCELLED] };
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { titleAr: { $regex: search, $options: 'i' } },
      { executionNumber: { $regex: search, $options: 'i' } },
      { 'creditor.name': { $regex: search, $options: 'i' } },
      { 'debtor.name': { $regex: search, $options: 'i' } },
    ];
  }

  if (startDate || endDate) {
    filter['courtInfo.judgmentDate'] = {};
    if (startDate) filter['courtInfo.judgmentDate'].$gte = new Date(startDate as string);
    if (endDate) filter['courtInfo.judgmentDate'].$lte = new Date(endDate as string);
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [executions, total] = await Promise.all([
    ExecutionRequest.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignedTeam.primaryLawyer', 'name email')
      .populate('relatedCase', 'title caseNumber')
      .populate('relatedClient', 'name email')
      .sort({ 'courtInfo.judgmentDate': -1 })
      .skip(skip)
      .limit(limitNum),
    ExecutionRequest.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: executions,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Execution requests retrieved successfully',
  });
}));

/**
 * @route PUT /api/v1/execution-requests/:id/status
 * @desc Update execution request status
 * @access Private (Lawyers, Admin)
 */
router.put('/:id/status', authorize(['admin', 'lawyer']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const executionId = req.params.id;
  const { status, notes, notesAr } = req.body;

  const execution = await ExecutionRequest.findOneAndUpdate(
    {
      _id: executionId,
      lawFirmId: user.lawFirmId,
      isDeleted: false
    },
    {
      status,
      notes,
      notesAr,
      updatedBy: user._id
    },
    { new: true }
  ).populate('assignedTeam.primaryLawyer', 'name email');

  if (!execution) {
    return res.status(404).json({
      success: false,
      message: 'Execution request not found',
    });
  }

  res.json({
    success: true,
    data: execution,
    message: 'Status updated successfully',
  });
}));

/**
 * @route POST /api/v1/execution-requests/:id/payment
 * @desc Record payment received
 * @access Private (All authenticated users)
 */
router.post('/:id/payment', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const executionId = req.params.id;
  const { amount, paymentDate, paymentMethod, receiptNumber, notes, notesAr } = req.body;

  const execution = await ExecutionRequest.findOneAndUpdate(
    {
      _id: executionId,
      lawFirmId: user.lawFirmId,
      isDeleted: false
    },
    {
      $push: {
        'financialInfo.payments': {
          amount,
          paymentDate: paymentDate || new Date(),
          paymentMethod,
          receiptNumber,
          notes,
          notesAr
        }
      },
      $inc: {
        'financialInfo.paidAmount': amount,
        'costTracking.recoveredAmount': amount
      },
      updatedBy: user._id
    },
    { new: true }
  );

  if (!execution) {
    return res.status(404).json({
      success: false,
      message: 'Execution request not found',
    });
  }

  res.json({
    success: true,
    data: execution,
    message: 'Payment recorded successfully',
  });
}));

/**
 * @route GET /api/v1/execution-requests/stats/summary
 * @desc Get execution requests statistics
 * @access Private (All authenticated users)
 */
router.get('/stats/summary', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  const stats = await ExecutionRequest.aggregate([
    { $match: { lawFirmId: user.lawFirmId, isDeleted: false } },
    {
      $facet: {
        totalRequests: [{ $count: 'count' }],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        byType: [
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ],
        byPriority: [
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ],
        financialSummary: [
          {
            $group: {
              _id: null,
              totalClaimed: { $sum: '$financialInfo.totalClaimedAmount' },
              totalRecovered: { $sum: '$costTracking.recoveredAmount' },
              totalCosts: { $sum: '$costTracking.actualCosts' },
              avgRecoveryRate: { $avg: '$successMetrics.recoveryRate' }
            }
          }
        ],
        overdueRequests: [
          {
            $match: {
              'executionProgress.expectedCompletionDate': { $lt: new Date() },
              status: { $nin: ['completed', 'cancelled'] }
            }
          },
          { $count: 'count' }
        ]
      }
    }
  ]);

  res.json({
    success: true,
    data: stats[0],
    message: 'Execution requests statistics retrieved successfully',
  });
}));

export { router as executionRequestRoutes };
