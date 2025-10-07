import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { TreasuryAccount, TreasuryTransaction, TransactionType, TransactionStatus } from '../models/Treasury';
import { Types } from 'mongoose';

const router = Router();

// All routes are protected and require financial permissions
router.use(protect);

// Treasury Accounts Routes

/**
 * @route POST /api/v1/treasury/accounts
 * @desc Create a new treasury account
 * @access Private (Admin, Accountant)
 */
router.post('/accounts', authorize(['admin', 'accountant']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const accountData = req.body;

  // Generate account number if not provided
  if (!accountData.accountNumber) {
    accountData.accountNumber = await (TreasuryAccount as any).generateAccountNumber(user.lawFirmId, accountData.accountType);
  }

  // Ensure only one default account per currency
  if (accountData.isDefault) {
    await TreasuryAccount.updateMany(
      { lawFirmId: user.lawFirmId, currency: accountData.currency },
      { isDefault: false }
    );
  }

  const newAccount = new TreasuryAccount({
    ...accountData,
    lawFirmId: user.lawFirmId,
    createdBy: user._id,
  });

  const savedAccount = await newAccount.save();

  res.status(201).json({
    success: true,
    data: savedAccount,
    message: 'Treasury account created successfully',
  });
}));

/**
 * @route GET /api/v1/treasury/accounts
 * @desc Get all treasury accounts
 * @access Private (Admin, Accountant, Lawyer)
 */
