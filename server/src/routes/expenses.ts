import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { protect } from '../middleware/auth';
import { Expense, ExpenseStatus, ExpenseCategory, PaymentMethod } from '../models/Expense';
import { User } from '../models/User';
import { Client } from '../models/Client';
import { Case } from '../models/Case';
import { Types } from 'mongoose';

const router = Router();

// Apply authentication to all expense routes
router.use(protect);

/**
 * @route GET /api/v1/expenses
 * @desc Get all expenses for the user's law firm
 * @access Private
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    category,
    paidBy,
    caseId,
    clientId,
    startDate,
    endDate,
    billable,
    search,
    view = 'all', // all, my, pending_approval, reimbursable
    sortBy = 'expenseDate',
    sortOrder = 'desc'
  } = req.query;
  const user = req.user;

  // Build filter query
  const filter: any = { lawFirmId: user.lawFirmId };

  // View-specific filtering
  switch (view) {
    case 'my':
      filter.paidBy = user._id;
      break;
    case 'pending_approval':
      filter.status = { $in: [ExpenseStatus.SUBMITTED, ExpenseStatus.UNDER_REVIEW] };
      break;
    case 'reimbursable':
      filter.status = ExpenseStatus.APPROVED;
      filter.reimbursementDate = { $exists: false };
      break;
  }

  if (status) filter.status = status;
  if (category) filter.category = category;
  if (paidBy) filter.paidBy = paidBy;
  if (caseId) filter.caseId = caseId;
  if (clientId) filter.clientId = clientId;
  if (billable !== undefined) filter.billable = billable === 'true';

  // Date filtering
  if (startDate || endDate) {
    filter.expenseDate = {};
    if (startDate) filter.expenseDate.$gte = new Date(startDate as string);
    if (endDate) filter.expenseDate.$lte = new Date(endDate as string);
  }

  // Search filtering
  if (search) {
    filter.$or = [
      { expenseNumber: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { titleAr: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'vendor.name': { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build sort object
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  const [expenses, total] = await Promise.all([
    Expense.find(filter)
      .populate('paidBy', 'name email')
      .populate('reimburseTo', 'name email')
      .populate('submittedBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('caseId', 'title caseNumber')
      .populate('clientId', 'name nameAr')
      .populate('invoiceId', 'invoiceNumber')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Expense.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: expenses,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Expenses retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/expenses/dashboard
 * @desc Get expense dashboard data
 * @access Private
 */
