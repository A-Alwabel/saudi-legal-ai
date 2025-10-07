import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { Notification, NotificationPreference, NotificationType, NotificationPriority, NotificationStatus, DeliveryMethod } from '../models/Notification';
import { Types } from 'mongoose';

const router = Router();

// All routes are protected
router.use(protect);

/**
 * @route POST /api/v1/notifications
 * @desc Create a new notification
 * @access Private (Admin, Manager, System)
 */
router.post('/', authorize(['admin', 'manager', 'system']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const notificationData = req.body;

  // Generate notification ID
  const notificationId = await (Notification as any).generateNotificationId(user.lawFirmId);

  const newNotification = new Notification({
    ...notificationData,
    notificationId,
    lawFirmId: user.lawFirmId,
    createdBy: user._id,
  });

  const savedNotification = await newNotification.save();

  res.status(201).json({
    success: true,
    data: savedNotification,
    message: 'Notification created successfully',
  });
}));

/**
 * @route GET /api/v1/notifications
 * @desc Get user notifications
 * @access Private (All authenticated users)
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const {
    page = 1,
    limit = 20,
    status,
    type,
    priority,
    unreadOnly,
    startDate,
    endDate
  } = req.query;

  const filter: any = {
    lawFirmId: user.lawFirmId,
    recipientId: user._id,
    isDeleted: false
  };

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (priority) filter.priority = priority;
  if (unreadOnly === 'true') filter.readAt = { $exists: false };

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate as string);
    if (endDate) filter.createdAt.$lte = new Date(endDate as string);
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate('senderId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, readAt: { $exists: false } })
  ]);

  res.json({
    success: true,
    data: notifications,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    unreadCount,
    message: 'Notifications retrieved successfully',
  });
}));

/**
 * @route PUT /api/v1/notifications/:id/read
 * @desc Mark notification as read
 * @access Private (All authenticated users)
 */
router.put('/:id/read', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const notificationId = req.params.id;

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      lawFirmId: user.lawFirmId,
      recipientId: user._id,
      isDeleted: false
    },
    {
      readAt: new Date(),
      status: NotificationStatus.READ,
      $inc: { impressions: 1 }
    },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found',
    });
  }

  res.json({
    success: true,
    data: notification,
    message: 'Notification marked as read',
  });
}));

/**
 * @route PUT /api/v1/notifications/read-all
 * @desc Mark all notifications as read
 * @access Private (All authenticated users)
 */
router.put('/read-all', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  const result = await Notification.updateMany(
    {
      lawFirmId: user.lawFirmId,
      recipientId: user._id,
      isDeleted: false,
      readAt: { $exists: false }
    },
    {
      readAt: new Date(),
      status: NotificationStatus.READ
    }
  );

  res.json({
    success: true,
    data: { modifiedCount: result.modifiedCount },
    message: 'All notifications marked as read',
  });
}));

export { router as notificationRoutes };
