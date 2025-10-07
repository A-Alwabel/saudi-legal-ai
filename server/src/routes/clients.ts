import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { protect } from '../middleware/auth';
import { Client } from '../models/Client';
import { User } from '../models/User';
import { Types } from 'mongoose';

const router = Router();

// Apply authentication to all client routes
router.use(protect);

/**
 * @route GET /api/v1/clients
 * @desc Get all clients for the user's law firm
 * @access Private
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, status, clientType, search } = req.query;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  // Build filter query
  const filter: any = { lawFirmId: user.lawFirmId };
  
  if (status) filter.status = status;
  if (clientType) filter.clientType = clientType;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { nameAr: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { nationalId: { $regex: search, $options: 'i' } },
      { 'company.name': { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [clients, total] = await Promise.all([
    Client.find(filter)
      .populate('assignedLawyerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Client.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: clients,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Clients retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/clients/:id
 * @desc Get a specific client
 * @access Private
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const clientId = req.params.id;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  if (!Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid client ID format',
    });
  }

  const client = await Client.findOne({ 
    _id: clientId, 
    lawFirmId: user.lawFirmId 
  })
    .populate('assignedLawyerId', 'name email role')
    .populate('caseCount');

  if (!client) {
    return res.status(404).json({
      success: false,
      message: 'Client not found',
    });
  }

  res.json({
    success: true,
    data: client,
    message: 'Client retrieved successfully',
  });
}));

/**
 * @route POST /api/v1/clients
 * @desc Create a new client
 * @access Private
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const {
    name,
    nameAr,
    email,
    phone,
    nationalId,
    commercialRegister,
    clientType,
    address,
    assignedLawyerId,
    company,
    emergencyContact,
    preferences,
    tags
  } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !clientType) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: name, email, phone, clientType',
    });
  }

  // Check if email already exists
  const existingClient = await Client.findOne({ 
    email,
    lawFirmId: user.lawFirmId 
  });
  
  if (existingClient) {
    return res.status(400).json({
      success: false,
      message: 'Client with this email already exists',
    });
  }

  // Verify assigned lawyer if provided
  let assignedLawyer = undefined;
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

  const newClient = new Client({
    name,
    nameAr,
    email,
    phone,
    nationalId,
    commercialRegister,
    clientType,
    address,
    lawFirmId: user.lawFirmId,
    assignedLawyerId: assignedLawyer,
    company,
    emergencyContact,
    preferences: {
      language: 'en',
      communicationMethod: 'email',
      timezone: 'Asia/Riyadh',
      ...preferences
    },
    tags: tags || [],
  });

  const savedClient = await newClient.save();
  
  // Populate the response
  const populatedClient = await Client.findById(savedClient._id)
    .populate('assignedLawyerId', 'name email');

  res.status(201).json({
    success: true,
    data: populatedClient,
    message: 'Client created successfully',
  });
}));

/**
 * @route PUT /api/v1/clients/:id
 * @desc Update a client
 * @access Private
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const clientId = req.params.id;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  if (!Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid client ID format',
    });
  }

  const client = await Client.findOne({ 
    _id: clientId, 
    lawFirmId: user.lawFirmId 
  });

  if (!client) {
    return res.status(404).json({
      success: false,
      message: 'Client not found',
    });
  }

  // Update allowed fields
  const allowedFields = [
    'name', 'nameAr', 'phone', 'nationalId', 'commercialRegister',
    'clientType', 'status', 'address', 'assignedLawyerId', 'company',
    'emergencyContact', 'preferences', 'tags'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      (client as any)[field] = req.body[field];
    }
  });

  // Don't allow email changes for now (would need more validation)
  const updatedClient = await client.save();
  
  // Populate the response
  const populatedClient = await Client.findById(updatedClient._id)
    .populate('assignedLawyerId', 'name email');

  res.json({
    success: true,
    data: populatedClient,
    message: 'Client updated successfully',
  });
}));

/**
 * @route DELETE /api/v1/clients/:id
 * @desc Delete a client
 * @access Private
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const clientId = req.params.id;

  if (!user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  if (!Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid client ID format',
    });
  }

  const client = await Client.findOneAndDelete({ 
    _id: clientId, 
    lawFirmId: user.lawFirmId 
  });

  if (!client) {
    return res.status(404).json({
      success: false,
      message: 'Client not found',
    });
  }

  res.json({
    success: true,
    message: 'Client deleted successfully',
  });
}));

/**
 * @route POST /api/v1/clients/:id/notes
 * @desc Add a note to a client
 * @access Private
 */
router.post('/:id/notes', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const clientId = req.params.id;
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

  const client = await Client.findOne({ 
    _id: clientId, 
    lawFirmId: user.lawFirmId 
  });

  if (!client) {
    return res.status(404).json({
      success: false,
      message: 'Client not found',
    });
  }

  client.notes = client.notes || [];
  client.notes.push({
    content,
    addedBy: user._id,
    addedAt: new Date(),
  });

  await client.save();

  res.json({
    success: true,
    data: client.notes[client.notes.length - 1],
    message: 'Note added successfully',
  });
}));

export { router as clientRoutes };