router.get('/dashboard', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const filter = { lawFirmId: user.lawFirmId };

  const [
    totalExpenses,
    pendingApproval,
    approvedExpenses,
    totalAmount,
    reimbursableAmount,
    recentExpenses,
    expensesByCategory,
    expensesByStatus,
    monthlyExpenses
  ] = await Promise.all([
    Expense.countDocuments(filter),
    Expense.countDocuments({ 
      ...filter, 
      status: { $in: [ExpenseStatus.SUBMITTED, ExpenseStatus.UNDER_REVIEW] }
    }),
    Expense.countDocuments({ ...filter, status: ExpenseStatus.APPROVED }),
    Expense.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$baseAmount' } } }
    ]),
    Expense.aggregate([
      { 
        $match: { 
          ...filter, 
          status: ExpenseStatus.APPROVED,
          reimbursementDate: { $exists: false }
        }
      },
      { $group: { _id: null, total: { $sum: '$reimbursementAmount' } } }
    ]),
    Expense.find(filter)
      .populate('paidBy', 'name')
      .populate('caseId', 'title')
      .sort({ createdAt: -1 })
      .limit(5),
    Expense.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 }, amount: { $sum: '$baseAmount' } } }
    ]),
    Expense.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$baseAmount' } } }
    ]),
    Expense.aggregate([
      { 
        $match: { 
          ...filter, 
          expenseDate: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) } // Last 12 months
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$expenseDate' },
            month: { $month: '$expenseDate' }
          },
          expenses: { $sum: 1 },
          amount: { $sum: '$baseAmount' },
          billable: {
            $sum: {
              $cond: ['$billable', '$baseAmount', 0]
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
        totalExpenses,
        pendingApproval,
        approvedExpenses,
        totalAmount: totalAmount[0]?.total || 0,
        reimbursableAmount: reimbursableAmount[0]?.total || 0,
        averageExpense: totalExpenses > 0 ? (totalAmount[0]?.total || 0) / totalExpenses : 0,
      },
      charts: {
        expensesByCategory: expensesByCategory.reduce((acc, item) => {
          acc[item._id] = { count: item.count, amount: item.amount };
          return acc;
        }, {} as Record<string, { count: number; amount: number }>),
        expensesByStatus: expensesByStatus.reduce((acc, item) => {
          acc[item._id] = { count: item.count, amount: item.amount };
          return acc;
        }, {} as Record<string, { count: number; amount: number }>),
        monthlyExpenses: monthlyExpenses.map(item => ({
          period: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
          expenses: item.expenses,
          amount: item.amount,
          billable: item.billable,
          nonBillable: item.amount - item.billable
        })),
      },
      recentExpenses,
    },
    message: 'Expense dashboard data retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/expenses/:id
 * @desc Get a specific expense
 * @access Private
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const expenseId = req.params.id;

  if (!Types.ObjectId.isValid(expenseId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid expense ID format',
    });
  }

  const expense = await Expense.findOne({
    _id: expenseId,
    lawFirmId: user.lawFirmId
  })
    .populate('paidBy', 'name email phone')
    .populate('reimburseTo', 'name email phone')
    .populate('submittedBy', 'name email')
    .populate('reviewedBy', 'name email')
    .populate('approvedBy', 'name email')
    .populate('rejectedBy', 'name email')
    .populate('caseId', 'title caseNumber description')
    .populate('clientId', 'name nameAr email phone')
    .populate('invoiceId', 'invoiceNumber totalAmount status')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found',
    });
  }

  res.json({
    success: true,
    data: expense,
    message: 'Expense retrieved successfully',
  });
}));

