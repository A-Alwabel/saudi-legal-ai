import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { protect } from '../middleware/auth';
import { Invoice, InvoiceStatus, InvoiceType, PaymentMethod } from '../models/Invoice';
import { Client } from '../models/Client';
import { Case } from '../models/Case';
import { Task } from '../models/Task';
import { Types } from 'mongoose';

const router = Router();

// Apply authentication to all invoice routes
router.use(protect);

/**
 * @route GET /api/v1/invoices
 * @desc Get all invoices for the user's law firm
 * @access Private
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    invoiceType,
    clientId,
    caseId,
    startDate,
    endDate,
    overdue,
    search,
    sortBy = 'invoiceDate',
    sortOrder = 'desc'
  } = req.query;
  const user = req.user;

  // Build filter query
  const filter: any = { lawFirmId: user.lawFirmId };

  if (status) filter.status = status;
  if (invoiceType) filter.invoiceType = invoiceType;
  if (clientId) filter.clientId = clientId;
  if (caseId) filter.caseId = caseId;

  // Date filtering
  if (startDate || endDate) {
    filter.invoiceDate = {};
    if (startDate) filter.invoiceDate.$gte = new Date(startDate as string);
    if (endDate) filter.invoiceDate.$lte = new Date(endDate as string);
  }

  // Overdue filtering
  if (overdue === 'true') {
    filter.dueDate = { $lt: new Date() };
    filter.status = { $nin: [InvoiceStatus.PAID, InvoiceStatus.CANCELLED, InvoiceStatus.REFUNDED] };
  }

  // Search filtering
  if (search) {
    filter.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } },
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

  const [invoices, total] = await Promise.all([
    Invoice.find(filter)
      .populate('clientId', 'name nameAr email phone company')
      .populate('caseId', 'title caseNumber')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Invoice.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: invoices,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Invoices retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/invoices/dashboard
 * @desc Get invoice dashboard data
 * @access Private
 */
router.get('/dashboard', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const filter = { lawFirmId: user.lawFirmId };

  const [
    totalInvoices,
    paidInvoices,
    overdueInvoices,
    totalRevenue,
    outstandingAmount,
    recentInvoices,
    invoicesByStatus,
    monthlyRevenue
  ] = await Promise.all([
    Invoice.countDocuments(filter),
    Invoice.countDocuments({ ...filter, status: InvoiceStatus.PAID }),
    Invoice.countDocuments({ 
      ...filter, 
      dueDate: { $lt: new Date() },
      status: { $nin: [InvoiceStatus.PAID, InvoiceStatus.CANCELLED, InvoiceStatus.REFUNDED] }
    }),
    Invoice.aggregate([
      { $match: { ...filter, status: InvoiceStatus.PAID } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Invoice.aggregate([
      { $match: { ...filter, status: { $nin: [InvoiceStatus.PAID, InvoiceStatus.CANCELLED, InvoiceStatus.REFUNDED] } } },
      { $group: { _id: null, total: { $sum: '$balanceAmount' } } }
    ]),
    Invoice.find(filter)
      .populate('clientId', 'name nameAr')
      .sort({ createdAt: -1 })
      .limit(5),
    Invoice.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } }
    ]),
    Invoice.aggregate([
      { 
        $match: { 
          ...filter, 
          invoiceDate: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) } // Last 12 months
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$invoiceDate' },
            month: { $month: '$invoiceDate' }
          },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
  ]);

  res.json({
    success: true,
    data: {
      statistics: {
        totalInvoices,
        paidInvoices,
        overdueInvoices,
        totalRevenue: totalRevenue[0]?.total || 0,
        outstandingAmount: outstandingAmount[0]?.total || 0,
        averageInvoiceValue: totalInvoices > 0 ? (totalRevenue[0]?.total || 0) / totalInvoices : 0,
      },
      charts: {
        invoicesByStatus: invoicesByStatus.reduce((acc, item) => {
          acc[item._id] = { count: item.count, amount: item.amount };
          return acc;
        }, {} as Record<string, { count: number; amount: number }>),
        monthlyRevenue: monthlyRevenue.map(item => ({
          period: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
          revenue: item.revenue,
          count: item.count
        })),
      },
      recentInvoices,
    },
    message: 'Invoice dashboard data retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/invoices/:id
 * @desc Get a specific invoice
 * @access Private
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const invoiceId = req.params.id;

  if (!Types.ObjectId.isValid(invoiceId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid invoice ID format',
    });
  }

  const invoice = await Invoice.findOne({
    _id: invoiceId,
    lawFirmId: user.lawFirmId
  })
    .populate('clientId', 'name nameAr email phone address company nationalId commercialRegister')
    .populate('caseId', 'title caseNumber description')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .populate('approvedBy', 'name email');

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Invoice not found',
    });
  }

  res.json({
    success: true,
    data: invoice,
    message: 'Invoice retrieved successfully',
  });
}));

