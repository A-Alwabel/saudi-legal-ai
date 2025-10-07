import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { protect } from '../middleware/auth';
import { Case } from '../models/Case';
import { Client } from '../models/Client';
import { User } from '../models/User';
import { Types } from 'mongoose';

const router = Router();

// Apply authentication to all case routes
router.use(protect);

/**
 * @route GET /api/v1/cases
 * @desc Get all cases for the user's law firm
 * @access Private
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, status, caseType, priority, search } = req.query;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  // Build filter query
  const filter: any = { lawFirmId: user.lawFirmId };
  
  if (status) filter.status = status;
  if (caseType) filter.caseType = caseType;
  if (priority) filter.priority = priority;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { caseNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [cases, total] = await Promise.all([
    Case.find(filter)
      .populate('clientId', 'name nameAr email phone')
      .populate('assignedLawyerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Case.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: cases,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Cases retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/cases/:id
 * @desc Get a specific case
 * @access Private
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const caseId = req.params.id;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  if (!Types.ObjectId.isValid(caseId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid case ID format',
    });
  }

  const caseData = await Case.findOne({ 
    _id: caseId, 
    lawFirmId: user.lawFirmId 
  })
    .populate('clientId', 'name nameAr email phone address')
    .populate('assignedLawyerId', 'name email role')
    .populate('courtId', 'name location');

  if (!caseData) {
    return res.status(404).json({
      success: false,
      message: 'Case not found',
    });
  }

  res.json({
    success: true,
    data: caseData,
    message: 'Case retrieved successfully',
  });
}));

/**
 * @route POST /api/v1/cases
 * @desc Create a new case
 * @access Private
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const {
    title,
    description,
    caseType,
    priority,
    clientId,
    assignedLawyerId,
    expectedEndDate,
    estimatedValue,
    tags
  } = req.body;

  // Validate required fields
  if (!title || !description || !caseType || !clientId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: title, description, caseType, clientId',
    });
  }

  // Verify client exists and belongs to the law firm
  const client = await Client.findOne({ 
    _id: clientId, 
    lawFirmId: user.lawFirmId 
  });
  
  if (!client) {
    return res.status(404).json({
      success: false,
      message: 'Client not found or does not belong to your law firm',
    });
  }

  // Verify assigned lawyer if provided
  let assignedLawyer = user._id; // Default to current user
  if (assignedLawyerId) {
    const lawyer = await User.findOne({
      _id: assignedLawyerId,
      lawFirmId: user.lawFirmId,
      role: { $in: ['lawyer', 'admin'] }
    });
    
    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Assigned lawyer not found or does not belong to your law firm',
      });
    }
    assignedLawyer = assignedLawyerId;
  }

  const newCase = new Case({
    title,
    description,
    caseType,
    priority: priority || 'medium',
    clientId,
    assignedLawyerId: assignedLawyer,
    lawFirmId: user.lawFirmId,
    expectedEndDate: expectedEndDate ? new Date(expectedEndDate) : undefined,
    estimatedValue,
    tags: tags || [],
    startDate: new Date(),
  });

  const savedCase = await newCase.save();
  
  // Populate the response
  const populatedCase = await Case.findById(savedCase._id)
    .populate('clientId', 'name nameAr email phone')
    .populate('assignedLawyerId', 'name email');

  res.status(201).json({
    success: true,
    data: populatedCase,
    message: 'Case created successfully',
  });
}));

/**
 * @route PUT /api/v1/cases/:id
 * @desc Update a case
 * @access Private
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const caseId = req.params.id;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  if (!Types.ObjectId.isValid(caseId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid case ID format',
    });
  }

  const caseData = await Case.findOne({ 
    _id: caseId, 
    lawFirmId: user.lawFirmId 
  });

  if (!caseData) {
    return res.status(404).json({
      success: false,
      message: 'Case not found',
    });
  }

  // Update allowed fields
  const allowedFields = [
    'title', 'description', 'status', 'priority', 'expectedEndDate',
    'actualEndDate', 'successProbability', 'estimatedValue', 'actualValue',
    'tags', 'caseNumber'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      (caseData as any)[field] = req.body[field];
    }
  });

  const updatedCase = await caseData.save();
  
  // Populate the response
  const populatedCase = await Case.findById(updatedCase._id)
    .populate('clientId', 'name nameAr email phone')
    .populate('assignedLawyerId', 'name email');

  res.json({
    success: true,
    data: populatedCase,
    message: 'Case updated successfully',
  });
}));

/**
 * @route DELETE /api/v1/cases/:id
 * @desc Delete a case
 * @access Private
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const caseId = req.params.id;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  if (!Types.ObjectId.isValid(caseId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid case ID format',
    });
  }

  const caseData = await Case.findOneAndDelete({ 
    _id: caseId, 
    lawFirmId: user.lawFirmId 
  });

  if (!caseData) {
    return res.status(404).json({
      success: false,
      message: 'Case not found',
    });
  }

  res.json({
    success: true,
    message: 'Case deleted successfully',
  });
}));

/**
 * @route POST /api/v1/cases/:id/notes
 * @desc Add a note to a case
 * @access Private
 */
router.post('/:id/notes', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const caseId = req.params.id;
  const { content } = req.body;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  if (!content) {
    return res.status(400).json({
      success: false,
      message: 'Note content is required',
    });
  }

  const caseData = await Case.findOne({ 
    _id: caseId, 
    lawFirmId: user.lawFirmId 
  });

  if (!caseData) {
    return res.status(404).json({
      success: false,
      message: 'Case not found',
    });
  }

  if (!caseData.notes) {
    caseData.notes = [];
  }

  caseData.notes.push({
    content,
    addedBy: user._id,
    addedAt: new Date(),
  });

  await caseData.save();

  res.json({
    success: true,
    data: caseData.notes[caseData.notes.length - 1],
    message: 'Note added successfully',
  });
}));

export { router as caseRoutes };