/**
 * @route POST /api/v1/expenses
 * @desc Create a new expense
 * @access Private
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const {
    title,
    titleAr,
    description,
    descriptionAr,
    category,
    subcategory,
    amount,
    currency,
    exchangeRate,
    taxAmount,
    taxRate,
    isTaxDeductible,
    paymentMethod,
    paidBy,
    reimburseTo,
    caseId,
    clientId,
    vendor,
    receiptNumber,
    receiptDate,
    attachments,
    billable,
    markupPercentage,
    notes,
    notesAr,
    internalNotes,
    isPersonal,
    requiresReceipt,
    expenseDate,
  } = req.body;

  // Validate required fields
  if (!title || !category || !amount || !paymentMethod) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: title, category, amount, paymentMethod',
    });
  }

  // Validate paid by user
  let paidByUser = user._id;
  if (paidBy && paidBy !== user._id.toString()) {
    const userExists = await User.findOne({
      _id: paidBy,
      lawFirmId: user.lawFirmId,
    });

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'Paid by user not found or does not belong to your law firm',
      });
    }
    paidByUser = paidBy;
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

  // Validate client if provided
  if (clientId) {
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
  }

  // Generate expense number
  const expenseNumber = await (Expense as any).generateExpenseNumber(user.lawFirmId);

  const newExpense = new Expense({
    expenseNumber,
    expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
    title,
    titleAr,
    description,
    descriptionAr,
    category,
    subcategory,
    amount,
    currency: currency || 'SAR',
    exchangeRate,
    taxAmount,
    taxRate,
    isTaxDeductible: isTaxDeductible !== false,
    paymentMethod,
    paidBy: paidByUser,
    reimburseTo: reimburseTo || paidByUser,
    caseId,
    clientId,
    vendor,
    receiptNumber,
    receiptDate: receiptDate ? new Date(receiptDate) : undefined,
    attachments: attachments || [],
    billable: billable || false,
    markupPercentage,
    notes,
    notesAr,
    internalNotes,
    isPersonal: isPersonal || false,
    requiresReceipt: requiresReceipt !== false,
    lawFirmId: user.lawFirmId,
    submittedBy: user._id,
    createdBy: user._id,
  });

  const savedExpense = await newExpense.save();

  // Populate the response
  const populatedExpense = await Expense.findById(savedExpense._id)
    .populate('paidBy', 'name email')
    .populate('reimburseTo', 'name email')
    .populate('submittedBy', 'name email')
    .populate('caseId', 'title caseNumber')
    .populate('clientId', 'name nameAr');

  res.status(201).json({
    success: true,
    data: populatedExpense,
    message: 'Expense created successfully',
  });
}));

/**
 * @route PUT /api/v1/expenses/:id
 * @desc Update an expense
 * @access Private
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const expenseId = req.params.id;

  if (!Types.ObjectId.isValid(expenseId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid expense ID format',
    });
  }

  const expense = await Expense.findOne({
    _id: expenseId,
    lawFirmId: user.lawFirmId
  });

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found',
    });
  }

  // Prevent editing approved or reimbursed expenses
  if (expense.status === ExpenseStatus.APPROVED || expense.status === ExpenseStatus.REIMBURSED) {
    return res.status(400).json({
      success: false,
      message: 'Cannot edit approved or reimbursed expenses',
    });
  }

  // Update allowed fields
  const allowedFields = [
    'title', 'titleAr', 'description', 'descriptionAr', 'category', 'subcategory',
    'amount', 'currency', 'exchangeRate', 'taxAmount', 'taxRate', 'isTaxDeductible',
    'paymentMethod', 'paidBy', 'reimburseTo', 'caseId', 'clientId', 'vendor',
    'receiptNumber', 'receiptDate', 'attachments', 'billable', 'markupPercentage',
    'notes', 'notesAr', 'internalNotes', 'isPersonal', 'requiresReceipt', 'expenseDate'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      expense[field] = req.body[field];
    }
  });

  expense.updatedBy = user._id;

  const updatedExpense = await expense.save();

  // Populate the response
  const populatedExpense = await Expense.findById(updatedExpense._id)
    .populate('paidBy', 'name email')
    .populate('reimburseTo', 'name email')
    .populate('caseId', 'title caseNumber')
    .populate('clientId', 'name nameAr');

  res.json({
    success: true,
    data: populatedExpense,
    message: 'Expense updated successfully',
  });
}));

/**
 * @route DELETE /api/v1/expenses/:id
 * @desc Delete/Cancel an expense
 * @access Private
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const expenseId = req.params.id;

  if (!Types.ObjectId.isValid(expenseId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid expense ID format',
    });
  }

  const expense = await Expense.findOne({
    _id: expenseId,
    lawFirmId: user.lawFirmId
  });

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found',
    });
  }

  // Prevent deleting approved or reimbursed expenses
  if (expense.status === ExpenseStatus.APPROVED || expense.status === ExpenseStatus.REIMBURSED) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete approved or reimbursed expenses. Consider cancelling instead.',
    });
  }

  // Cancel instead of delete for submitted expenses
  if (expense.status !== ExpenseStatus.DRAFT) {
    expense.status = ExpenseStatus.CANCELLED;
    await expense.save();

    res.json({
      success: true,
      message: 'Expense cancelled successfully',
    });
  } else {
    // Delete draft expenses
    await Expense.findByIdAndDelete(expenseId);

    res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  }
}));

/**
 * @route POST /api/v1/expenses/:id/submit
 * @desc Submit expense for approval
 * @access Private
 */
