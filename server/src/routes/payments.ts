import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { protect } from '../middleware/auth';
import { Payment, PaymentType, PaymentStatus, PaymentMethod } from '../models/Payment';
import { Invoice } from '../models/Invoice';
import { Client } from '../models/Client';
import { Case } from '../models/Case';
import { Expense } from '../models/Expense';
import { Types } from 'mongoose';

const router = Router();

// Apply authentication to all payment routes
router.use(protect);

/**
 * @route GET /api/v1/payments
 * @desc Get all payments for the user's law firm
 * @access Private
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    paymentType,
    paymentMethod,
    clientId,
    invoiceId,
    caseId,
    startDate,
    endDate,
    reconciled,
    search,
    sortBy = 'paymentDate',
    sortOrder = 'desc'
  } = req.query;
  const user = req.user;

  // Build filter query
  const filter: any = { lawFirmId: user.lawFirmId };

  if (status) filter.status = status;
  if (paymentType) filter.paymentType = paymentType;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (clientId) filter.clientId = clientId;
  if (invoiceId) filter.invoiceId = invoiceId;
  if (caseId) filter.caseId = caseId;
  if (reconciled !== undefined) filter.reconciled = reconciled === 'true';

  // Date filtering
  if (startDate || endDate) {
    filter.paymentDate = {};
    if (startDate) filter.paymentDate.$gte = new Date(startDate as string);
    if (endDate) filter.paymentDate.$lte = new Date(endDate as string);
  }

  // Search filtering
  if (search) {
    filter.$or = [
      { paymentNumber: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { descriptionAr: { $regex: search, $options: 'i' } },
      { payerName: { $regex: search, $options: 'i' } },
      { payerEmail: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build sort object
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate('clientId', 'name nameAr email phone company')
      .populate('invoiceId', 'invoiceNumber totalAmount status')
      .populate('caseId', 'title caseNumber')
      .populate('expenseId', 'expenseNumber title amount')
      .populate('processedBy', 'name email')
      .populate('reconciledBy', 'name email')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Payment.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: payments,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Payments retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/payments/dashboard
 * @desc Get payment dashboard data
 * @access Private
 */
router.get('/dashboard', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const filter = { lawFirmId: user.lawFirmId };

  const [
    totalPayments,
    completedPayments,
    pendingPayments,
    totalAmount,
    completedAmount,
    unreconciledCount,
    recentPayments,
    paymentsByStatus,
    paymentsByMethod,
    monthlyPayments
  ] = await Promise.all([
    Payment.countDocuments(filter),
    Payment.countDocuments({ ...filter, status: PaymentStatus.COMPLETED }),
    Payment.countDocuments({ ...filter, status: PaymentStatus.PENDING }),
    Payment.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$baseAmount' } } }
    ]),
    Payment.aggregate([
      { $match: { ...filter, status: PaymentStatus.COMPLETED } },
      { $group: { _id: null, total: { $sum: '$baseAmount' } } }
    ]),
    Payment.countDocuments({ ...filter, reconciled: false, status: PaymentStatus.COMPLETED }),
    Payment.find(filter)
      .populate('clientId', 'name nameAr')
      .populate('invoiceId', 'invoiceNumber')
      .sort({ createdAt: -1 })
      .limit(5),
    Payment.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$baseAmount' } } }
    ]),
    Payment.aggregate([
      { $match: filter },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, amount: { $sum: '$baseAmount' } } }
    ]),
    Payment.aggregate([
      { 
        $match: { 
          ...filter, 
          paymentDate: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) } // Last 12 months
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' }
          },
          payments: { $sum: 1 },
          amount: { $sum: '$baseAmount' },
          completed: {
            $sum: {
              $cond: [
                { $eq: ['$status', PaymentStatus.COMPLETED] },
                '$baseAmount',
                0
              ]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
  ]);

  res.json({
    success: true,
    data: {
      statistics: {
        totalPayments,
        completedPayments,
        pendingPayments,
        totalAmount: totalAmount[0]?.total || 0,
        completedAmount: completedAmount[0]?.total || 0,
        unreconciledCount,
        averagePayment: totalPayments > 0 ? (totalAmount[0]?.total || 0) / totalPayments : 0,
      },
      charts: {
        paymentsByStatus: paymentsByStatus.reduce((acc, item) => {
          acc[item._id] = { count: item.count, amount: item.amount };
          return acc;
        }, {} as Record<string, { count: number; amount: number }>),
        paymentsByMethod: paymentsByMethod.reduce((acc, item) => {
          acc[item._id] = { count: item.count, amount: item.amount };
          return acc;
        }, {} as Record<string, { count: number; amount: number }>),
        monthlyPayments: monthlyPayments.map(item => ({
          period: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
          payments: item.payments,
          amount: item.amount,
          completed: item.completed,
          pending: item.amount - item.completed
        })),
      },
      recentPayments,
    },
    message: 'Payment dashboard data retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/payments/:id
 * @desc Get a specific payment
 * @access Private
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const paymentId = req.params.id;

  if (!Types.ObjectId.isValid(paymentId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment ID format',
    });
  }

  const payment = await Payment.findOne({
    _id: paymentId,
    lawFirmId: user.lawFirmId
  })
    .populate('clientId', 'name nameAr email phone address company')
    .populate('invoiceId', 'invoiceNumber totalAmount status dueDate')
    .populate('caseId', 'title caseNumber description')
    .populate('expenseId', 'expenseNumber title amount category')
    .populate('processedBy', 'name email')
    .populate('reconciledBy', 'name email')
    .populate('refundedBy', 'name email')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }

  res.json({
    success: true,
    data: payment,
    message: 'Payment retrieved successfully',
  });
}));