/**
 * @route POST /api/v1/invoices
 * @desc Create a new invoice
 * @access Private
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const {
    clientId,
    caseId,
    title,
    titleAr,
    description,
    descriptionAr,
    invoiceType,
    items,
    dueDate,
    taxRate,
    discountRate,
    discountAmount,
    currency,
    paymentTerms,
    notes,
    notesAr,
    internalNotes,
    requiresApproval,
    recurring,
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
  if (caseId) {
    const caseData = await Case.findOne({
      _id: caseId,
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

  // Generate invoice number
  const invoiceNumber = await (Invoice as any).generateInvoiceNumber(user.lawFirmId);

  const newInvoice = new Invoice({
    invoiceNumber,
    invoiceDate: new Date(),
    dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    clientId,
    caseId,
    title,
    titleAr,
    description,
    descriptionAr,
    invoiceType: invoiceType || InvoiceType.STANDARD,
    items: validatedItems,
    taxRate: taxRate !== undefined ? taxRate : 15, // Default 15% VAT
    discountRate,
    discountAmount,
    currency: currency || 'SAR',
    paymentTerms: paymentTerms || 'Net 30',
    notes,
    notesAr,
    internalNotes,
    lawFirmId: user.lawFirmId,
    requiresApproval: requiresApproval || false,
    recurring,
    createdBy: user._id,
  });

  const savedInvoice = await newInvoice.save();

  // Populate the response
  const populatedInvoice = await Invoice.findById(savedInvoice._id)
    .populate('clientId', 'name nameAr email phone')
    .populate('caseId', 'title caseNumber')
    .populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    data: populatedInvoice,
    message: 'Invoice created successfully',
  });
}));

/**
 * @route PUT /api/v1/invoices/:id
 * @desc Update an invoice
 * @access Private
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const invoiceId = req.params.id;

  if (!Types.ObjectId.isValid(invoiceId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid invoice ID format',
    });
  }

  const invoice = await Invoice.findOne({
    _id: invoiceId,
    lawFirmId: user.lawFirmId
  });

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Invoice not found',
    });
  }

  // Prevent editing paid or cancelled invoices
  if (invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.CANCELLED) {
    return res.status(400).json({
      success: false,
      message: 'Cannot edit paid or cancelled invoices',
    });
  }

  // Update allowed fields
  const allowedFields = [
    'title', 'titleAr', 'description', 'descriptionAr', 'invoiceType',
    'items', 'dueDate', 'taxRate', 'discountRate', 'discountAmount',
    'currency', 'paymentTerms', 'notes', 'notesAr', 'internalNotes',
    'requiresApproval', 'recurring'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      if (field === 'items' && Array.isArray(req.body[field])) {
        // Recalculate item amounts
        invoice[field] = req.body[field].map((item: any) => ({
          ...item,
          amount: item.quantity * item.rate,
          taxable: item.taxable !== false,
        }));
      } else {
        invoice[field] = req.body[field];
      }
    }
  });

  invoice.updatedBy = user._id;

  const updatedInvoice = await invoice.save();

  // Populate the response
  const populatedInvoice = await Invoice.findById(updatedInvoice._id)
    .populate('clientId', 'name nameAr email phone')
    .populate('caseId', 'title caseNumber');

  res.json({
    success: true,
    data: populatedInvoice,
    message: 'Invoice updated successfully',
  });
}));

/**
 * @route DELETE /api/v1/invoices/:id
 * @desc Delete/Cancel an invoice
 * @access Private
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const invoiceId = req.params.id;

  if (!Types.ObjectId.isValid(invoiceId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid invoice ID format',
    });
  }

  const invoice = await Invoice.findOne({
    _id: invoiceId,
    lawFirmId: user.lawFirmId
  });

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Invoice not found',
    });
  }

  // Prevent deleting paid invoices
  if (invoice.status === InvoiceStatus.PAID) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete paid invoices. Consider cancelling instead.',
    });
  }

  // Cancel instead of delete for sent invoices
  if (invoice.status !== InvoiceStatus.DRAFT) {
    invoice.status = InvoiceStatus.CANCELLED;
    await invoice.save();

    res.json({
      success: true,
      message: 'Invoice cancelled successfully',
    });
  } else {
    // Delete draft invoices
    await Invoice.findByIdAndDelete(invoiceId);

    res.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  }
}));

/**
 * @route POST /api/v1/invoices/:id/send
 * @desc Send an invoice to client
 * @access Private
 */
router.post('/:id/send', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const invoiceId = req.params.id;

  const invoice = await Invoice.findOne({
    _id: invoiceId,
    lawFirmId: user.lawFirmId
  }).populate('clientId', 'name email');

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Invoice not found',
    });
  }

  // Update status to sent
  invoice.status = InvoiceStatus.SENT;
  invoice.sentDate = new Date();
  await invoice.save();

  // TODO: Implement actual email sending logic here
  // This could integrate with email services like SendGrid, AWS SES, etc.

  res.json({
    success: true,
    message: 'Invoice sent successfully',
    data: {
      invoiceNumber: invoice.invoiceNumber,
      clientEmail: invoice.clientId.email,
      sentDate: invoice.sentDate,
    },
  });
}));