router.post('/:id/submit', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const expenseId = req.params.id;

  const expense = await Expense.findOne({
    _id: expenseId,
    lawFirmId: user.lawFirmId
  });

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found',
    });
  }

  if (expense.status !== ExpenseStatus.DRAFT) {
    return res.status(400).json({
      success: false,
      message: 'Only draft expenses can be submitted',
    });
  }

  // Validate required fields for submission
  if (expense.requiresReceipt && (!expense.attachments || expense.attachments.length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'Receipt attachment is required for this expense',
    });
  }

  expense.status = ExpenseStatus.SUBMITTED;
  expense.submittedAt = new Date();
  await expense.save();

  res.json({
    success: true,
    message: 'Expense submitted for approval successfully',
    data: {
      expenseNumber: expense.expenseNumber,
      status: expense.status,
      submittedAt: expense.submittedAt,
    },
  });
}));

/**
 * @route POST /api/v1/expenses/:id/approve
 * @desc Approve an expense
 * @access Private
 */
router.post('/:id/approve', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const expenseId = req.params.id;
  const { notes } = req.body;

  const expense = await Expense.findOne({
    _id: expenseId,
    lawFirmId: user.lawFirmId
  });

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found',
    });
  }

  if (expense.status !== ExpenseStatus.SUBMITTED && expense.status !== ExpenseStatus.UNDER_REVIEW) {
    return res.status(400).json({
      success: false,
      message: 'Only submitted expenses can be approved',
    });
  }

  expense.status = ExpenseStatus.APPROVED;
  expense.approvedBy = user._id;
  expense.approvedAt = new Date();
  if (notes) {
    expense.internalNotes = `${expense.internalNotes || ''}\nApproval notes: ${notes}`.trim();
  }

  await expense.save();

  res.json({
    success: true,
    message: 'Expense approved successfully',
    data: {
      expenseNumber: expense.expenseNumber,
      status: expense.status,
      approvedAt: expense.approvedAt,
    },
  });
}));

/**
 * @route POST /api/v1/expenses/:id/reject
 * @desc Reject an expense
 * @access Private
 */
router.post('/:id/reject', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const expenseId = req.params.id;
  const { rejectionReason } = req.body;

  if (!rejectionReason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required',
    });
  }

  const expense = await Expense.findOne({
    _id: expenseId,
    lawFirmId: user.lawFirmId
  });

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found',
    });
  }

  if (expense.status !== ExpenseStatus.SUBMITTED && expense.status !== ExpenseStatus.UNDER_REVIEW) {
    return res.status(400).json({
      success: false,
      message: 'Only submitted expenses can be rejected',
    });
  }

  expense.status = ExpenseStatus.REJECTED;
  expense.rejectedBy = user._id;
  expense.rejectedAt = new Date();
  expense.rejectionReason = rejectionReason;

  await expense.save();

  res.json({
    success: true,
    message: 'Expense rejected',
    data: {
      expenseNumber: expense.expenseNumber,
      status: expense.status,
      rejectedAt: expense.rejectedAt,
      rejectionReason: expense.rejectionReason,
    },
  });
}));

/**
 * @route POST /api/v1/expenses/:id/reimburse
 * @desc Mark expense as reimbursed
 * @access Private
 */
router.post('/:id/reimburse', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const expenseId = req.params.id;
  const { reimbursementMethod, reimbursementReference, reimbursementAmount } = req.body;

  const expense = await Expense.findOne({
    _id: expenseId,
    lawFirmId: user.lawFirmId
  });

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found',
    });
  }

  if (expense.status !== ExpenseStatus.APPROVED) {
    return res.status(400).json({
      success: false,
      message: 'Only approved expenses can be reimbursed',
    });
  }

  expense.status = ExpenseStatus.REIMBURSED;
  expense.reimbursementDate = new Date();
  expense.reimbursementMethod = reimbursementMethod;
  expense.reimbursementReference = reimbursementReference;
  if (reimbursementAmount !== undefined) {
    expense.reimbursementAmount = reimbursementAmount;
  }

  await expense.save();

  res.json({
    success: true,
    message: 'Expense marked as reimbursed successfully',
    data: {
      expenseNumber: expense.expenseNumber,
      status: expense.status,
      reimbursementDate: expense.reimbursementDate,
      reimbursementAmount: expense.reimbursementAmount,
    },
  });
}));

export { router as expenseRoutes };
