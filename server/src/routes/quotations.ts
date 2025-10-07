import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { protect } from '../middleware/auth';
import { Quotation, QuotationStatus, QuotationType } from '../models/Quotation';
import { Invoice } from '../models/Invoice';
import { Client } from '../models/Client';
import { Case } from '../models/Case';
import { Types } from 'mongoose';

const router = Router();

// Apply authentication to all quotation routes
router.use(protect);

/**
 * @route GET /api/v1/quotations
 * @desc Get all quotations for the user's law firm
 * @access Private
 */
router.get('/', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    quotationType,
    clientId,
    startDate,
    endDate,
    expired,
    search,
    sortBy = 'quotationDate',
    sortOrder = 'desc'
  } = req.query;
  const user = req.user;

  // Build filter query
  const filter: any = { lawFirmId: user.lawFirmId };

  if (status) filter.status = status;
  if (quotationType) filter.quotationType = quotationType;
  if (clientId) filter.clientId = clientId;

  // Date filtering
  if (startDate || endDate) {
    filter.quotationDate = {};
    if (startDate) filter.quotationDate.$gte = new Date(startDate as string);
    if (endDate) filter.quotationDate.$lte = new Date(endDate as string);
  }

  // Expired filtering
  if (expired === 'true') {
    filter.validUntil = { $lt: new Date() };
    filter.status = { $nin: [QuotationStatus.ACCEPTED, QuotationStatus.CONVERTED, QuotationStatus.CANCELLED] };
  }

  // Search filtering
  if (search) {
    filter.$or = [
      { quotationNumber: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { titleAr: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build sort object
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  const [quotations, total] = await Promise.all([
    Quotation.find(filter)
      .populate('clientId', 'name nameAr email phone company')
      .populate('potentialCaseId', 'title caseNumber')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('convertedToInvoiceId', 'invoiceNumber totalAmount')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Quotation.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: quotations,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Quotations retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/quotations/dashboard
 * @desc Get quotation dashboard data
 * @access Private
 */
router.get('/dashboard', asyncHandler(async (req, res) => {
  const user = req.user;
  const filter = { lawFirmId: user.lawFirmId };

  const [
    totalQuotations,
    acceptedQuotations,
    expiredQuotations,
    totalQuotationValue,
    acceptedValue,
    recentQuotations,
    quotationsByStatus,
    monthlyQuotations,
    conversionRate
  ] = await Promise.all([
    Quotation.countDocuments(filter),
    Quotation.countDocuments({ ...filter, status: QuotationStatus.ACCEPTED }),
    Quotation.countDocuments({ 
      ...filter, 
      validUntil: { $lt: new Date() },
      status: { $nin: [QuotationStatus.ACCEPTED, QuotationStatus.CONVERTED, QuotationStatus.CANCELLED] }
    }),
    Quotation.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Quotation.aggregate([
      { $match: { ...filter, status: { $in: [QuotationStatus.ACCEPTED, QuotationStatus.CONVERTED] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Quotation.find(filter)
      .populate('clientId', 'name nameAr')
      .sort({ createdAt: -1 })
      .limit(5),
    Quotation.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } }
    ]),
    Quotation.aggregate([
      { 
        $match: { 
          ...filter, 
          quotationDate: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) } // Last 12 months
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$quotationDate' },
            month: { $month: '$quotationDate' }
          },
          quotations: { $sum: 1 },
          value: { $sum: '$totalAmount' },
          accepted: {
            $sum: {
              $cond: [
                { $in: ['$status', [QuotationStatus.ACCEPTED, QuotationStatus.CONVERTED]] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),
    Quotation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          accepted: {
            $sum: {
              $cond: [
                { $in: ['$status', [QuotationStatus.ACCEPTED, QuotationStatus.CONVERTED]] },
                1,
                0
              ]
            }
          }
        }
      }
    ])
  ]);

  const conversionRatePercent = conversionRate[0] 
    ? Math.round((conversionRate[0].accepted / conversionRate[0].total) * 100)
    : 0;

  res.json({
    success: true,
    data: {
      statistics: {
        totalQuotations,
        acceptedQuotations,
        expiredQuotations,
        totalQuotationValue: totalQuotationValue[0]?.total || 0,
        acceptedValue: acceptedValue[0]?.total || 0,
        conversionRate: conversionRatePercent,
        averageQuotationValue: totalQuotations > 0 ? (totalQuotationValue[0]?.total || 0) / totalQuotations : 0,
      },
      charts: {
        quotationsByStatus: quotationsByStatus.reduce((acc, item) => {
          acc[item._id] = { count: item.count, amount: item.amount };
          return acc;
        }, {} as Record<string, { count: number; amount: number }>),
        monthlyQuotations: monthlyQuotations.map(item => ({
          period: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
          quotations: item.quotations,
          value: item.value,
          accepted: item.accepted,
          conversionRate: item.quotations > 0 ? Math.round((item.accepted / item.quotations) * 100) : 0
        })),
      },
      recentQuotations,
    },
    message: 'Quotation dashboard data retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/quotations/:id
 * @desc Get a specific quotation
 * @access Private
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const user = req.user;
  const quotationId = req.params.id;

  if (!Types.ObjectId.isValid(quotationId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid quotation ID format',
    });
  }

  const quotation = await Quotation.findOne({
    _id: quotationId,
    lawFirmId: user.lawFirmId
  })
    .populate('clientId', 'name nameAr email phone address company nationalId commercialRegister')
    .populate('potentialCaseId', 'title caseNumber description')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .populate('approvedBy', 'name email')
    .populate('convertedToInvoiceId', 'invoiceNumber totalAmount status');

  if (!quotation) {
    return res.status(404).json({
      success: false,
      message: 'Quotation not found',
    });
  }

  res.json({
    success: true,
    data: quotation,
    message: 'Quotation retrieved successfully',
  });
}));

/**
 * @route POST /api/v1/quotations
 * @desc Create a new quotation
 * @access Private
 */
router.post('/', asyncHandler(async (req, res) => {
  const user = req.user;
  const {
    clientId,
    potentialCaseId,
    title,
    titleAr,
    description,
    descriptionAr,
    quotationType,
    items,
    validUntil,
    validityPeriod,
    taxRate,
    discountRate,
    discountAmount,
    currency,
    paymentTerms,
    deliveryTerms,
    termsAndConditions,
    termsAndConditionsAr,
    notes,
    notesAr,
    internalNotes,
    requiresApproval,
  } = req.body;

  // Validate required fields
  if (!clientId || !title || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: clientId, title, items',
    });
  }

  // Verify client exists and belongs to law firm
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

  // Validate case if provided
  if (potentialCaseId) {
    const caseData = await Case.findOne({
      _id: potentialCaseId,
      lawFirmId: user.lawFirmId
    });

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found or does not belong to your law firm',
      });
    }
  }

  // Validate and calculate item amounts
  const validatedItems = items.map((item: any) => {
    if (!item.description || item.quantity === undefined || item.rate === undefined) {
      throw new Error('Each item must have description, quantity, and rate');
    }
    
    return {
      ...item,
      amount: item.quantity * item.rate,
      taxable: item.taxable !== false, // Default to true
    };
  });

  // Generate quotation number
  const quotationNumber = await (Quotation as any).generateQuotationNumber(user.lawFirmId);

  // Calculate valid until date
  const validUntilDate = validUntil 
    ? new Date(validUntil) 
    : new Date(Date.now() + (validityPeriod || 30) * 24 * 60 * 60 * 1000);

  const newQuotation = new Quotation({
    quotationNumber,
    quotationDate: new Date(),
    validUntil: validUntilDate,
    clientId,
    potentialCaseId,
    title,
    titleAr,
    description,
    descriptionAr,
    quotationType: quotationType || QuotationType.LEGAL_SERVICES,
    items: validatedItems,
    validityPeriod: validityPeriod || 30,
    taxRate: taxRate !== undefined ? taxRate : 15, // Default 15% VAT
    discountRate,
    discountAmount,
    currency: currency || 'SAR',
    paymentTerms: paymentTerms || 'Net 30',
    deliveryTerms,
    termsAndConditions,
    termsAndConditionsAr,
    notes,
    notesAr,
    internalNotes,
    lawFirmId: user.lawFirmId,
    requiresApproval: requiresApproval || false,
    createdBy: user._id,
  });

  const savedQuotation = await newQuotation.save();

  // Populate the response
  const populatedQuotation = await Quotation.findById(savedQuotation._id)
    .populate('clientId', 'name nameAr email phone')
    .populate('potentialCaseId', 'title caseNumber')
    .populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    data: populatedQuotation,
    message: 'Quotation created successfully',
  });
}));

/**
 * @route PUT /api/v1/quotations/:id
 * @desc Update a quotation
 * @access Private
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const user = req.user;
  const quotationId = req.params.id;

  if (!Types.ObjectId.isValid(quotationId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid quotation ID format',
    });
  }

  const quotation = await Quotation.findOne({
    _id: quotationId,
    lawFirmId: user.lawFirmId
  });

  if (!quotation) {
    return res.status(404).json({
      success: false,
      message: 'Quotation not found',
    });
  }

  // Prevent editing accepted or converted quotations
  if (quotation.status === QuotationStatus.ACCEPTED || quotation.status === QuotationStatus.CONVERTED) {
    return res.status(400).json({
      success: false,
      message: 'Cannot edit accepted or converted quotations',
    });
  }

  // Update allowed fields
  const allowedFields = [
    'title', 'titleAr', 'description', 'descriptionAr', 'quotationType',
    'items', 'validUntil', 'validityPeriod', 'taxRate', 'discountRate', 
    'discountAmount', 'currency', 'paymentTerms', 'deliveryTerms',
    'termsAndConditions', 'termsAndConditionsAr', 'notes', 'notesAr', 
    'internalNotes', 'requiresApproval'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      if (field === 'items' && Array.isArray(req.body[field])) {
        // Recalculate item amounts
        quotation[field] = req.body[field].map((item: any) => ({
          ...item,
          amount: item.quantity * item.rate,
          taxable: item.taxable !== false,
        }));
      } else {
        quotation[field] = req.body[field];
      }
    }
  });

  quotation.updatedBy = user._id;

  const updatedQuotation = await quotation.save();

  // Populate the response
  const populatedQuotation = await Quotation.findById(updatedQuotation._id)
    .populate('clientId', 'name nameAr email phone')
    .populate('potentialCaseId', 'title caseNumber');

  res.json({
    success: true,
    data: populatedQuotation,
    message: 'Quotation updated successfully',
  });
}));

/**
 * @route DELETE /api/v1/quotations/:id
 * @desc Delete/Cancel a quotation
 * @access Private
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const user = req.user;
  const quotationId = req.params.id;

  if (!Types.ObjectId.isValid(quotationId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid quotation ID format',
    });
  }

  const quotation = await Quotation.findOne({
    _id: quotationId,
    lawFirmId: user.lawFirmId
  });

  if (!quotation) {
    return res.status(404).json({
      success: false,
      message: 'Quotation not found',
    });
  }

  // Prevent deleting accepted or converted quotations
  if (quotation.status === QuotationStatus.ACCEPTED || quotation.status === QuotationStatus.CONVERTED) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete accepted or converted quotations. Consider cancelling instead.',
    });
  }

  // Cancel instead of delete for sent quotations
  if (quotation.status !== QuotationStatus.DRAFT) {
    quotation.status = QuotationStatus.CANCELLED;
    await quotation.save();

    res.json({
      success: true,
      message: 'Quotation cancelled successfully',
    });
  } else {
    // Delete draft quotations
    await Quotation.findByIdAndDelete(quotationId);

    res.json({
      success: true,
      message: 'Quotation deleted successfully',
    });
  }
}));

/**
 * @route POST /api/v1/quotations/:id/send
 * @desc Send a quotation to client
 * @access Private
 */
router.post('/:id/send', asyncHandler(async (req, res) => {
  const user = req.user;
  const quotationId = req.params.id;

  const quotation = await Quotation.findOne({
    _id: quotationId,
    lawFirmId: user.lawFirmId
  }).populate('clientId', 'name email');

  if (!quotation) {
    return res.status(404).json({
      success: false,
      message: 'Quotation not found',
    });
  }

  // Update status to sent
  quotation.status = QuotationStatus.SENT;
  quotation.sentDate = new Date();
  await quotation.save();

  // TODO: Implement actual email sending logic here

  res.json({
    success: true,
    message: 'Quotation sent successfully',
    data: {
      quotationNumber: quotation.quotationNumber,
      clientEmail: quotation.clientId.email,
      sentDate: quotation.sentDate,
    },
  });
}));

/**
 * @route POST /api/v1/quotations/:id/accept
 * @desc Accept a quotation (usually called by client or on behalf of client)
 * @access Private
 */
router.post('/:id/accept', asyncHandler(async (req, res) => {
  const user = req.user;
  const quotationId = req.params.id;

  const quotation = await Quotation.findOne({
    _id: quotationId,
    lawFirmId: user.lawFirmId
  });

  if (!quotation) {
    return res.status(404).json({
      success: false,
      message: 'Quotation not found',
    });
  }

  if (quotation.isExpired) {
    return res.status(400).json({
      success: false,
      message: 'Quotation has expired',
    });
  }

  // Update status to accepted
  quotation.status = QuotationStatus.ACCEPTED;
  quotation.acceptedDate = new Date();
  await quotation.save();

  res.json({
    success: true,
    message: 'Quotation accepted successfully',
    data: {
      quotationNumber: quotation.quotationNumber,
      acceptedDate: quotation.acceptedDate,
    },
  });
}));

/**
 * @route POST /api/v1/quotations/:id/reject
 * @desc Reject a quotation
 * @access Private
 */
router.post('/:id/reject', asyncHandler(async (req, res) => {
  const user = req.user;
  const quotationId = req.params.id;
  const { rejectionReason } = req.body;

  const quotation = await Quotation.findOne({
    _id: quotationId,
    lawFirmId: user.lawFirmId
  });

  if (!quotation) {
    return res.status(404).json({
      success: false,
      message: 'Quotation not found',
    });
  }

  // Update status to rejected
  quotation.status = QuotationStatus.REJECTED;
  quotation.rejectedDate = new Date();
  quotation.rejectionReason = rejectionReason;
  await quotation.save();

  res.json({
    success: true,
    message: 'Quotation rejected',
    data: {
      quotationNumber: quotation.quotationNumber,
      rejectedDate: quotation.rejectedDate,
      rejectionReason: quotation.rejectionReason,
    },
  });
}));

/**
 * @route POST /api/v1/quotations/:id/convert-to-invoice
 * @desc Convert accepted quotation to invoice
 * @access Private
 */
router.post('/:id/convert-to-invoice', asyncHandler(async (req, res) => {
  const user = req.user;
  const quotationId = req.params.id;
  const { dueDate, paymentTerms } = req.body;

  const quotation = await Quotation.findOne({
    _id: quotationId,
    lawFirmId: user.lawFirmId
  });

  if (!quotation) {
    return res.status(404).json({
      success: false,
      message: 'Quotation not found',
    });
  }

  if (quotation.status !== QuotationStatus.ACCEPTED) {
    return res.status(400).json({
      success: false,
      message: 'Only accepted quotations can be converted to invoices',
    });
  }

  // Generate invoice number
  const invoiceNumber = await (Invoice as any).generateInvoiceNumber(user.lawFirmId);

  // Create invoice from quotation
  const newInvoice = new Invoice({
    invoiceNumber,
    invoiceDate: new Date(),
    dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    clientId: quotation.clientId,
    caseId: quotation.potentialCaseId,
    title: quotation.title,
    titleAr: quotation.titleAr,
    description: quotation.description,
    descriptionAr: quotation.descriptionAr,
    invoiceType: 'standard',
    items: quotation.items,
    taxRate: quotation.taxRate,
    discountRate: quotation.discountRate,
    discountAmount: quotation.discountAmount,
    currency: quotation.currency,
    paymentTerms: paymentTerms || quotation.paymentTerms,
    notes: quotation.notes,
    notesAr: quotation.notesAr,
    internalNotes: `Converted from quotation ${quotation.quotationNumber}. ${quotation.internalNotes || ''}`.trim(),
    lawFirmId: user.lawFirmId,
    createdBy: user._id,
  });

  const savedInvoice = await newInvoice.save();

  // Update quotation status to converted
  quotation.status = QuotationStatus.CONVERTED;
  quotation.convertedToInvoiceId = savedInvoice._id;
  quotation.convertedDate = new Date();
  await quotation.save();

  // Populate the response
  const populatedInvoice = await Invoice.findById(savedInvoice._id)
    .populate('clientId', 'name nameAr email phone');

  res.status(201).json({
    success: true,
    data: {
      invoice: populatedInvoice,
      quotation: {
        quotationNumber: quotation.quotationNumber,
        status: quotation.status,
        convertedDate: quotation.convertedDate,
      }
    },
    message: 'Quotation converted to invoice successfully',
  });
}));

/**
 * @route GET /api/v1/quotations/:id/pdf
 * @desc Generate PDF for a quotation
 * @access Private
 */
router.get('/:id/pdf', asyncHandler(async (req, res) => {
  const user = req.user;
  const quotationId = req.params.id;

  const quotation = await Quotation.findOne({
    _id: quotationId,
    lawFirmId: user.lawFirmId
  })
    .populate('clientId', 'name nameAr email phone address company')
    .populate('potentialCaseId', 'title caseNumber')
    .populate('lawFirmId', 'name address phone email');

  if (!quotation) {
    return res.status(404).json({
      success: false,
      message: 'Quotation not found',
    });
  }

  // TODO: Implement PDF generation logic here

  res.json({
    success: true,
    data: {
      quotationNumber: quotation.quotationNumber,
      pdfUrl: `/api/v1/quotations/${quotationId}/pdf/download`, // Placeholder URL
    },
    message: 'PDF generated successfully',
  });
}));

export { router as quotationRoutes };
