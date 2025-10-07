import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { clientAuthMiddleware } from '../middleware/clientAuth';
import { Case } from '../models/Case';
import { Client } from '../models/Client';
import { Document } from '../models/Document';
import { User } from '../models/User';
import { Invoice } from '../models/Invoice';
import { Payment } from '../models/Payment';
import { Appointment } from '../models/Appointment';
import { WorkUpdate } from '../models/WorkUpdate';
import { ClientReport } from '../models/ClientReport';
import { generateToken } from '../utils/jwt';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';

const router = Router();

/**
 * @route POST /api/v1/client-portal/login
 * @desc Client portal login (separate from lawyer login)
 * @access Public
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  // Find client by email
  const client = await Client.findOne({ email }).populate('lawFirmId', 'name');
  
  if (!client) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Enhanced password validation
  // Check if client has a password field, otherwise use email as temporary password
  let isValidPassword = false;
  if (client.password) {
    isValidPassword = await bcrypt.compare(password, client.password);
  } else {
    // Temporary fallback - in production, all clients should have proper passwords
    isValidPassword = email === password;
  }
  
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Generate client-specific token
  const token = generateToken({
    id: client._id,
    email: client.email,
    type: 'client',
    lawFirmId: client.lawFirmId,
  });

  res.json({
    success: true,
    data: {
      token,
      client: {
        id: client._id,
        name: client.name,
        nameAr: client.nameAr,
        email: client.email,
        phone: client.phone,
        clientType: client.clientType,
        lawFirm: client.lawFirmId,
      },
    },
    message: 'Login successful',
  });
}));

/**
 * @route GET /api/v1/client-portal/dashboard
 * @desc Get client dashboard data
 * @access Private (Client)
 */