router.get('/accounts', authorize(['admin', 'accountant', 'lawyer']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { accountType, currency, isActive, page = 1, limit = 10 } = req.query;

  const filter: any = { lawFirmId: user.lawFirmId };
  if (accountType) filter.accountType = accountType;
  if (currency) filter.currency = currency;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [accounts, total] = await Promise.all([
    TreasuryAccount.find(filter)
      .populate('authorizedUsers', 'name email')
      .populate('approvers', 'name email')
      .populate('createdBy', 'name email')
      .sort({ isDefault: -1, accountName: 1 })
      .skip(skip)
      .limit(limitNum),
    TreasuryAccount.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: accounts,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Treasury accounts retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/treasury/accounts/dashboard
 * @desc Get treasury accounts dashboard data
 * @access Private (Admin, Accountant, Lawyer)
 */
router.get('/accounts/dashboard', authorize(['admin', 'accountant', 'lawyer']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  const [
    totalAccounts,
    activeAccounts,
    accountsByCurrency,
    accountsByType,
    totalBalance,
    recentTransactions
  ] = await Promise.all([
    TreasuryAccount.countDocuments({ lawFirmId: user.lawFirmId }),
    TreasuryAccount.countDocuments({ lawFirmId: user.lawFirmId, isActive: true }),
    TreasuryAccount.aggregate([
      { $match: { lawFirmId: user.lawFirmId } },
      { $group: { _id: '$currency', count: { $sum: 1 }, totalBalance: { $sum: '$currentBalance' } } }
    ]),
    TreasuryAccount.aggregate([
      { $match: { lawFirmId: user.lawFirmId } },
      { $group: { _id: '$accountType', count: { $sum: 1 } } }
    ]),
    TreasuryAccount.aggregate([
      { $match: { lawFirmId: user.lawFirmId, isActive: true } },
      { $group: { _id: '$currency', total: { $sum: '$currentBalance' } } }
    ]),
    TreasuryTransaction.find({ lawFirmId: user.lawFirmId })
      .populate('fromAccount', 'accountName')
      .populate('toAccount', 'accountName')
      .sort({ createdAt: -1 })
      .limit(10)
  ]);

  res.json({
    success: true,
    data: {
      statistics: {
        totalAccounts,
        activeAccounts,
      },
      charts: {
        accountsByCurrency: accountsByCurrency.reduce((acc, item) => {
          acc[item._id] = { count: item.count, balance: item.totalBalance };
          return acc;
        }, {} as Record<string, { count: number; balance: number }>),
        accountsByType: accountsByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        totalBalance: totalBalance.reduce((acc, item) => {
          acc[item._id] = item.total;
          return acc;
        }, {} as Record<string, number>),
      },
      recentTransactions,
    },
    message: 'Treasury dashboard data retrieved successfully',
  });
}));

/**
 * @route PUT /api/v1/treasury/accounts/:id
 * @desc Update a treasury account
 * @access Private (Admin, Accountant)
 */
router.put('/accounts/:id', authorize(['admin', 'accountant']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const accountId = req.params.id;

  // Ensure only one default account per currency
  if (req.body.isDefault) {
    await TreasuryAccount.updateMany(
      { 
        lawFirmId: user.lawFirmId, 
        currency: req.body.currency,
        _id: { $ne: accountId }
      },
      { isDefault: false }
    );
  }

  const updatedAccount = await TreasuryAccount.findOneAndUpdate(
    { _id: accountId, lawFirmId: user.lawFirmId },
    { ...req.body, updatedBy: user._id },
    { new: true, runValidators: true }
  );

  if (!updatedAccount) {
    return res.status(404).json({
      success: false,
      message: 'Treasury account not found',
    });
  }

  res.json({
    success: true,
    data: updatedAccount,
    message: 'Treasury account updated successfully',
  });
}));

// Treasury Transactions Routes

/**
 * @route POST /api/v1/treasury/transactions
 * @desc Create a new treasury transaction
 * @access Private (Admin, Accountant, Lawyer)
 */
router.post('/transactions', authorize(['admin', 'accountant', 'lawyer']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const transactionData = req.body;

  // Generate transaction number
  const transactionNumber = await (TreasuryTransaction as any).generateTransactionNumber(
    user.lawFirmId, 
    transactionData.type
  );

  // Validate account balances for expenses and transfers
  if (transactionData.type === TransactionType.EXPENSE || 
      (transactionData.type === TransactionType.TRANSFER && transactionData.fromAccount)) {
    const fromAccount = await TreasuryAccount.findById(transactionData.fromAccount);
    if (!fromAccount) {
      return res.status(404).json({
        success: false,
        message: 'Source account not found',
      });
    }

    if (!fromAccount.allowNegativeBalance && fromAccount.availableBalance < transactionData.amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds in source account',
      });
    }
  }

  const newTransaction = new TreasuryTransaction({
    ...transactionData,
    transactionNumber,
    lawFirmId: user.lawFirmId,
    createdBy: user._id,
    processedBy: user._id,
  });

  const savedTransaction = await newTransaction.save();

  // Update account balances if transaction is completed
  if (savedTransaction.status === TransactionStatus.COMPLETED) {
    await updateAccountBalances(savedTransaction);
  }

  const populatedTransaction = await TreasuryTransaction.findById(savedTransaction._id)
    .populate('fromAccount', 'accountName accountNumber')
    .populate('toAccount', 'accountName accountNumber')
    .populate('clientId', 'name nameAr')
    .populate('caseId', 'title titleAr');

  res.status(201).json({
    success: true,
    data: populatedTransaction,
    message: 'Treasury transaction created successfully',
  });
}));

/**
 * @route GET /api/v1/treasury/transactions
 * @desc Get all treasury transactions
 * @access Private (Admin, Accountant, Lawyer)
 */
router.get('/transactions', authorize(['admin', 'accountant', 'lawyer']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const {
    page = 1,
    limit = 10,
    type,
    category,
    status,
    accountId,
    startDate,
    endDate,
    sortBy = 'paymentDate',
    sortOrder = 'desc'
  } = req.query;

  const filter: any = { lawFirmId: user.lawFirmId };
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (accountId) {
    filter.$or = [
      { fromAccount: accountId },
      { toAccount: accountId }
    ];
  }

  if (startDate || endDate) {
    filter.paymentDate = {};
    if (startDate) filter.paymentDate.$gte = new Date(startDate as string);
    if (endDate) filter.paymentDate.$lte = new Date(endDate as string);
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  const [transactions, total] = await Promise.all([
    TreasuryTransaction.find(filter)
      .populate('fromAccount', 'accountName accountNumber')
      .populate('toAccount', 'accountName accountNumber')
      .populate('clientId', 'name nameAr')
      .populate('caseId', 'title titleAr')
      .populate('approvedBy', 'name email')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    TreasuryTransaction.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: transactions,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Treasury transactions retrieved successfully',
  });
}));

