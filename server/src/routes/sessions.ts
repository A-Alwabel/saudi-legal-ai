import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { Session, SessionStatus, SessionType } from '../models/Session';
import { Types } from 'mongoose';

const router = Router();
router.use(protect);

/**
 * @route POST /api/v1/sessions
 * @desc Create a new session
 * @access Private (All authenticated users)
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const sessionData = req.body;

  const sessionNumber = await (Session as any).generateSessionNumber(user.lawFirmId, sessionData.type);

  const newSession = new Session({
    ...sessionData,
    sessionNumber,
    lawFirmId: user.lawFirmId,
    createdBy: user._id,
  });

  const savedSession = await newSession.save();

  const populatedSession = await Session.findById(savedSession._id)
    .populate('participants.userId', 'name email')
    .populate('createdBy', 'name email')
    .populate('caseId', 'title caseNumber')
    .populate('clientId', 'name email');

  res.status(201).json({
    success: true,
    data: populatedSession,
    message: 'Session created successfully',
  });
}));

/**
 * @route GET /api/v1/sessions
 * @desc Get sessions with filters
 * @access Private (All authenticated users)
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const {
    page = 1,
    limit = 20,
    status,
    type,
    caseId,
    clientId,
    startDate,
    endDate,
    upcoming,
    myParticipation
  } = req.query;

  const filter: any = {
    lawFirmId: user.lawFirmId,
    isDeleted: false
  };

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (caseId) filter.caseId = caseId;
  if (clientId) filter.clientId = clientId;
  if (myParticipation === 'true') filter['participants.userId'] = user._id;

  if (upcoming === 'true') {
    filter.scheduledStartTime = { $gte: new Date() };
    filter.status = SessionStatus.SCHEDULED;
  }

  if (startDate || endDate) {
    filter.scheduledStartTime = {};
    if (startDate) filter.scheduledStartTime.$gte = new Date(startDate as string);
    if (endDate) filter.scheduledStartTime.$lte = new Date(endDate as string);
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [sessions, total] = await Promise.all([
    Session.find(filter)
      .populate('participants.userId', 'name email')
      .populate('createdBy', 'name email')
      .populate('caseId', 'title caseNumber')
      .populate('clientId', 'name email')
      .sort({ scheduledStartTime: -1 })
      .skip(skip)
      .limit(limitNum),
    Session.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: sessions,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Sessions retrieved successfully',
  });
}));

/**
 * @route PUT /api/v1/sessions/:id/start
 * @desc Start a session
 * @access Private (Participants)
 */
router.put('/:id/start', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const sessionId = req.params.id;

  const session = await Session.findOneAndUpdate(
    {
      _id: sessionId,
      lawFirmId: user.lawFirmId,
      'participants.userId': user._id,
      status: SessionStatus.SCHEDULED,
      isDeleted: false
    },
    {
      status: SessionStatus.IN_PROGRESS,
      actualStartTime: new Date(),
      updatedBy: user._id
    },
    { new: true }
  ).populate('participants.userId', 'name email');

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session not found or not authorized',
    });
  }

  res.json({
    success: true,
    data: session,
    message: 'Session started successfully',
  });
}));

/**
 * @route PUT /api/v1/sessions/:id/complete
 * @desc Complete a session
 * @access Private (Participants)
 */
router.put('/:id/complete', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const sessionId = req.params.id;
  const { outcomes, minutes } = req.body;

  const session = await Session.findOneAndUpdate(
    {
      _id: sessionId,
      lawFirmId: user.lawFirmId,
      'participants.userId': user._id,
      status: SessionStatus.IN_PROGRESS,
      isDeleted: false
    },
    {
      status: SessionStatus.COMPLETED,
      actualEndTime: new Date(),
      outcomes,
      minutes: {
        ...minutes,
        takenBy: user._id
      },
      updatedBy: user._id
    },
    { new: true }
  ).populate('participants.userId', 'name email');

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session not found or not authorized',
    });
  }

  res.json({
    success: true,
    data: session,
    message: 'Session completed successfully',
  });
}));

export { router as sessionRoutes };