router.get('/dashboard', clientAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const clientId = req.user?.id; // From auth middleware
  
  if (!clientId) {
    return res.status(401).json({
      success: false,
      message: 'Client authentication required',
    });
  }

  // Get client's cases
  const cases = await Case.find({ clientId })
    .populate('assignedLawyerId', 'name email')
    .sort({ createdAt: -1 })
    .limit(10);

  // Get client's documents
  const documents = await Document.find({ clientId })
    .sort({ createdAt: -1 })
    .limit(10);

  // Calculate statistics
  const totalCases = await Case.countDocuments({ clientId });
  const activeCases = await Case.countDocuments({ 
    clientId, 
    status: { $in: ['new', 'in_progress', 'under_review'] }
  });
  const totalDocuments = await Document.countDocuments({ clientId });

  res.json({
    success: true,
    data: {
      statistics: {
        totalCases,
        activeCases,
        closedCases: totalCases - activeCases,
        totalDocuments,
      },
      recentCases: cases,
      recentDocuments: documents,
    },
    message: 'Dashboard data retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/client-portal/cases
 * @desc Get client's cases with pagination
 * @access Private (Client)
 */
router.get('/cases', clientAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const clientId = req.user?.id;
  const { page = 1, limit = 10, status } = req.query;

  if (!clientId) {
    return res.status(401).json({
      success: false,
      message: 'Client authentication required',
    });
  }

  const filter: any = { clientId };
  if (status) filter.status = status;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [cases, total] = await Promise.all([
    Case.find(filter)
      .populate('assignedLawyerId', 'name email phone')
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
 * @route GET /api/v1/client-portal/cases/:id
 * @desc Get specific case details
 * @access Private (Client)
 */
router.get('/cases/:id', clientAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const clientId = req.user?.id;
  const caseId = req.params.id;

  if (!clientId) {
    return res.status(401).json({
      success: false,
      message: 'Client authentication required',
    });
  }

  if (!Types.ObjectId.isValid(caseId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid case ID format',
    });
  }

  const caseData = await Case.findOne({ 
    _id: caseId, 
    clientId 
  })
    .populate('assignedLawyerId', 'name email phone')
    .populate('lawFirmId', 'name phone email address');

  if (!caseData) {
    return res.status(404).json({
      success: false,
      message: 'Case not found',
    });
  }

  // Get case documents
  const documents = await Document.find({ caseId })
    .select('title fileName fileSize createdAt documentType')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      case: caseData,
      documents,
    },
    message: 'Case details retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/client-portal/documents
 * @desc Get client's documents
 * @access Private (Client)
 */
router.get('/documents', clientAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const clientId = req.user?.id;
  const { page = 1, limit = 10, caseId, documentType } = req.query;

  if (!clientId) {
    return res.status(401).json({
      success: false,
      message: 'Client authentication required',
    });
  }

  const filter: any = { clientId };
  if (caseId) filter.caseId = caseId;
  if (documentType) filter.documentType = documentType;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [documents, total] = await Promise.all([
    Document.find(filter)
      .populate('caseId', 'title caseNumber')
      .select('-filePath') // Don't expose file paths to clients
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Document.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: documents,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Documents retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/client-portal/documents/:id/download
 * @desc Download a document (if client has access)
 * @access Private (Client)
 */
router.get('/documents/:id/download', clientAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const clientId = req.user?.id;
  const documentId = req.params.id;

  if (!clientId) {
    return res.status(401).json({
      success: false,
      message: 'Client authentication required',
    });
  }

  const document = await Document.findOne({
    _id: documentId,
    clientId,
  });

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found or access denied',
    });
  }

  // For now, return download URL - implement actual file serving later
  res.json({
    success: true,
    data: {
      downloadUrl: `/api/v1/documents/${documentId}/file`,
      fileName: document.fileName,
      fileSize: document.fileSize,
    },
    message: 'Download link generated',
  });
}));

/**
 * @route POST /api/v1/client-portal/consultation-request
 * @desc Submit a consultation request
 * @access Private (Client)
 */
router.post('/consultation-request', clientAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const clientId = req.user?.id;
  const { subject, description, priority = 'medium', caseId } = req.body;

  if (!clientId) {
    return res.status(401).json({
      success: false,
      message: 'Client authentication required',
    });
  }

  if (!subject || !description) {
    return res.status(400).json({
      success: false,
      message: 'Subject and description are required',
    });
  }

  // Create a new case or add note to existing case
  let consultationCase;
  
  if (caseId) {
    // Add to existing case
    consultationCase = await Case.findOne({ _id: caseId, clientId });
    if (consultationCase) {
      consultationCase.notes.push({
        content: `Client Consultation Request: ${subject}\n\n${description}`,
        addedBy: clientId,
        addedAt: new Date(),
      });
      await consultationCase.save();
    }
  } else {
    // Create new consultation case
    const client = await Client.findById(clientId);
    consultationCase = new Case({
      title: `Consultation: ${subject}`,
      description,
      caseType: 'consultation',
      priority,
      clientId,
      assignedLawyerId: client?.assignedLawyerId || clientId, // Fallback
      lawFirmId: client?.lawFirmId,
      startDate: new Date(),
    });
    await consultationCase.save();
  }

  res.status(201).json({
    success: true,
    data: consultationCase,
    message: 'Consultation request submitted successfully',
  });
}));

/**
 * @route GET /api/v1/client-portal/profile
 * @desc Get client profile
 * @access Private (Client)
 */
router.get('/profile', clientAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const clientId = req.user?.id;

  if (!clientId) {
    return res.status(401).json({
      success: false,
      message: 'Client authentication required',
    });
  }

  const client = await Client.findById(clientId)
    .populate('lawFirmId', 'name phone email address')
    .populate('assignedLawyerId', 'name email phone');

  if (!client) {
    return res.status(404).json({
      success: false,
      message: 'Client not found',
    });
  }

  res.json({
    success: true,
    data: client,
    message: 'Profile retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/client-portal/invoices
 * @desc Get client's invoices
 * @access Private (Client)
 */
router.get('/invoices', clientAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const clientId = req.user?.id;
  const { page = 1, limit = 10, status } = req.query;

  if (!clientId) {
    return res.status(401).json({
      success: false,
      message: 'Client authentication required',
    });
  }

  const filter: any = { clientId };
  if (status) filter.status = status;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [invoices, total] = await Promise.all([
    Invoice.find(filter)
      .populate('caseId', 'title caseNumber')
      .sort({ createdAt: -1 })
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
 * @route GET /api/v1/client-portal/payments
 * @desc Get client's payment history
 * @access Private (Client)
 */
router.get('/payments', clientAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const clientId = req.user?.id;
  const { page = 1, limit = 10 } = req.query;

  if (!clientId) {
    return res.status(401).json({
      success: false,
      message: 'Client authentication required',
    });
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Get payments through invoices
  const [payments, total] = await Promise.all([
    Payment.find({ clientId })
      .populate('invoiceId', 'invoiceNumber amount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Payment.countDocuments({ clientId })
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
 * @route GET /api/v1/client-portal/appointments
 * @desc Get client's appointments
 * @access Private (Client)
 */
router.get('/appointments', clientAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const clientId = req.user?.id;
  const { page = 1, limit = 10, upcoming } = req.query;

  if (!clientId) {
    return res.status(401).json({
      success: false,
      message: 'Client authentication required',
    });
  }

  const filter: any = { clientId };
  if (upcoming === 'true') {
    filter.startTime = { $gte: new Date() };
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate('attendees', 'name email')
      .sort({ startTime: upcoming === 'true' ? 1 : -1 })
      .skip(skip)
      .limit(limitNum),
    Appointment.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: appointments,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Appointments retrieved successfully',
  });
}));

/**
 * @route POST /api/v1/client-portal/appointments/request
 * @desc Request a new appointment
 * @access Private (Client)
 */
router.post('/appointments/request', clientAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const clientId = req.user?.id;
  const { title, description, preferredDate, preferredTime, caseId } = req.body;

  if (!clientId) {
    return res.status(401).json({
      success: false,
      message: 'Client authentication required',
    });
  }

  if (!title || !preferredDate) {
    return res.status(400).json({
      success: false,
      message: 'Title and preferred date are required',
    });
  }

  const client = await Client.findById(clientId);
  if (!client) {
    return res.status(404).json({
      success: false,
      message: 'Client not found',
    });
  }

  // Create appointment request
  const appointmentRequest = new Appointment({
    title: `Client Request: ${title}`,
    description,
    startTime: new Date(`${preferredDate}T${preferredTime || '10:00'}:00.000Z`),
    endTime: new Date(`${preferredDate}T${preferredTime ? new Date(`1970-01-01T${preferredTime}:00.000Z`).getTime() + 60*60*1000 : '11:00'}:00.000Z`),
    clientId,
    caseId: caseId || null,
    attendees: [client.assignedLawyerId || clientId],
    status: 'pending',
    lawFirmId: client.lawFirmId,
    createdBy: clientId,
  });

  await appointmentRequest.save();

  res.status(201).json({
    success: true,
    data: appointmentRequest,
    message: 'Appointment request submitted successfully',
  });
}));

/**
 * @route GET /api/v1/client-portal/updates
 * @desc Get work updates for client
 * @access Private (Client)
 */
router.get('/updates', clientAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const clientId = req.user?.id;
  const { page = 1, limit = 10 } = req.query;

  if (!clientId) {
    return res.status(401).json({
      success: false,
      message: 'Client authentication required',
    });
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [updates, total] = await Promise.all([
    WorkUpdate.find({
      relatedClient: clientId,
      status: 'published',
      'recipients.clientId': clientId
    })
      .populate('relatedCase', 'title caseNumber')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limitNum),
    WorkUpdate.countDocuments({
      relatedClient: clientId,
      status: 'published',
      'recipients.clientId': clientId
    })
  ]);

  res.json({
    success: true,
    data: updates,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    message: 'Updates retrieved successfully',
  });
}));

/**
 * @route GET /api/v1/client-portal/reports
 * @desc Get client reports
 * @access Private (Client)
 */
router.get('/reports', clientAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const clientId = req.user?.id;
  const { page = 1, limit = 10, type } = req.query;

  if (!clientId) {
    return res.status(401).json({
      success: false,
      message: 'Client authentication required',
    });
  }

  const filter: any = { clientId, status: { $in: ['generated', 'sent', 'viewed'] } };
  if (type) filter.type = type;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [reports, total] = await Promise.all([
    ClientReport.find(filter)
      .select('reportNumber title type generatedAt analytics.viewCount generatedFiles')
      .sort({ generatedAt: -1 })
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
    message: 'Reports retrieved successfully',
  });
}));

/**
 * @route PUT /api/v1/client-portal/profile
 * @desc Update client profile
 * @access Private (Client)
 */
router.put('/profile', clientAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const clientId = req.user?.id;
  const { name, nameAr, phone, address, addressAr, emergencyContact } = req.body;

  if (!clientId) {
    return res.status(401).json({
      success: false,
      message: 'Client authentication required',
    });
  }

  const updatedClient = await Client.findByIdAndUpdate(
    clientId,
    {
      name,
      nameAr,
      phone,
      address,
      addressAr,
      emergencyContact,
      updatedAt: new Date()
    },
    { new: true, runValidators: true }
  ).populate('lawFirmId', 'name phone email address');

  if (!updatedClient) {
    return res.status(404).json({
      success: false,
      message: 'Client not found',
    });
  }

  res.json({
    success: true,
    data: updatedClient,
    message: 'Profile updated successfully',
  });
}));

/**
 * @route POST /api/v1/client-portal/feedback
 * @desc Submit feedback about service
 * @access Private (Client)
 */
router.post('/feedback', clientAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const clientId = req.user?.id;
  const { caseId, rating, comments, commentsAr, category } = req.body;

  if (!clientId) {
    return res.status(401).json({
      success: false,
      message: 'Client authentication required',
    });
  }

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be between 1 and 5',
    });
  }

  // For now, add feedback to case notes
  if (caseId) {
    const caseData = await Case.findOne({ _id: caseId, clientId });
    if (caseData) {
      caseData.notes.push({
        content: `Client Feedback (${rating}/5 stars): ${comments || 'No comments'}`,
        addedBy: clientId,
        addedAt: new Date(),
      });
      await caseData.save();
    }
  }

  res.status(201).json({
    success: true,
    message: 'Feedback submitted successfully',
  });
}));

/**
 * @route GET /api/v1/client-portal/financial-summary
 * @desc Get client's financial summary
 * @access Private (Client)
 */
router.get('/financial-summary', clientAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const clientId = req.user?.id;

  if (!clientId) {
    return res.status(401).json({
      success: false,
      message: 'Client authentication required',
    });
  }

  // Get financial summary
  const [invoiceSummary, paymentSummary] = await Promise.all([
    Invoice.aggregate([
      { $match: { clientId: new Types.ObjectId(clientId) } },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]),
    Payment.aggregate([
      { $match: { clientId: new Types.ObjectId(clientId) } },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  const summary = {
    invoices: invoiceSummary,
    payments: paymentSummary[0] || { totalPaid: 0, count: 0 },
    currency: 'SAR'
  };

  res.json({
    success: true,
    data: summary,
    message: 'Financial summary retrieved successfully',
  });
}));

export { router as clientPortalRoutes };
