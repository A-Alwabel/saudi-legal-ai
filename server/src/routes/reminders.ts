import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { Reminder, ReminderStatus, ReminderType } from '../models/Reminder';
import { Types } from 'mongoose';

const router = Router();
router.use(protect);

/**
 * @route POST /api/v1/reminders
 * @desc Create a new reminder
 * @access Private (All authenticated users)
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const reminderData = req.body;

  const reminderNumber = await (Reminder as any).generateReminderNumber(user.lawFirmId);

  const newReminder = new Reminder({
    ...reminderData,
    reminderNumber,
    lawFirmId: user.lawFirmId,
    createdBy: user._id,
    assignedTo: reminderData.assignedTo || [user._id]
  });

  const savedReminder = await newReminder.save();

  const populatedReminder = await Reminder.findById(savedReminder._id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    data: populatedReminder,
    message: 'Reminder created successfully',
  });
}));

/**
 * @route GET /api/v1/reminders
 * @desc Get reminders with filters
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
    assignedToMe,
    upcoming,
    overdue,
    startDate,
    endDate
  } = req.query;

  const filter: any = {
    lawFirmId: user.lawFirmId,
    isDeleted: false
  };

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (priority) filter.priority = priority;
  if (assignedToMe === 'true') filter.assignedTo = user._id;

  if (upcoming === 'true') {
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    filter.reminderDate = { $gte: now, $lte: next7Days };
    filter.status = ReminderStatus.ACTIVE;
  }

  if (overdue === 'true') {
    filter.dueDate = { $lt: new Date() };
    filter.status = ReminderStatus.ACTIVE;
  }

  if (startDate || endDate) {
    filter.reminderDate = {};
    if (startDate) filter.reminderDate.$gte = new Date(startDate as string);
    if (endDate) filter.reminderDate.$lte = new Date(endDate as string);
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [reminders, total] = await Promise.all([
    Reminder.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('completedBy', 'name email')
      .sort({ reminderDate: 1 })
      .skip(skip)
      .limit(limitNum),
    Reminder.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: reminders,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Reminders retrieved successfully',
  });
}));

/**
 * @route PUT /api/v1/reminders/:id/complete
 * @desc Mark reminder as completed
 * @access Private (Assigned users)
 */
router.put('/:id/complete', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const reminderId = req.params.id;
  const { completionNotes, completionNotesAr } = req.body;

  const reminder = await Reminder.findOneAndUpdate(
    {
      _id: reminderId,
      lawFirmId: user.lawFirmId,
      assignedTo: user._id,
      status: ReminderStatus.ACTIVE,
      isDeleted: false
    },
    {
      status: ReminderStatus.COMPLETED,
      completedAt: new Date(),
      completedBy: user._id,
      completionNotes,
      completionNotesAr,
      updatedBy: user._id
    },
    { new: true }
  ).populate('assignedTo', 'name email');

  if (!reminder) {
    return res.status(404).json({
      success: false,
      message: 'Reminder not found or not authorized',
    });
  }

  res.json({
    success: true,
    data: reminder,
    message: 'Reminder marked as completed',
  });
}));

/**
 * @route PUT /api/v1/reminders/:id/snooze
 * @desc Snooze a reminder
 * @access Private (Assigned users)
 */
router.put('/:id/snooze', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const reminderId = req.params.id;
  const { snoozeMinutes } = req.body;

  if (!snoozeMinutes || snoozeMinutes < 1) {
    return res.status(400).json({
      success: false,
      message: 'Valid snooze minutes required',
    });
  }

  const reminder = await Reminder.findOne({
    _id: reminderId,
    lawFirmId: user.lawFirmId,
    assignedTo: user._id,
    status: ReminderStatus.ACTIVE,
    isDeleted: false
  });

  if (!reminder) {
    return res.status(404).json({
      success: false,
      message: 'Reminder not found or not authorized',
    });
  }

  if (reminder.snoozeCount >= reminder.maxSnoozes) {
    return res.status(400).json({
      success: false,
      message: 'Maximum snooze limit reached',
    });
  }

  const snoozeUntil = new Date(Date.now() + snoozeMinutes * 60 * 1000);

  reminder.snoozeUntil = snoozeUntil;
  reminder.snoozeCount += 1;
  reminder.status = ReminderStatus.SNOOZED;
  reminder.updatedBy = user._id;

  await reminder.save();

  res.json({
    success: true,
    data: reminder,
    message: `Reminder snoozed for ${snoozeMinutes} minutes`,
  });
}));

export { router as reminderRoutes };