/**
 * @route POST /api/v1/invoices/:id/payment
 * @desc Record a payment for an invoice
 * @access Private
 */
router.post('/:id/payment', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const invoiceId = req.params.id;
  const { amount, paymentMethod, paymentDate, paymentReference, notes } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Payment amount must be greater than 0',
    });
  }

  const invoice = await Invoice.findOne({
    _id: invoiceId,
    lawFirmId: user.lawFirmId
  });

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Invoice not found',
    });
  }

  // Validate payment amount
  const maxPayment = invoice.totalAmount - invoice.paidAmount;
  if (amount > maxPayment) {
    return res.status(400).json({
      success: false,
      message: `Payment amount cannot exceed outstanding balance of ${maxPayment}`,
    });
  }

  // Update payment information
  invoice.paidAmount += amount;
  invoice.paymentMethod = paymentMethod;
  invoice.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
  invoice.paymentReference = paymentReference;
  if (notes) {
    invoice.internalNotes = `${invoice.internalNotes || ''}\nPayment recorded: ${amount} ${invoice.currency} on ${invoice.paymentDate}. ${notes}`.trim();
  }

  await invoice.save();

  res.json({
    success: true,
    data: {
      invoiceNumber: invoice.invoiceNumber,
      paidAmount: invoice.paidAmount,
      balanceAmount: invoice.balanceAmount,
      status: invoice.status,
    },
    message: 'Payment recorded successfully',
  });
}));

/**
 * @route GET /api/v1/invoices/:id/pdf
 * @desc Generate PDF for an invoice
 * @access Private
 */
router.get('/:id/pdf', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const invoiceId = req.params.id;

  const invoice = await Invoice.findOne({
    _id: invoiceId,
    lawFirmId: user.lawFirmId
  })
    .populate('clientId', 'name nameAr email phone address company')
    .populate('caseId', 'title caseNumber')
    .populate('lawFirmId', 'name address phone email');

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Invoice not found',
    });
  }

  // TODO: Implement PDF generation logic here
  // This could use libraries like PDFKit, jsPDF, or Puppeteer

  res.json({
    success: true,
    data: {
      invoiceNumber: invoice.invoiceNumber,
      pdfUrl: `/api/v1/invoices/${invoiceId}/pdf/download`, // Placeholder URL
    },
    message: 'PDF generated successfully',
  });
}));

/**
 * @route POST /api/v1/invoices/from-tasks
 * @desc Create invoice from time entries/tasks
 * @access Private
 */
router.post('/from-tasks', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { clientId, caseId, taskIds, title, dueDate, hourlyRate } = req.body;

  if (!clientId || !taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Client ID and task IDs are required',
    });
  }

  // Get tasks with time entries
  const tasks = await Task.find({
    _id: { $in: taskIds },
    lawFirmId: user.lawFirmId,
    'timeEntries.billable': true,
  }).populate('timeEntries.user', 'name');

  if (tasks.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No billable tasks found',
    });
  }

  // Create invoice items from tasks
  const items = [];
  for (const task of tasks) {
    const totalMinutes = task.timeEntries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + (entry.duration || 0), 0);
    
    const hours = totalMinutes / 60;
    if (hours > 0) {
      items.push({
        description: `${task.title} - Legal Services`,
        descriptionAr: task.titleAr ? `${task.titleAr} - خدمات قانونية` : undefined,
        quantity: Math.round(hours * 100) / 100, // Round to 2 decimal places
        rate: hourlyRate || 500, // Default rate
        amount: (hours * (hourlyRate || 500)),
        taxable: true,
        taskId: task._id,
      });
    }
  }

  if (items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No billable hours found in selected tasks',
    });
  }

  // Generate invoice number
  const invoiceNumber = await (Invoice as any).generateInvoiceNumber(user.lawFirmId);

  const newInvoice = new Invoice({
    invoiceNumber,
    invoiceDate: new Date(),
    dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    clientId,
    caseId,
    title: title || 'Legal Services Invoice',
    invoiceType: InvoiceType.HOURLY,
    items,
    taxRate: 15,
    currency: 'SAR',
    paymentTerms: 'Net 30',
    lawFirmId: user.lawFirmId,
    createdBy: user._id,
  });

  const savedInvoice = await newInvoice.save();

  // Populate the response
  const populatedInvoice = await Invoice.findById(savedInvoice._id)
    .populate('clientId', 'name nameAr email phone')
    .populate('caseId', 'title caseNumber');

  res.status(201).json({
    success: true,
    data: populatedInvoice,
    message: 'Invoice created from tasks successfully',
  });
}));

export { router as invoiceRoutes };

