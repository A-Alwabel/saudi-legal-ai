import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { protect } from '../middleware/auth';
import { Invoice, InvoiceStatus } from '../models/Invoice';
import { Payment, PaymentStatus } from '../models/Payment';
import { Expense, ExpenseStatus } from '../models/Expense';
import { Quotation, QuotationStatus } from '../models/Quotation';
import { Case } from '../models/Case';
import { CaseStatus } from '@shared/types';
import { Client } from '../models/Client';
import { Task, TaskStatus } from '../models/Task';

const router = Router();

// Apply authentication to all report routes
router.use(protect);

/**
 * @route GET /api/v1/reports/financial/summary
 * @desc Get financial summary report
 * @access Private
 */
router.get('/financial/summary', asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate, currency = 'SAR' } = req.query;
  const user = req.user;

  const dateFilter: any = {};
  if (startDate) dateFilter.$gte = new Date(startDate as string);
  if (endDate) dateFilter.$lte = new Date(endDate as string);

  const filter = { 
    lawFirmId: user.lawFirmId,
    ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
  };

  const [
    revenue,
    expenses,
    payments,
    quotations,
    outstandingInvoices,
    overdueInvoices
  ] = await Promise.all([
    // Revenue from invoices
    Invoice.aggregate([
      { 
        $match: { 
          ...filter,
          status: { $in: [InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' },
          count: { $sum: 1 }
        }
      }
    ]),
    
    // Expenses
    Expense.aggregate([
      { 
        $match: { 
          ...filter,
          status: { $in: [ExpenseStatus.APPROVED, ExpenseStatus.REIMBURSED] }
        }
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$baseAmount' },
          billableExpenses: {
            $sum: {
              $cond: ['$billable', '$baseAmount', 0]
            }
          },
          count: { $sum: 1 }
        }
      }
    ]),
    
    // Payments received
    Payment.aggregate([
      { 
        $match: { 
          ...filter,
          status: PaymentStatus.COMPLETED
        }
      },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: '$baseAmount' },
          count: { $sum: 1 }
        }
      }
    ]),
    
    // Quotations
    Quotation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          totalValue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]),
    
    // Outstanding invoices
    Invoice.aggregate([
      { 
        $match: { 
          lawFirmId: user.lawFirmId,
          status: { $in: [InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.PARTIALLY_PAID] }
        }
      },
      {
        $group: {
          _id: null,
          outstandingAmount: { $sum: '$balanceAmount' },
          count: { $sum: 1 }
        }
      }
    ]),
    
    // Overdue invoices
    Invoice.aggregate([
      { 
        $match: { 
          lawFirmId: user.lawFirmId,
          dueDate: { $lt: new Date() },
          status: { $nin: [InvoiceStatus.PAID, InvoiceStatus.CANCELLED] }
        }
      },
      {
        $group: {
          _id: null,
          overdueAmount: { $sum: '$balanceAmount' },
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  const revenueData = revenue[0] || { totalRevenue: 0, paidAmount: 0, count: 0 };
  const expenseData = expenses[0] || { totalExpenses: 0, billableExpenses: 0, count: 0 };
  const paymentData = payments[0] || { totalPayments: 0, count: 0 };
  const outstandingData = outstandingInvoices[0] || { outstandingAmount: 0, count: 0 };
  const overdueData = overdueInvoices[0] || { overdueAmount: 0, count: 0 };

  // Process quotations data
  const quotationsByStatus = quotations.reduce((acc, item) => {
    acc[item._id] = { value: item.totalValue, count: item.count };
    return acc;
  }, {} as Record<string, { value: number; count: number }>);

  const netProfit = revenueData.paidAmount - expenseData.totalExpenses;
  const profitMargin = revenueData.paidAmount > 0 ? (netProfit / revenueData.paidAmount) * 100 : 0;

  res.json({
    success: true,
    data: {
      summary: {
        totalRevenue: revenueData.totalRevenue,
        paidRevenue: revenueData.paidAmount,
        totalExpenses: expenseData.totalExpenses,
        billableExpenses: expenseData.billableExpenses,
        totalPayments: paymentData.totalPayments,
        netProfit,
        profitMargin: Math.round(profitMargin * 100) / 100,
        outstandingAmount: outstandingData.outstandingAmount,
        overdueAmount: overdueData.overdueAmount,
      },
      counts: {
        invoices: revenueData.count,
        expenses: expenseData.count,
        payments: paymentData.count,
        outstandingInvoices: outstandingData.count,
        overdueInvoices: overdueData.count,
      },
      quotations: quotationsByStatus,
      currency,
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      }
    },
    message: 'Financial summary retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/reports/financial/revenue
 * @desc Get detailed revenue report
 * @access Private
 */
router.get('/financial/revenue', asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate, groupBy = 'month', clientId } = req.query;
  const user = req.user;

  const dateFilter: any = {};
  if (startDate) dateFilter.$gte = new Date(startDate as string);
  if (endDate) dateFilter.$lte = new Date(endDate as string);

  const matchFilter: any = { 
    lawFirmId: user.lawFirmId,
    status: { $in: [InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID] }
  };
  
  if (Object.keys(dateFilter).length > 0) {
    matchFilter.invoiceDate = dateFilter;
  }
  
  if (clientId) {
    matchFilter.clientId = clientId;
  }

  // Group by time period
  let groupByExpression: any;
  switch (groupBy) {
    case 'day':
      groupByExpression = {
        year: { $year: '$invoiceDate' },
        month: { $month: '$invoiceDate' },
        day: { $dayOfMonth: '$invoiceDate' }
      };
      break;
    case 'week':
      groupByExpression = {
        year: { $year: '$invoiceDate' },
        week: { $week: '$invoiceDate' }
      };
      break;
    case 'month':
      groupByExpression = {
        year: { $year: '$invoiceDate' },
        month: { $month: '$invoiceDate' }
      };
      break;
    case 'year':
      groupByExpression = {
        year: { $year: '$invoiceDate' }
      };
      break;
    default:
      groupByExpression = {
        year: { $year: '$invoiceDate' },
        month: { $month: '$invoiceDate' }
      };
  }

  const [revenueByPeriod, revenueByClient, revenueByType] = await Promise.all([
    // Revenue by time period
    Invoice.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: groupByExpression,
          revenue: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' },
          invoiceCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]),
    
    // Revenue by client
    Invoice.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$clientId',
          revenue: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' },
          invoiceCount: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client'
        }
      }
    ]),
    
    // Revenue by invoice type
    Invoice.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$invoiceType',
          revenue: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' },
          invoiceCount: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ])
  ]);

  res.json({
    success: true,
    data: {
      revenueByPeriod: revenueByPeriod.map(item => ({
        period: item._id,
        revenue: item.revenue,
        paidAmount: item.paidAmount,
        invoiceCount: item.invoiceCount
      })),
      revenueByClient: revenueByClient.map(item => ({
        clientId: item._id,
        clientName: item.client[0]?.name || 'Unknown',
        revenue: item.revenue,
        paidAmount: item.paidAmount,
        invoiceCount: item.invoiceCount
      })),
      revenueByType: revenueByType
    },
    message: 'Revenue report retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/reports/financial/expenses
 * @desc Get detailed expense report
 * @access Private
 */
router.get('/financial/expenses', asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate, groupBy = 'month', category } = req.query;
  const user = req.user;

  const dateFilter: any = {};
  if (startDate) dateFilter.$gte = new Date(startDate as string);
  if (endDate) dateFilter.$lte = new Date(endDate as string);

  const matchFilter: any = { 
    lawFirmId: user.lawFirmId,
    status: { $in: [ExpenseStatus.APPROVED, ExpenseStatus.REIMBURSED] }
  };
  
  if (Object.keys(dateFilter).length > 0) {
    matchFilter.expenseDate = dateFilter;
  }
  
  if (category) {
    matchFilter.category = category;
  }

  // Group by time period
  let groupByExpression: any;
  switch (groupBy) {
    case 'day':
      groupByExpression = {
        year: { $year: '$expenseDate' },
        month: { $month: '$expenseDate' },
        day: { $dayOfMonth: '$expenseDate' }
      };
      break;
    case 'month':
      groupByExpression = {
        year: { $year: '$expenseDate' },
        month: { $month: '$expenseDate' }
      };
      break;
    case 'year':
      groupByExpression = {
        year: { $year: '$expenseDate' }
      };
      break;
    default:
      groupByExpression = {
        year: { $year: '$expenseDate' },
        month: { $month: '$expenseDate' }
      };
  }

  const [expensesByPeriod, expensesByCategory, expensesByUser] = await Promise.all([
    // Expenses by time period
    Expense.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: groupByExpression,
          totalAmount: { $sum: '$baseAmount' },
          billableAmount: {
            $sum: {
              $cond: ['$billable', '$baseAmount', 0]
            }
          },
          expenseCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]),
    
    // Expenses by category
    Expense.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$baseAmount' },
          billableAmount: {
            $sum: {
              $cond: ['$billable', '$baseAmount', 0]
            }
          },
          expenseCount: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]),
    
    // Expenses by user
    Expense.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$paidBy',
          totalAmount: { $sum: '$baseAmount' },
          expenseCount: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      }
    ])
  ]);

  res.json({
    success: true,
    data: {
      expensesByPeriod: expensesByPeriod.map(item => ({
        period: item._id,
        totalAmount: item.totalAmount,
        billableAmount: item.billableAmount,
        expenseCount: item.expenseCount
      })),
      expensesByCategory,
      expensesByUser: expensesByUser.map(item => ({
        userId: item._id,
        userName: item.user[0]?.name || 'Unknown',
        totalAmount: item.totalAmount,
        expenseCount: item.expenseCount
      }))
    },
    message: 'Expense report retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/reports/operational/cases
 * @desc Get case performance report
 * @access Private
 */
router.get('/operational/cases', asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate, lawyerId, status } = req.query;
  const user = req.user;

  const dateFilter: any = {};
  if (startDate) dateFilter.$gte = new Date(startDate as string);
  if (endDate) dateFilter.$lte = new Date(endDate as string);

  const matchFilter: any = { lawFirmId: user.lawFirmId };
  
  if (Object.keys(dateFilter).length > 0) {
    matchFilter.createdAt = dateFilter;
  }
  
  if (lawyerId) {
    matchFilter.assignedLawyerId = lawyerId;
  }
  
  if (status) {
    matchFilter.status = status;
  }

  const [
    casesByStatus,
    casesByType,
    casesByLawyer,
    casesByPriority,
    averageCaseDuration,
    successRate
  ] = await Promise.all([
    // Cases by status
    Case.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$estimatedValue' }
        }
      }
    ]),
    
    // Cases by type
    Case.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$caseType',
          count: { $sum: 1 },
          totalValue: { $sum: '$estimatedValue' }
        }
      },
      { $sort: { count: -1 } }
    ]),
    
    // Cases by lawyer
    Case.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$assignedLawyerId',
          count: { $sum: 1 },
          totalValue: { $sum: '$estimatedValue' }
        }
      },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'lawyer'
        }
      }
    ]),
    
    // Cases by priority
    Case.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]),
    
    // Average case duration
    Case.aggregate([
      { 
        $match: { 
          ...matchFilter,
          actualEndDate: { $exists: true }
        }
      },
      {
        $addFields: {
          duration: {
            $divide: [
              { $subtract: ['$actualEndDate', '$startDate'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageDuration: { $avg: '$duration' },
          minDuration: { $min: '$duration' },
          maxDuration: { $max: '$duration' }
        }
      }
    ]),
    
    // Success rate
    Case.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          won: {
            $sum: {
              $cond: [
                { $eq: ['$status', CaseStatus.WON] },
                1,
                0
              ]
            }
          },
          settled: {
            $sum: {
              $cond: [
                { $eq: ['$status', CaseStatus.SETTLED] },
                1,
                0
              ]
            }
          }
        }
      }
    ])
  ]);

  const successData = successRate[0] || { total: 0, won: 0, settled: 0 };
  const successRatePercent = successData.total > 0 
    ? Math.round(((successData.won + successData.settled) / successData.total) * 100)
    : 0;

  res.json({
    success: true,
    data: {
      casesByStatus,
      casesByType,
      casesByLawyer: casesByLawyer.map(item => ({
        lawyerId: item._id,
        lawyerName: item.lawyer[0]?.name || 'Unknown',
        caseCount: item.count,
        totalValue: item.totalValue
      })),
      casesByPriority,
      performance: {
        averageDuration: averageCaseDuration[0]?.averageDuration || 0,
        minDuration: averageCaseDuration[0]?.minDuration || 0,
        maxDuration: averageCaseDuration[0]?.maxDuration || 0,
        successRate: successRatePercent,
        totalCases: successData.total,
        wonCases: successData.won,
        settledCases: successData.settled
      }
    },
    message: 'Case performance report retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/reports/operational/productivity
 * @desc Get productivity report
 * @access Private
 */
router.get('/operational/productivity', asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate, userId } = req.query;
  const user = req.user;

  const dateFilter: any = {};
  if (startDate) dateFilter.$gte = new Date(startDate as string);
  if (endDate) dateFilter.$lte = new Date(endDate as string);

  const matchFilter: any = { lawFirmId: user.lawFirmId };
  
  if (Object.keys(dateFilter).length > 0) {
    matchFilter.createdAt = dateFilter;
  }
  
  if (userId) {
    matchFilter.assignedTo = userId;
  }

  const [
    tasksByStatus,
    tasksByUser,
    taskCompletion,
    timeTracking
  ] = await Promise.all([
    // Tasks by status
    Task.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalHours: { $sum: '$actualHours' }
        }
      }
    ]),
    
    // Tasks by user
    Task.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$assignedTo',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: {
              $cond: [
                { $eq: ['$status', TaskStatus.COMPLETED] },
                1,
                0
              ]
            }
          },
          totalHours: { $sum: '$actualHours' },
          billableHours: {
            $sum: {
              $reduce: {
                input: '$timeEntries',
                initialValue: 0,
                in: {
                  $add: [
                    '$$value',
                    {
                      $cond: [
                        '$$this.billable',
                        { $divide: ['$$this.duration', 60] },
                        0
                      ]
                    }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      }
    ]),
    
    // Task completion rate over time
    Task.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: {
              $cond: [
                { $eq: ['$status', TaskStatus.COMPLETED] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),
    
    // Time tracking summary
    Task.aggregate([
      { $match: matchFilter },
      { $unwind: '$timeEntries' },
      {
        $group: {
          _id: '$timeEntries.user',
          totalMinutes: { $sum: '$timeEntries.duration' },
          billableMinutes: {
            $sum: {
              $cond: [
                '$timeEntries.billable',
                '$timeEntries.duration',
                0
              ]
            }
          },
          entryCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      }
    ])
  ]);

  res.json({
    success: true,
    data: {
      tasksByStatus,
      tasksByUser: tasksByUser.map(item => ({
        userId: item._id,
        userName: item.user[0]?.name || 'Unknown',
        totalTasks: item.totalTasks,
        completedTasks: item.completedTasks,
        completionRate: item.totalTasks > 0 
          ? Math.round((item.completedTasks / item.totalTasks) * 100)
          : 0,
        totalHours: Math.round((item.totalHours || 0) * 100) / 100,
        billableHours: Math.round((item.billableHours || 0) * 100) / 100
      })),
      taskCompletion: taskCompletion.map(item => ({
        period: item._id,
        totalTasks: item.totalTasks,
        completedTasks: item.completedTasks,
        completionRate: item.totalTasks > 0 
          ? Math.round((item.completedTasks / item.totalTasks) * 100)
          : 0
      })),
      timeTracking: timeTracking.map(item => ({
        userId: item._id,
        userName: item.user[0]?.name || 'Unknown',
        totalHours: Math.round((item.totalMinutes / 60) * 100) / 100,
        billableHours: Math.round((item.billableMinutes / 60) * 100) / 100,
        utilizationRate: item.totalMinutes > 0
          ? Math.round((item.billableMinutes / item.totalMinutes) * 100)
          : 0,
        entryCount: item.entryCount
      }))
    },
    message: 'Productivity report retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/reports/client/analysis
 * @desc Get client analysis report
 * @access Private
 */
router.get('/client/analysis', asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate, clientType } = req.query;
  const user = req.user;

  const dateFilter: any = {};
  if (startDate) dateFilter.$gte = new Date(startDate as string);
  if (endDate) dateFilter.$lte = new Date(endDate as string);

  const clientFilter: any = { lawFirmId: user.lawFirmId };
  if (clientType) clientFilter.clientType = clientType;

  const invoiceFilter: any = { lawFirmId: user.lawFirmId };
  if (Object.keys(dateFilter).length > 0) {
    invoiceFilter.invoiceDate = dateFilter;
  }

  const [
    clientsByType,
    topClientsByRevenue,
    clientRetention,
    newClientsOverTime
  ] = await Promise.all([
    // Clients by type
    Client.aggregate([
      { $match: clientFilter },
      {
        $group: {
          _id: '$clientType',
          count: { $sum: 1 }
        }
      }
    ]),
    
    // Top clients by revenue
    Invoice.aggregate([
      { $match: invoiceFilter },
      {
        $group: {
          _id: '$clientId',
          totalRevenue: { $sum: '$totalAmount' },
          invoiceCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client'
        }
      }
    ]),
    
    // Client retention (clients with multiple cases)
    Case.aggregate([
      { $match: { lawFirmId: user.lawFirmId } },
      {
        $group: {
          _id: '$clientId',
          caseCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          returningClients: {
            $sum: {
              $cond: [
                { $gt: ['$caseCount', 1] },
                1,
                0
              ]
            }
          }
        }
      }
    ]),
    
    // New clients over time
    Client.aggregate([
      { $match: clientFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newClients: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
  ]);

  const retentionData = clientRetention[0] || { totalClients: 0, returningClients: 0 };
  const retentionRate = retentionData.totalClients > 0
    ? Math.round((retentionData.returningClients / retentionData.totalClients) * 100)
    : 0;

  res.json({
    success: true,
    data: {
      clientsByType,
      topClientsByRevenue: topClientsByRevenue.map(item => ({
        clientId: item._id,
        clientName: item.client[0]?.name || 'Unknown',
        totalRevenue: item.totalRevenue,
        invoiceCount: item.invoiceCount
      })),
      retention: {
        totalClients: retentionData.totalClients,
        returningClients: retentionData.returningClients,
        retentionRate
      },
      newClientsOverTime: newClientsOverTime.map(item => ({
        period: item._id,
        newClients: item.newClients
      }))
    },
    message: 'Client analysis report retrieved successfully',
  });
}));

export { router as reportRoutes };
