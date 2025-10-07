import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { Contact, ContactType, ContactStatus } from '../models/Contact';
import { Types } from 'mongoose';

const router = Router();
router.use(protect);

/**
 * @route POST /api/v1/contacts
 * @desc Create a new contact
 * @access Private (All authenticated users)
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const contactData = req.body;

  const contactNumber = await (Contact as any).generateContactNumber(user.lawFirmId);

  const newContact = new Contact({
    ...contactData,
    contactNumber,
    lawFirmId: user.lawFirmId,
    createdBy: user._id,
  });

  const savedContact = await newContact.save();

  const populatedContact = await Contact.findById(savedContact._id)
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .populate('relatedCases', 'title caseNumber')
    .populate('relatedClients', 'name email');

  res.status(201).json({
    success: true,
    data: populatedContact,
    message: 'Contact created successfully',
  });
}));

/**
 * @route GET /api/v1/contacts
 * @desc Get contacts with filters and pagination
 * @access Private (All authenticated users)
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const {
    page = 1,
    limit = 20,
    type,
    status,
    search,
    assignedTo,
    importanceLevel,
    trustLevel,
    tags,
    category
  } = req.query;

  const filter: any = {
    lawFirmId: user.lawFirmId,
    isDeleted: false
  };

  if (type) filter.type = type;
  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (importanceLevel) filter.importanceLevel = importanceLevel;
  if (trustLevel) filter.trustLevel = trustLevel;
  if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
  if (category) filter.categories = category;

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { fullNameAr: { $regex: search, $options: 'i' } },
      { organization: { $regex: search, $options: 'i' } },
      { organizationAr: { $regex: search, $options: 'i' } },
      { 'emails.email': { $regex: search, $options: 'i' } },
      { 'phones.number': { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [contacts, total] = await Promise.all([
    Contact.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('relatedCases', 'title caseNumber')
      .populate('relatedClients', 'name email')
      .sort({ fullName: 1 })
      .skip(skip)
      .limit(limitNum),
    Contact.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: contacts,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Contacts retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/contacts/:id
 * @desc Get a single contact by ID
 * @access Private (All authenticated users)
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const contactId = req.params.id;

  const contact = await Contact.findOne({
    _id: contactId,
    lawFirmId: user.lawFirmId,
    isDeleted: false
  })
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .populate('relatedCases', 'title caseNumber status')
    .populate('relatedClients', 'name email phone');

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found',
    });
  }

  res.json({
    success: true,
    data: contact,
    message: 'Contact retrieved successfully',
  });
}));

/**
 * @route PUT /api/v1/contacts/:id
 * @desc Update a contact by ID
 * @access Private (All authenticated users)
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const contactId = req.params.id;
  const updateData = req.body;

  const updatedContact = await Contact.findOneAndUpdate(
    {
      _id: contactId,
      lawFirmId: user.lawFirmId,
      isDeleted: false
    },
    {
      ...updateData,
      updatedBy: user._id
    },
    { new: true, runValidators: true }
  )
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .populate('relatedCases', 'title caseNumber')
    .populate('relatedClients', 'name email');

  if (!updatedContact) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found',
    });
  }

  res.json({
    success: true,
    data: updatedContact,
    message: 'Contact updated successfully',
  });
}));

/**
 * @route DELETE /api/v1/contacts/:id
 * @desc Delete (soft delete) a contact by ID
 * @access Private (Admin, Manager)
 */
router.delete('/:id', authorize(['admin', 'manager']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const contactId = req.params.id;

  const deletedContact = await Contact.findOneAndUpdate(
    {
      _id: contactId,
      lawFirmId: user.lawFirmId,
      isDeleted: false
    },
    {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: user._id
    },
    { new: true }
  );

  if (!deletedContact) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found',
    });
  }

  res.json({
    success: true,
    message: 'Contact deleted successfully',
  });
}));

/**
 * @route PUT /api/v1/contacts/:id/interaction
 * @desc Log interaction with contact
 * @access Private (All authenticated users)
 */
router.put('/:id/interaction', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const contactId = req.params.id;
  const { method, notes, notesAr } = req.body;

  const contact = await Contact.findOneAndUpdate(
    {
      _id: contactId,
      lawFirmId: user.lawFirmId,
      isDeleted: false
    },
    {
      lastContactDate: new Date(),
      lastContactMethod: method,
      lastContactNotes: notes,
      lastContactNotesAr: notesAr,
      $inc: { totalInteractions: 1 },
      updatedBy: user._id
    },
    { new: true }
  );

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found',
    });
  }

  res.json({
    success: true,
    data: contact,
    message: 'Interaction logged successfully',
  });
}));

/**
 * @route GET /api/v1/contacts/stats/summary
 * @desc Get contact statistics summary
 * @access Private (All authenticated users)
 */
router.get('/stats/summary', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  const stats = await Contact.aggregate([
    { $match: { lawFirmId: user.lawFirmId, isDeleted: false } },
    {
      $facet: {
        totalContacts: [{ $count: 'count' }],
        byType: [
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        byImportance: [
          { $group: { _id: '$importanceLevel', count: { $sum: 1 } } }
        ],
        recentContacts: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          { $project: { fullName: 1, type: 1, createdAt: 1 } }
        ]
      }
    }
  ]);

  res.json({
    success: true,
    data: stats[0],
    message: 'Contact statistics retrieved successfully',
  });
}));

export { router as contactRoutes };
