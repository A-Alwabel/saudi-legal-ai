import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { ClientReport, ReportType, ReportStatus, ReportFrequency } from '../models/ClientReport';
import { Types } from 'mongoose';

const router = Router();
router.use(protect);

/**
 * @route POST /api/v1/client-reports
 * @desc Create a new client report
 * @access Private (All authenticated users)
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const reportData = req.body;

  const reportNumber = await (ClientReport as any).generateReportNumber(user.lawFirmId, reportData.type);

  const newReport = new ClientReport({
    ...reportData,
    reportNumber,
    lawFirmId: user.lawFirmId,
    createdBy: user._id,
  });

  const savedReport = await newReport.save();

  const populatedReport = await ClientReport.findById(savedReport._id)
    .populate('clientId', 'name email')
    .populate('createdBy', 'name email')
    .populate('relatedCases', 'title caseNumber')
    .populate('relatedInvoices', 'invoiceNumber amount');

  res.status(201).json({
    success: true,
    data: populatedReport,
    message: 'Client report created successfully',
  });
}));

/**
 * @route GET /api/v1/client-reports
 * @desc Get client reports with filters and pagination
 * @access Private (All authenticated users)
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const {
    page = 1,
    limit = 20,
    clientId,
    type,
    status,
    startDate,
    endDate,
    search
  } = req.query;

  const filter: any = {
    lawFirmId: user.lawFirmId,
    isDeleted: false
  };

  if (clientId) filter.clientId = clientId;
  if (type) filter.type = type;
  if (status) filter.status = status;

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { titleAr: { $regex: search, $options: 'i' } },
      { reportNumber: { $regex: search, $options: 'i' } },
      { clientName: { $regex: search, $options: 'i' } },
      { clientNameAr: { $regex: search, $options: 'i' } },
    ];
  }

  if (startDate || endDate) {
    filter.generatedAt = {};
    if (startDate) filter.generatedAt.$gte = new Date(startDate as string);
    if (endDate) filter.generatedAt.$lte = new Date(endDate as string);
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [reports, total] = await Promise.all([
    ClientReport.find(filter)
      .populate('clientId', 'name email')
      .populate('createdBy', 'name email')
      .populate('relatedCases', 'title caseNumber')
      .sort({ generatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    ClientReport.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: reports,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Client reports retrieved successfully',
  });
}));

/**
 * @route POST /api/v1/client-reports/:id/generate
 * @desc Generate report data and files
 * @access Private (All authenticated users)
 */
router.post('/:id/generate', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const reportId = req.params.id;
  const { fileTypes = ['pdf'] } = req.body;

  const startTime = Date.now();

  const report = await ClientReport.findOne({
    _id: reportId,
    lawFirmId: user.lawFirmId,
    isDeleted: false
  }).populate('clientId relatedCases relatedInvoices');

  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found',
    });
  }

  // Generate report data based on type and scope
  const reportData = await generateReportData(report);
  
  // Generate files
  const generatedFiles = [];
  for (const fileType of fileTypes) {
    const file = await generateReportFile(report, reportData, fileType);
    generatedFiles.push(file);
  }

  const generationTime = Date.now() - startTime;

  // Update report with generated data
  report.reportData = reportData;
  report.generatedFiles = generatedFiles;
  report.status = ReportStatus.GENERATED;
  report.generatedAt = new Date();
  report.generatedBy = user._id;
  report.analytics.generationTime = generationTime;
  report.analytics.fileSize = generatedFiles.reduce((total, file) => total + file.fileSize, 0);

  await report.save();

  res.json({
    success: true,
    data: report,
    message: 'Report generated successfully',
  });
}));

/**
 * @route POST /api/v1/client-reports/:id/send
 * @desc Send report to recipients
 * @access Private (All authenticated users)
 */
router.post('/:id/send', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const reportId = req.params.id;

  const report = await ClientReport.findOneAndUpdate(
    {
      _id: reportId,
      lawFirmId: user.lawFirmId,
      status: ReportStatus.GENERATED,
      isDeleted: false
    },
    {
      status: ReportStatus.SENT,
      'delivery.schedule.lastDelivery': new Date(),
      updatedBy: user._id
    },
    { new: true }
  );

  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Generated report not found',
    });
  }

  // Send to recipients (implement email/SMS sending logic here)
  for (const recipient of report.delivery.recipients) {
    // Mark as delivered (simplified)
    recipient.isDelivered = true;
    recipient.deliveredAt = new Date();
  }

  await report.save();

  res.json({
    success: true,
    data: report,
    message: 'Report sent successfully',
  });
}));