/**
 * @route POST /api/v1/treasury/transactions/:id/approve
 * @desc Approve a treasury transaction
 * @access Private (Admin, Accountant)
 */
router.post('/transactions/:id/approve', authorize(['admin', 'accountant']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const transactionId = req.params.id;
  const { approvalNotes } = req.body;

  const transaction = await TreasuryTransaction.findOne({
    _id: transactionId,
    lawFirmId: user.lawFirmId,
    status: TransactionStatus.PENDING,
    requiresApproval: true
  });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found or does not require approval',
    });
  }

  transaction.status = TransactionStatus.COMPLETED;
  transaction.approvedBy = user._id;
  transaction.approvedAt = new Date();
  transaction.approvalNotes = approvalNotes;

  await transaction.save();

  // Update account balances
  await updateAccountBalances(transaction);

  res.json({
    success: true,
    data: transaction,
    message: 'Transaction approved successfully',
  });
}));

/**
 * @route GET /api/v1/treasury/reports/cash-flow
 * @desc Get cash flow report
 * @access Private (Admin, Accountant)
 */
router.get('/reports/cash-flow', authorize(['admin', 'accountant']), asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { startDate, endDate, currency = 'SAR' } = req.query;

  const dateFilter: any = {};
  if (startDate) dateFilter.$gte = new Date(startDate as string);
  if (endDate) dateFilter.$lte = new Date(endDate as string);

  const filter: any = {
    lawFirmId: user.lawFirmId,
    status: TransactionStatus.COMPLETED,
    currency
  };

  if (Object.keys(dateFilter).length > 0) {
    filter.paymentDate = dateFilter;
  }

  const [inflows, outflows, monthlyData] = await Promise.all([
    TreasuryTransaction.aggregate([
      { $match: { ...filter, type: TransactionType.INCOME } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]),
    TreasuryTransaction.aggregate([
      { $match: { ...filter, type: TransactionType.EXPENSE } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]),
    TreasuryTransaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' },
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
  ]);

  const totalInflows = inflows.reduce((sum, item) => sum + item.total, 0);
  const totalOutflows = outflows.reduce((sum, item) => sum + item.total, 0);
  const netCashFlow = totalInflows - totalOutflows;

  res.json({
    success: true,
    data: {
      summary: {
        totalInflows,
        totalOutflows,
        netCashFlow,
        currency
      },
      inflows: inflows.reduce((acc, item) => {
        acc[item._id] = { total: item.total, count: item.count };
        return acc;
      }, {} as Record<string, { total: number; count: number }>),
      outflows: outflows.reduce((acc, item) => {
        acc[item._id] = { total: item.total, count: item.count };
        return acc;
      }, {} as Record<string, { total: number; count: number }>),
      monthlyData
    },
    message: 'Cash flow report generated successfully',
  });
}));

// Helper function to update account balances
async function updateAccountBalances(transaction: any) {
  const session = await TreasuryTransaction.startSession();
  
  try {
    await session.withTransaction(async () => {
      const amount = transaction.amountInAccountCurrency || transaction.amount;

      // Update source account (for expenses and transfers)
      if (transaction.fromAccount) {
        await TreasuryAccount.findByIdAndUpdate(
          transaction.fromAccount,
          {
            $inc: {
              currentBalance: -amount,
              availableBalance: -amount
            }
          },
          { session }
        );
      }

      // Update destination account (for income and transfers)
      if (transaction.toAccount) {
        await TreasuryAccount.findByIdAndUpdate(
          transaction.toAccount,
          {
            $inc: {
              currentBalance: amount,
              availableBalance: amount
            }
          },
          { session }
        );
      }
    });
  } finally {
    await session.endSession();
  }
}

export { router as treasuryRoutes };
