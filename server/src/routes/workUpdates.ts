import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { WorkUpdate, UpdateType, UpdateStatus, UpdatePriority } from '../models/WorkUpdate';
import { Types } from 'mongoose';

const router = Router();
router.use(protect);

/**
 * @route POST /api/v1/work-updates
 * @desc Create a new work update
 * @access Private (All authenticated users)
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const updateData = req.body;

  const updateNumber = await (WorkUpdate as any).generateUpdateNumber(user.lawFirmId);

  const newUpdate = new WorkUpdate({
    ...updateData,
    updateNumber,
    lawFirmId: user.lawFirmId,
    createdBy: user._id,
    version: 1,
  });

  const savedUpdate = await newUpdate.save();

  const populatedUpdate = await WorkUpdate.findById(savedUpdate._id)
    .populate('createdBy', 'name email')
    .populate('relatedCase', 'title caseNumber')
    .populate('relatedClient', 'name email')
    .populate('recipients.userId', 'name email')
    .populate('recipients.clientId', 'name email');

  res.status(201).json({
    success: true,
    data: populatedUpdate,
    message: 'Work update created successfully',
  });
}));

/**
 * @route GET /api/v1/work-updates
 * @desc Get work updates with filters and pagination
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
    caseId,
    clientId,
    createdBy,
    search,
    startDate,
    endDate,
    publishedOnly
  } = req.query;

  const filter: any = {
    lawFirmId: user.lawFirmId,
    isDeleted: false
  };

  if (type) filter.type = type;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (caseId) filter.relatedCase = caseId;
  if (clientId) filter.relatedClient = clientId;
  if (createdBy) filter.createdBy = createdBy;
  if (publishedOnly === 'true') {
    filter.status = UpdateStatus.PUBLISHED;
    filter.publishedAt = { $lte: new Date() };
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { titleAr: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { contentAr: { $regex: search, $options: 'i' } },
      { updateNumber: { $regex: search, $options: 'i' } },
    ];
  }

  if (startDate || endDate) {
    const dateField = publishedOnly === 'true' ? 'publishedAt' : 'createdAt';
    filter[dateField] = {};
    if (startDate) filter[dateField].$gte = new Date(startDate as string);
    if (endDate) filter[dateField].$lte = new Date(endDate as string);
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [updates, total] = await Promise.all([
    WorkUpdate.find(filter)
      .populate('createdBy', 'name email')
      .populate('relatedCase', 'title caseNumber')
      .populate('relatedClient', 'name email')
      .populate('recipients.userId', 'name email')
      .populate('recipients.clientId', 'name email')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    WorkUpdate.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: updates,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Work updates retrieved successfully',
  });
}));

/**
 * @route PUT /api/v1/work-updates/:id/publish
 * @desc Publish a work update
 * @access Private (All authenticated users)
 */
router.put('/:id/publish', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const updateId = req.params.id;
  const { scheduledFor } = req.body;

  const updateData: any = {
    updatedBy: user._id
  };

  if (scheduledFor && new Date(scheduledFor) > new Date()) {
    updateData.status = UpdateStatus.SCHEDULED;
    updateData.scheduledFor = new Date(scheduledFor);
  } else {
    updateData.status = UpdateStatus.PUBLISHED;
    updateData.publishedAt = new Date();
  }

  const update = await WorkUpdate.findOneAndUpdate(
    {
      _id: updateId,
      lawFirmId: user.lawFirmId,
      status: UpdateStatus.DRAFT,
      isDeleted: false
    },
    updateData,
    { new: true }
  ).populate('createdBy', 'name email');

  if (!update) {
    return res.status(404).json({
      success: false,
      message: 'Work update not found or cannot be published',
    });
  }

  res.json({
    success: true,
    data: update,
    message: scheduledFor ? 'Work update scheduled successfully' : 'Work update published successfully',
  });
}));

/**
 * @route PUT /api/v1/work-updates/:id/read
 * @desc Mark update as read by recipient
 * @access Private (All authenticated users)
 */
router.put('/:id/read', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const updateId = req.params.id;

  const update = await WorkUpdate.findOneAndUpdate(
    {
      _id: updateId,
      lawFirmId: user.lawFirmId,
      'recipients.userId': user._id,
      'recipients.isRead': false,
      isDeleted: false
    },
    {
      $set: {
        'recipients.$.isRead': true,
        'recipients.$.readAt': new Date(),
      },
      $inc: {
        'metrics.views': 1,
        'metrics.uniqueViews': 1,
      },
      updatedBy: user._id
    },
    { new: true }
  );

  if (!update) {
    return res.status(404).json({
      success: false,
      message: 'Work update not found or already read',
    });
  }

  res.json({
    success: true,
    data: update,
    message: 'Work update marked as read',
  });
}));

/**
 * @route POST /api/v1/work-updates/:id/feedback
 * @desc Submit client feedback for work update
 * @access Private (All authenticated users)
 */
router.post('/:id/feedback', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const updateId = req.params.id;
  const { rating, comments, commentsAr, isPublic, followUpRequired } = req.body;

  const update = await WorkUpdate.findOneAndUpdate(
    {
      _id: updateId,
      lawFirmId: user.lawFirmId,
      status: UpdateStatus.PUBLISHED,
      isDeleted: false
    },
    {
      clientFeedback: {
        rating,
        comments,
        commentsAr,
        submittedAt: new Date(),
        isPublic: isPublic || false,
        followUpRequired: followUpRequired || false,
      },
      updatedBy: user._id
    },
    { new: true }
  );

  if (!update) {
    return res.status(404).json({
      success: false,
      message: 'Published work update not found',
    });
  }

  res.json({
    success: true,
    data: update,
    message: 'Feedback submitted successfully',
  });
}));

/**
 * @route PUT /api/v1/work-updates/:id/progress
 * @desc Update progress information
 * @access Private (All authenticated users)
 */
router.put('/:id/progress', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const updateId = req.params.id;
  const { progressInfo } = req.body;

  const update = await WorkUpdate.findOneAndUpdate(
    {
      _id: updateId,
      lawFirmId: user.lawFirmId,
      isDeleted: false
    },
    {
      progressInfo,
      updatedBy: user._id
    },
    { new: true }
  );

  if (!update) {
    return res.status(404).json({
      success: false,
      message: 'Work update not found',
    });
  }

  res.json({
    success: true,
    data: update,
    message: 'Progress updated successfully',
  });
}));

/**
 * @route GET /api/v1/work-updates/stats/summary
 * @desc Get work updates statistics
 * @access Private (All authenticated users)
 */
router.get('/stats/summary', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  const stats = await WorkUpdate.aggregate([
    { $match: { lawFirmId: user.lawFirmId, isDeleted: false } },
    {
      $facet: {
        totalUpdates: [{ $count: 'count' }],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        byType: [
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ],
        byPriority: [
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ],
        recentUpdates: [
          { $match: { status: 'published' } },
          { $sort: { publishedAt: -1 } },
          { $limit: 5 },
          { $project: { title: 1, type: 1, publishedAt: 1, 'metrics.views': 1 } }
        ],
        engagement: [
          { $match: { status: 'published' } },
          {
            $group: {
              _id: null,
              totalViews: { $sum: '$metrics.views' },
              totalUniqueViews: { $sum: '$metrics.uniqueViews' },
              avgRating: { $avg: '$clientFeedback.rating' },
            }
          }
        ]
      }
    }
  ]);

  res.json({
    success: true,
    data: stats[0],
    message: 'Work updates statistics retrieved successfully',
  });
}));

export { router as workUpdateRoutes };