/**
 * @route PUT /api/v1/client-reports/:id/view
 * @desc Track report view
 * @access Private (All authenticated users)
 */
router.put('/:id/view', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const reportId = req.params.id;
  const { duration } = req.body;

  const report = await ClientReport.findOneAndUpdate(
    {
      _id: reportId,
      lawFirmId: user.lawFirmId,
      isDeleted: false
    },
    {
      $inc: { 'analytics.viewCount': 1 },
      $push: {
        'analytics.viewHistory': {
          viewedBy: user._id,
          viewedAt: new Date(),
          duration: duration || 0,
        }
      },
      updatedBy: user._id
    },
    { new: true }
  );

  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found',
    });
  }

  res.json({
    success: true,
    message: 'View tracked successfully',
  });
}));

/**
 * @route GET /api/v1/client-reports/stats/summary
 * @desc Get client reports statistics
 * @access Private (All authenticated users)
 */
router.get('/stats/summary', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  const stats = await ClientReport.aggregate([
    { $match: { lawFirmId: user.lawFirmId, isDeleted: false } },
    {
      $facet: {
        totalReports: [{ $count: 'count' }],
        byType: [
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        byClient: [
          { $group: { _id: '$clientId', clientName: { $first: '$clientName' }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ],
        recentReports: [
          { $match: { status: 'generated' } },
          { $sort: { generatedAt: -1 } },
          { $limit: 5 },
          { $project: { title: 1, type: 1, clientName: 1, generatedAt: 1, 'analytics.viewCount': 1 } }
        ],
        engagement: [
          { $match: { status: { $in: ['generated', 'sent', 'viewed'] } } },
          {
            $group: {
              _id: null,
              totalViews: { $sum: '$analytics.viewCount' },
              totalDownloads: { $sum: '$analytics.downloadCount' },
              avgGenerationTime: { $avg: '$analytics.generationTime' },
              avgFileSize: { $avg: '$analytics.fileSize' },
            }
          }
        ]
      }
    }
  ]);

  res.json({
    success: true,
    data: stats[0],
    message: 'Client reports statistics retrieved successfully',
  });
}));

// Helper function to generate report data
async function generateReportData(report: any) {
  const { clientId, reportScope, type } = report;
  const { dateRange, includedCases } = reportScope;
  
  const reportData: any = {};

  // Generate different data based on report type
  switch (type) {
    case ReportType.CASE_SUMMARY:
      // Fetch case data
      reportData.cases = await fetchCaseData(clientId, dateRange, includedCases);
      break;
      
    case ReportType.FINANCIAL_STATEMENT:
      // Fetch financial data
      reportData.financial = await fetchFinancialData(clientId, dateRange);
      break;
      
    case ReportType.TIME_TRACKING:
      // Fetch time tracking data
      reportData.timeTracking = await fetchTimeTrackingData(clientId, dateRange);
      break;
      
    default:
      // Basic data for all reports
      reportData.summary = {
        clientName: report.clientName,
        reportPeriod: dateRange,
        generatedDate: new Date(),
      };
  }

  return reportData;
}

// Helper function to generate report file
async function generateReportFile(report: any, reportData: any, fileType: string) {
  // Simulate file generation
  const fileName = `${report.reportNumber}.${fileType}`;
  const fileSize = Math.floor(Math.random() * 1000000) + 100000; // Random size between 100KB-1MB
  
  return {
    fileType,
    fileName,
    fileUrl: `/reports/${fileName}`, // This would be actual file URL in production
    fileSize,
    generatedAt: new Date(),
    downloadCount: 0,
  };
}

// Helper functions for data fetching (simplified implementations)
async function fetchCaseData(clientId: string, dateRange: any, includedCases?: string[]) {
  // Implementation would fetch actual case data
  return [
    {
      caseId: new Types.ObjectId(),
      caseNumber: 'CASE-2024-001',
      title: 'Sample Case',
      status: 'active',
      startDate: dateRange.startDate,
      progress: 75,
      lastUpdate: new Date(),
    }
  ];
}

async function fetchFinancialData(clientId: string, dateRange: any) {
  // Implementation would fetch actual financial data
  return {
    totalBilled: 50000,
    totalPaid: 35000,
    totalOutstanding: 15000,
    currency: 'SAR',
    invoices: [],
    payments: [],
    expenses: [],
  };
}

async function fetchTimeTrackingData(clientId: string, dateRange: any) {
  // Implementation would fetch actual time tracking data
  return {
    totalHours: 120,
    billableHours: 100,
    nonBillableHours: 20,
    breakdown: [],
  };
}

export { router as clientReportRoutes };