/**
 * @route POST /api/v1/payments
 * @desc Create a new payment
 * @access Private
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const {
    paymentType,
    amount,
    currency,
    exchangeRate,
    paymentMethod,
    paymentMethodDetails,
    clientId,
    invoiceId,
    caseId,
    expenseId,
    payerName,
    payerEmail,
    payerPhone,
    payerAddress,
    description,
    descriptionAr,
    notes,
    notesAr,
    internalNotes,
    attachments,
    paymentDate,
    processingFee,
    gatewayProvider,
    gatewayTransactionId,
    isPartialPayment,
  } = req.body;

  // Validate required fields
  if (!paymentType || !amount || !paymentMethod || !clientId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: paymentType, amount, paymentMethod, clientId',
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

  // Validate related entities
  if (invoiceId) {
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      lawFirmId: user.lawFirmId,
      clientId
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found or does not belong to your law firm and client',
      });
    }
  }

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

  if (expenseId) {
    const expense = await Expense.findOne({
      _id: expenseId,
      lawFirmId: user.lawFirmId
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found or does not belong to your law firm',
      });
    }
  }

  // Generate payment number
  const paymentNumber = await (Payment as any).generatePaymentNumber(user.lawFirmId);

  const newPayment = new Payment({
    paymentNumber,
    paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
    paymentType,
    amount,
    currency: currency || 'SAR',
    exchangeRate,
    paymentMethod,
    paymentMethodDetails,
    clientId,
    invoiceId,
    caseId,
    expenseId,
    payerName: payerName || client.name,
    payerEmail: payerEmail || client.email,
    payerPhone: payerPhone || client.phone,
    payerAddress,
    description,
    descriptionAr,
    notes,
    notesAr,
    internalNotes,
    attachments: attachments || [],
    processingFee,
    gatewayProvider,
    gatewayTransactionId,
    isPartialPayment: isPartialPayment || false,
    lawFirmId: user.lawFirmId,
    createdBy: user._id,
  });

  const savedPayment = await newPayment.save();

  // Update related invoice if payment is for invoice
  if (invoiceId && savedPayment.status === PaymentStatus.COMPLETED) {
    const invoice = await Invoice.findById(invoiceId);
    if (invoice) {
      invoice.paidAmount += savedPayment.baseAmount || savedPayment.amount;
      await invoice.save();
    }
  }

  // Populate the response
  const populatedPayment = await Payment.findById(savedPayment._id)
    .populate('clientId', 'name nameAr email phone')
    .populate('invoiceId', 'invoiceNumber totalAmount')
    .populate('caseId', 'title caseNumber')
    .populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    data: populatedPayment,
    message: 'Payment created successfully',
  });
}));

/**
 * @route PUT /api/v1/payments/:id
 * @desc Update a payment
 * @access Private
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const paymentId = req.params.id;

  if (!Types.ObjectId.isValid(paymentId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment ID format',
    });
  }

  const payment = await Payment.findOne({
    _id: paymentId,
    lawFirmId: user.lawFirmId
  });

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }

  // Prevent editing completed or refunded payments
  if (payment.status === PaymentStatus.COMPLETED || payment.status === PaymentStatus.REFUNDED) {
    return res.status(400).json({
      success: false,
      message: 'Cannot edit completed or refunded payments',
    });
  }

  // Update allowed fields
  const allowedFields = [
    'paymentType', 'amount', 'currency', 'exchangeRate', 'paymentMethod',
    'paymentMethodDetails', 'payerName', 'payerEmail', 'payerPhone', 'payerAddress',
    'description', 'descriptionAr', 'notes', 'notesAr', 'internalNotes',
    'attachments', 'paymentDate', 'processingFee', 'gatewayProvider',
    'gatewayTransactionId', 'status'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      payment[field] = req.body[field];
    }
  });

  payment.updatedBy = user._id;

  const updatedPayment = await payment.save();

  // Populate the response
  const populatedPayment = await Payment.findById(updatedPayment._id)
    .populate('clientId', 'name nameAr email phone')
    .populate('invoiceId', 'invoiceNumber totalAmount')
    .populate('caseId', 'title caseNumber');

  res.json({
    success: true,
    data: populatedPayment,
    message: 'Payment updated successfully',
  });
}));

/**
 * @route DELETE /api/v1/payments/:id
 * @desc Delete/Cancel a payment
 * @access Private
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const paymentId = req.params.id;

  if (!Types.ObjectId.isValid(paymentId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment ID format',
    });
  }

  const payment = await Payment.findOne({
    _id: paymentId,
    lawFirmId: user.lawFirmId
  });

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }

  // Prevent deleting completed payments
  if (payment.status === PaymentStatus.COMPLETED) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete completed payments. Consider refunding instead.',
    });
  }

  // Cancel instead of delete for processing payments
  if (payment.status === PaymentStatus.PROCESSING) {
    payment.status = PaymentStatus.CANCELLED;
    await payment.save();

    res.json({
      success: true,
      message: 'Payment cancelled successfully',
    });
  } else {
    // Delete pending payments
    await Payment.findByIdAndDelete(paymentId);

    res.json({
      success: true,
      message: 'Payment deleted successfully',
    });
  }
}));

/**
 * @route POST /api/v1/payments/:id/process
 * @desc Process a pending payment
 * @access Private
 */
router.post('/:id/process', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const paymentId = req.params.id;
  const { gatewayResponse, processingFee } = req.body;

  const payment = await Payment.findOne({
    _id: paymentId,
    lawFirmId: user.lawFirmId
  });

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }

  if (payment.status !== PaymentStatus.PENDING) {
    return res.status(400).json({
      success: false,
      message: 'Only pending payments can be processed',
    });
  }

  // Update payment status and processing info
  payment.status = PaymentStatus.COMPLETED;
  payment.processedBy = user._id;
  payment.processedAt = new Date();
  payment.gatewayResponse = gatewayResponse;
  if (processingFee !== undefined) {
    payment.processingFee = processingFee;
  }

  await payment.save();

  // Update related invoice if applicable
  if (payment.invoiceId) {
    const invoice = await Invoice.findById(payment.invoiceId);
    if (invoice) {
      invoice.paidAmount += payment.baseAmount || payment.amount;
      await invoice.save();
    }
  }

  res.json({
    success: true,
    message: 'Payment processed successfully',
    data: {
      paymentNumber: payment.paymentNumber,
      status: payment.status,
      processedAt: payment.processedAt,
      netAmount: payment.netAmount,
    },
  });
}));

/**
 * @route POST /api/v1/payments/:id/reconcile
 * @desc Reconcile a payment with bank statement
 * @access Private
 */
router.post('/:id/reconcile', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const paymentId = req.params.id;
  const { bankStatementReference, notes } = req.body;

  const payment = await Payment.findOne({
    _id: paymentId,
    lawFirmId: user.lawFirmId
  });

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }

  if (payment.status !== PaymentStatus.COMPLETED) {
    return res.status(400).json({
      success: false,
      message: 'Only completed payments can be reconciled',
    });
  }

  // Update reconciliation info
  payment.reconciled = true;
  payment.reconciledBy = user._id;
  payment.reconciledAt = new Date();
  payment.bankStatementReference = bankStatementReference;
  if (notes) {
    payment.internalNotes = `${payment.internalNotes || ''}\nReconciliation notes: ${notes}`.trim();
  }

  await payment.save();

  res.json({
    success: true,
    message: 'Payment reconciled successfully',
    data: {
      paymentNumber: payment.paymentNumber,
      reconciled: payment.reconciled,
      reconciledAt: payment.reconciledAt,
    },
  });
}));

/**
 * @route POST /api/v1/payments/:id/refund
 * @desc Refund a payment
 * @access Private
 */
router.post('/:id/refund', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const paymentId = req.params.id;
  const { refundAmount, refundReason, refundReference } = req.body;

  if (!refundReason) {
    return res.status(400).json({
      success: false,
      message: 'Refund reason is required',
    });
  }

  const payment = await Payment.findOne({
    _id: paymentId,
    lawFirmId: user.lawFirmId
  });

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }

  if (payment.status !== PaymentStatus.COMPLETED) {
    return res.status(400).json({
      success: false,
      message: 'Only completed payments can be refunded',
    });
  }

  const refundAmountToProcess = refundAmount || payment.amount;
  const alreadyRefunded = payment.refundedAmount || 0;
  
  if (alreadyRefunded + refundAmountToProcess > payment.amount) {
    return res.status(400).json({
      success: false,
      message: 'Refund amount exceeds available refund balance',
    });
  }

  // Update refund info
  payment.refundedAmount = alreadyRefunded + refundAmountToProcess;
  payment.refundedAt = new Date();
  payment.refundedBy = user._id;
  payment.refundReason = refundReason;
  payment.refundReference = refundReference;

  // Update status if fully refunded
  if (payment.refundedAmount >= payment.amount) {
    payment.status = PaymentStatus.REFUNDED;
  }

  await payment.save();

  // Update related invoice if applicable
  if (payment.invoiceId) {
    const invoice = await Invoice.findById(payment.invoiceId);
    if (invoice) {
      invoice.paidAmount -= refundAmountToProcess;
      await invoice.save();
    }
  }

  res.json({
    success: true,
    message: 'Payment refunded successfully',
    data: {
      paymentNumber: payment.paymentNumber,
      refundedAmount: payment.refundedAmount,
      refundedAt: payment.refundedAt,
      status: payment.status,
    },
  });
}));

/**
 * @route GET /api/v1/payments/reconciliation/unreconciled
 * @desc Get unreconciled payments
 * @access Private
 */
router.get('/reconciliation/unreconciled', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  const unreconciledPayments = await Payment.find({
    lawFirmId: user.lawFirmId,
    status: PaymentStatus.COMPLETED,
    reconciled: false,
  })
    .populate('clientId', 'name nameAr')
    .populate('invoiceId', 'invoiceNumber')
    .sort({ paymentDate: -1 });

  res.json({
    success: true,
    data: unreconciledPayments,
    message: 'Unreconciled payments retrieved successfully',
  });
}));

export { router as paymentRoutes };
