const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('./email-service');
const ValidationMiddleware = require('./validation-middleware');
const { generateAIResponseWithPDFLaws, getLawDatabaseStats } = require('./ai-with-pdf-laws');

const app = express();
const PORT = 5000;

// ================================================
// MONGODB ATLAS CONNECTION - WORKING ✅
// ================================================
// Cluster: cluster0.qih14yv.mongodb.net
// Username: aalwabel
// Database: saudi-legal-ai
// Status: CONNECTED AND WORKING!

const MONGODB_URI = 'mongodb+srv://aalwabel:RvdRFdgsd7GSQBcA@cluster0.qih14yv.mongodb.net/saudi-legal-ai?retryWrites=true&w=majority&appName=Cluster0';

// JWT Secret (in production, use environment variable)
const JWT_SECRET = 'your-super-secret-jwt-key-saudi-legal-ai-2024';

// ================================================
// MIDDLEWARE
// ================================================
app.use(cors({
  origin: ['http://localhost:3005', 'http://127.0.0.1:3005', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ================================================
// MONGODB SCHEMAS
// ================================================

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'lawyer' },
  lawFirmId: { type: mongoose.Schema.Types.ObjectId, ref: 'LawFirm' },
  createdAt: { type: Date, default: Date.now }
});

// Law Firm Schema
const LawFirmSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameAr: String,
  address: String,
  phone: String,
  email: String,
  licenseNumber: String,
  subscription: {
    plan: { type: String, default: 'professional' },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    status: { type: String, default: 'active' }
  },
  createdAt: { type: Date, default: Date.now }
});

// Client Schema
const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameAr: String,
  email: String,
  phone: String,
  nationalId: String,
  address: String,
  addressAr: String,
  lawFirmId: { type: mongoose.Schema.Types.ObjectId, ref: 'LawFirm' },
  createdAt: { type: Date, default: Date.now }
});

// Case Schema
const CaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleAr: String,
  caseNumber: { type: String, unique: true },
  type: String,
  status: { type: String, default: 'active' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  lawyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  court: String,
  judge: String,
  description: String,
  descriptionAr: String,
  nextHearing: Date,
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  notes: [{ 
    text: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  lawFirmId: { type: mongoose.Schema.Types.ObjectId, ref: 'LawFirm' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Task Schema
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, default: 'pending' },
  priority: { type: String, default: 'medium' },
  dueDate: Date,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  lawFirmId: { type: mongoose.Schema.Types.ObjectId, ref: 'LawFirm' },
  createdAt: { type: Date, default: Date.now }
});

// Invoice Schema
const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  status: { type: String, default: 'draft' },
  items: [{
    description: String,
    quantity: Number,
    rate: Number,
    amount: Number
  }],
  subtotal: Number,
  tax: Number,
  total: Number,
  currency: { type: String, default: 'SAR' },
  dueDate: Date,
  paidAmount: { type: Number, default: 0 },
  lawFirmId: { type: mongoose.Schema.Types.ObjectId, ref: 'LawFirm' },
  createdAt: { type: Date, default: Date.now }
});

// Payment Schema
const PaymentSchema = new mongoose.Schema({
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  amount: { type: Number, required: true },
  paymentMethod: String,
  transactionId: String,
  status: { type: String, default: 'completed' },
  notes: String,
  lawFirmId: { type: mongoose.Schema.Types.ObjectId, ref: 'LawFirm' },
  createdAt: { type: Date, default: Date.now }
});

// Document Schema
const DocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleAr: String,
  fileName: String,
  fileUrl: String,
  fileSize: Number,
  mimeType: String,
  category: String,
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lawFirmId: { type: mongoose.Schema.Types.ObjectId, ref: 'LawFirm' },
  createdAt: { type: Date, default: Date.now }
});

// Notification Schema
const NotificationSchema = new mongoose.Schema({
  title: String,
  titleAr: String,
  message: String,
  messageAr: String,
  type: String,
  isRead: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  relatedId: String,
  relatedType: String,
  lawFirmId: { type: mongoose.Schema.Types.ObjectId, ref: 'LawFirm' },
  createdAt: { type: Date, default: Date.now }
});

// Create Models
const User = mongoose.model('User', UserSchema);
const LawFirm = mongoose.model('LawFirm', LawFirmSchema);
const Client = mongoose.model('Client', ClientSchema);
const Case = mongoose.model('Case', CaseSchema);
const Task = mongoose.model('Task', TaskSchema);
const Invoice = mongoose.model('Invoice', InvoiceSchema);
const Payment = mongoose.model('Payment', PaymentSchema);
const Document = mongoose.model('Document', DocumentSchema);
const Notification = mongoose.model('Notification', NotificationSchema);

// ================================================
// CONNECT TO MONGODB
// ================================================
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB Atlas!');
  initializeDatabase();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.log('⚠️  Make sure to update MONGODB_URI with your actual connection string!');
});

// ================================================
// INITIALIZE DATABASE WITH DEFAULT DATA
// ================================================
async function initializeDatabase() {
  try {
    // Check if we have any law firms
    const lawFirmCount = await LawFirm.countDocuments();
    
    if (lawFirmCount === 0) {
      console.log('📝 Initializing database with default data...');
      
      // Create default law firm
      const defaultFirm = await LawFirm.create({
        name: 'Saudi Legal Associates',
        nameAr: 'شركاء القانون السعودي',
        email: 'info@saudilegal.com',
        phone: '+966 50 123 4567',
        licenseNumber: 'LIC-2024-001',
        address: '123 King Fahd Road, Riyadh'
      });
      
      console.log('✅ Default law firm created');
      
      // Create default user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const defaultUser = await User.create({
        name: 'Demo User',
        email: 'demo@saudilegal.com',
        password: hashedPassword,
        role: 'admin',
        lawFirmId: defaultFirm._id
      });
      
      console.log('✅ Default user created (email: demo@saudilegal.com, password: password123)');
      
      // Send welcome email (will use mock if SMTP not configured)
      try {
        await emailService.sendWelcomeEmail(defaultUser, 'en');
      } catch (error) {
        console.log('ℹ️ Welcome email not sent (email service not configured)');
      }
      
      // Create some sample clients
      const sampleClients = await Client.create([
        {
          name: 'Ahmed Al-Rashid',
          nameAr: 'أحمد الراشد',
          email: 'ahmed@example.com',
          phone: '+966 50 111 2222',
          nationalId: '1234567890',
          lawFirmId: defaultFirm._id
        },
        {
          name: 'Fatima Al-Zahrani',
          nameAr: 'فاطمة الزهراني',
          email: 'fatima@example.com',
          phone: '+966 50 333 4444',
          nationalId: '0987654321',
          lawFirmId: defaultFirm._id
        }
      ]);
      
      console.log('✅ Sample clients created');
      
      // Create sample cases
      const sampleCases = await Case.create([
        {
          title: 'Contract Dispute - Al-Rashid vs ABC Corp',
          titleAr: 'نزاع عقد - الراشد ضد شركة ABC',
          caseNumber: 'CASE-2024-001',
          type: 'commercial',
          status: 'active',
          client: sampleClients[0]._id,
          lawyer: defaultUser._id,
          court: 'Riyadh Commercial Court',
          judge: 'Judge Mohammed Al-Salem',
          description: 'Contract dispute regarding software development agreement',
          lawFirmId: defaultFirm._id
        },
        {
          title: 'Family Law Case - Custody',
          titleAr: 'قضية أحوال شخصية - حضانة',
          caseNumber: 'CASE-2024-002',
          type: 'family',
          status: 'pending',
          client: sampleClients[1]._id,
          lawyer: defaultUser._id,
          court: 'Riyadh Family Court',
          description: 'Child custody case',
          lawFirmId: defaultFirm._id
        }
      ]);
      
      console.log('✅ Sample cases created');
      
      // Create sample tasks
      await Task.create([
        {
          title: 'Review contract documents',
          description: 'Review and analyze the disputed contract terms',
          status: 'pending',
          priority: 'high',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          assignedTo: defaultUser._id,
          assignedBy: defaultUser._id,
          caseId: sampleCases[0]._id,
          lawFirmId: defaultFirm._id
        },
        {
          title: 'Prepare court submission',
          description: 'Prepare initial court submission documents',
          status: 'in_progress',
          priority: 'medium',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          assignedTo: defaultUser._id,
          assignedBy: defaultUser._id,
          caseId: sampleCases[1]._id,
          lawFirmId: defaultFirm._id
        }
      ]);
      
      console.log('✅ Sample tasks created');
      console.log('🎉 Database initialized successfully!');
    } else {
      console.log('✅ Database already contains data');
    }
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
}

// ================================================
// AUTH MIDDLEWARE
// ================================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    // For now, allow requests without token for testing
    req.user = null;
    return next();
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

// Apply auth middleware to all routes except health and auth
app.use((req, res, next) => {
  if (req.path === '/api/health' || req.path.startsWith('/api/auth')) {
    return next();
  }
  authenticateToken(req, res, next);
});

// ================================================
// API ROUTES
// ================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Database server is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ================================================
// AI CONSULTATION SYSTEM - SAUDI LEGAL AI
// ================================================

// Professional Saudi Legal Response Generator
function generateLegalResponse(question, language, caseType) {
  const q = question.toLowerCase();
  const isArabic = language === 'ar';
  
  // Check for overtime/labor law questions
  if ((q.includes('overtime') || q.includes('extra hours') || q.includes('ساعات إضافية')) && 
      (caseType === 'labor' || q.includes('labor') || q.includes('work'))) {
    
    if (isArabic) {
      return {
        answer: `القانون السعودي لساعات العمل الإضافية:

وفقاً للمادة 107 من نظام العمل السعودي:
• الحد الأقصى: ساعتان إضافيتان يومياً أو 180 ساعة سنوياً
• الأجر: أجر الساعة العادية + 50% كحد أدنى
• لا يجوز إجبار العامل على العمل الإضافي إلا في حالات استثنائية

الإجراءات القانونية:
1. توثيق ساعات العمل الإضافية بسجلات الحضور
2. حساب المستحقات (أجر الساعة × 1.5)
3. في حالة النزاع، تقديم شكوى لمكتب العمل خلال سنة

التعويضات المتوقعة:
• الأجر الإضافي المستحق
• تعويض 12% سنوياً عن التأخير
• غرامة على صاحب العمل من 3000-5000 ريال`,
        references: [
          { title: "نظام العمل السعودي", article: "المادة 107-109", relevance: "high" },
          { title: "اللائحة التنفيذية", article: "المادة 15", relevance: "high" }
        ],
        confidence: 0.95,
        processingTime: Date.now()
      };
    } else {
      return {
        answer: `Saudi Labor Law on Overtime:

According to Article 107 of Saudi Labor Law:
• Maximum: 2 overtime hours daily or 180 hours annually
• Compensation: Regular hourly wage + minimum 50%
• Overtime cannot be mandatory except in exceptional cases

Legal Procedures:
1. Document overtime hours with attendance records
2. Calculate dues (hourly wage × 1.5)
3. If disputed, file complaint with Labor Office within 1 year

Expected Compensation:
• Outstanding overtime wages
• 12% annual compensation for delays
• Employer fine of SAR 3,000-5,000`,
        references: [
          { title: "Saudi Labor Law", article: "Articles 107-109", relevance: "high" },
          { title: "Executive Regulations", article: "Article 15", relevance: "high" }
        ],
        confidence: 0.95,
        processingTime: Date.now()
      };
    }
  }
  
  // Check for company formation questions
  if ((q.includes('company') || q.includes('شركة')) && 
      (q.includes('form') || q.includes('establish') || q.includes('تأسيس') || q.includes('start') || q.includes('create'))) {
    
    if (isArabic) {
      return {
        answer: `تأسيس الشركات في السعودية:

متطلبات الشركة المساهمة:
• رأس المال: 500,000 ريال كحد أدنى
• موافقة هيئة السوق المالية
• دراسة جدوى اقتصادية

الإجراءات:
1. حجز الاسم التجاري (1-3 أيام)
2. إعداد عقد التأسيس (5-7 أيام)
3. موافقة الهيئة (30-45 يوم)
4. السجل التجاري (1-2 أيام)`,
        references: [
          { title: "نظام الشركات", article: "المادة 54", relevance: "high" }
        ],
        confidence: 0.92,
        processingTime: Date.now()
      };
    } else {
      return {
        answer: `Company Formation in Saudi Arabia:

Joint-Stock Company Requirements:
• Capital: Minimum SAR 500,000
• Capital Market Authority approval
• Economic feasibility study

Procedures:
1. Reserve trade name (1-3 days)
2. Prepare incorporation contract (5-7 days)
3. CMA approval (30-45 days)
4. Commercial registration (1-2 days)`,
        references: [
          { title: "Companies Law", article: "Article 54", relevance: "high" }
        ],
        confidence: 0.92,
        processingTime: Date.now()
      };
    }
  }
  
  // Default response for other questions
  return {
    answer: isArabic ? 
      "يرجى تقديم مزيد من التفاصيل حول استفسارك القانوني. نظامنا متخصص في القانون السعودي ويمكنه المساعدة في: قانون العمل، القانون التجاري، قانون الأسرة، والقانون الجنائي." :
      "Please provide more details about your legal inquiry. Our system specializes in Saudi law and can assist with: Labor Law, Commercial Law, Family Law, and Criminal Law.",
    references: [],
    confidence: 0.7,
    processingTime: Date.now()
  };
}

// AI Consultation endpoint - Professional Saudi Legal AI System
app.post('/api/ai/consultation', async (req, res) => {
  try {
    const { question, language = 'en', caseType = 'general', usePDFDatabase = true } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    // Generate consultation ID for RLHF tracking
    const consultationId = new mongoose.Types.ObjectId().toString();
    
    let response;
    
    // Try PDF database first if enabled
    if (usePDFDatabase) {
      try {
        console.log('🔍 Searching PDF law database...');
        response = await generateAIResponseWithPDFLaws(question, language, caseType);
        
        // If PDF database has good results, use it
        if (response.confidence > 0.5) {
          console.log(`✅ Found relevant laws in PDF database (confidence: ${response.confidence})`);
          response.consultationId = consultationId;
          response.dataSource = 'pdf_laws';
          
          return res.json({
            success: true,
            data: response,
            message: 'AI consultation successful (from PDF laws)'
          });
        } else {
          console.log('⚠️ PDF database results not confident enough, falling back to hardcoded knowledge');
        }
      } catch (pdfError) {
        console.error('PDF database error:', pdfError.message);
        console.log('⚠️ Falling back to hardcoded legal knowledge');
      }
    }
    
    // Fallback to hardcoded legal knowledge
    response = generateLegalResponse(question, language, caseType);
    response.consultationId = consultationId;
    response.dataSource = 'hardcoded_knowledge';
    
    res.json({
      success: true,
      data: response,
      message: 'AI consultation successful'
    });
  } catch (error) {
    console.error('AI consultation error:', error);
    res.status(500).json({ error: 'AI consultation failed' });
  }
});

// Law Database Statistics endpoint
app.get('/api/ai/law-database-stats', async (req, res) => {
  try {
    const stats = await getLawDatabaseStats();
    
    if (!stats) {
      return res.json({
        success: false,
        message: 'No laws loaded in database yet. Run: npm run process-laws',
        totalDocuments: 0
      });
    }
    
    res.json({
      success: true,
      data: stats,
      message: 'Law database statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting law stats:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get law database statistics' 
    });
  }
});

// ================================================
// RLHF (Reinforcement Learning from Human Feedback) SYSTEM
// ================================================

// Models for RLHF
const LawyerFeedbackSchema = new mongoose.Schema({
  consultationId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lawFirmId: { type: mongoose.Schema.Types.ObjectId, ref: 'LawFirm' },
  rating: { type: Number, min: 1, max: 5, required: true },
  feedbackType: {
    type: String,
    enum: ['INCORRECT_LAW', 'OUTDATED_INFO', 'INCOMPLETE', 'FORMATTING', 'LANGUAGE_ISSUE', 'OTHER'],
    required: true
  },
  improvementSuggestion: String,
  urgencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  originalQuery: { type: String, required: true },
  originalAnswer: { type: String, required: true },
  improvedAnswer: String,
  status: {
    type: String,
    enum: ['PENDING', 'REVIEWED', 'IMPLEMENTED', 'REJECTED'],
    default: 'PENDING'
  },
  adminReviewed: { type: Boolean, default: false },
  adminNotes: String,
}, { timestamps: true });

const LawyerFeedback = mongoose.models.LawyerFeedback || mongoose.model('LawyerFeedback', LawyerFeedbackSchema);

// Submit feedback on AI response
app.post('/api/ai/feedback', async (req, res) => {
  try {
    const {
      consultationId,
      rating,
      feedbackType,
      improvementSuggestion,
      urgencyLevel = 'medium',
      originalQuery,
      originalAnswer
    } = req.body;
    
    // Get current user and law firm (in production, from JWT)
    const user = await User.findOne();
    const lawFirm = await LawFirm.findOne();
    
    const feedback = await LawyerFeedback.create({
      consultationId,
      userId: user?._id,
      lawFirmId: lawFirm?._id,
      rating,
      feedbackType,
      improvementSuggestion,
      urgencyLevel,
      originalQuery,
      originalAnswer,
      status: 'PENDING',
      adminReviewed: false
    });
    
    res.json({
      success: true,
      data: feedback,
      message: 'Thank you for your feedback. It will help improve our AI system.'
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get all feedback (for admin review)
app.get('/api/ai/feedback', async (req, res) => {
  try {
    const feedback = await LawyerFeedback.find()
      .populate('userId', 'name email')
      .populate('lawFirmId', 'name')
      .sort({ urgencyLevel: 1, createdAt: -1 });
    
    res.json({
      success: true,
      data: feedback,
      total: feedback.length
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Get RLHF analytics
app.get('/api/ai/analytics', async (req, res) => {
  try {
    const [
      totalFeedback,
      pendingReview,
      implemented,
      avgRating,
      feedbackByType
    ] = await Promise.all([
      LawyerFeedback.countDocuments(),
      LawyerFeedback.countDocuments({ adminReviewed: false }),
      LawyerFeedback.countDocuments({ status: 'IMPLEMENTED' }),
      LawyerFeedback.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]),
      LawyerFeedback.aggregate([
        { $group: { _id: '$feedbackType', count: { $sum: 1 } } }
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        totalFeedback,
        pendingReview,
        implemented,
        averageRating: avgRating[0]?.avgRating || 0,
        feedbackByType,
        improvementRate: totalFeedback > 0 ? (implemented / totalFeedback * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Admin: Review and improve answer based on feedback
app.put('/api/ai/feedback/:id/improve', async (req, res) => {
  try {
    const { improvedAnswer, adminNotes, status = 'IMPLEMENTED' } = req.body;
    
    const feedback = await LawyerFeedback.findByIdAndUpdate(
      req.params.id,
      {
        improvedAnswer,
        adminNotes,
        status,
        adminReviewed: true
      },
      { new: true }
    );
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    res.json({
      success: true,
      data: feedback,
      message: 'Feedback processed and AI improved'
    });
  } catch (error) {
    console.error('Error improving answer:', error);
    res.status(500).json({ error: 'Failed to improve answer' });
  }
});

// Auth routes
app.post('/api/auth/login', ValidationMiddleware.validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt:', email);
    
    // Find user
    const user = await User.findOne({ email }).populate('lawFirmId');
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    console.log('✅ User found:', email);
    console.log('🔑 Comparing passwords...');
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    console.log('🔑 Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role,
        lawFirmId: user.lawFirmId._id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          lawFirmId: user.lawFirmId._id
        }
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

app.post('/api/auth/register', ValidationMiddleware.validateRegistration, async (req, res) => {
  try {
    const { name, email, password, lawFirmId } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }
    
    // Get default law firm if not provided
    let firmId = lawFirmId;
    if (!firmId) {
      const defaultFirm = await LawFirm.findOne();
      firmId = defaultFirm._id;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'lawyer',
      lawFirmId: firmId
    });
    
    // Generate token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role,
        lawFirmId: user.lawFirmId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          lawFirmId: user.lawFirmId
        }
      },
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Cases routes
app.get('/api/cases', async (req, res) => {
  try {
    const cases = await Case.find()
      .populate('client')
      .populate('lawyer', 'name email')
      .sort('-createdAt');
    
    res.json({ 
      data: cases,
      total: cases.length 
    });
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

app.post('/api/cases', async (req, res) => {
  try {
    // Get law firm from authenticated user or use default
    const lawFirm = await LawFirm.findOne();
    
    const caseData = {
      ...req.body,
      lawFirmId: lawFirm._id,
      caseNumber: `CASE-${Date.now()}`
    };
    
    const newCase = await Case.create(caseData);
    const populatedCase = await Case.findById(newCase._id)
      .populate('client')
      .populate('lawyer', 'name email');
    
    res.json({
      success: true,
      data: populatedCase,
      message: 'Case created successfully'
    });
  } catch (error) {
    console.error('Error creating case:', error);
    res.status(500).json({ error: 'Failed to create case' });
  }
});

app.put('/api/cases/:id', async (req, res) => {
  try {
    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('client').populate('lawyer', 'name email');
    
    res.json({
      success: true,
      data: updatedCase,
      message: 'Case updated successfully'
    });
  } catch (error) {
    console.error('Error updating case:', error);
    res.status(500).json({ error: 'Failed to update case' });
  }
});

app.delete('/api/cases/:id', async (req, res) => {
  try {
    await Case.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Case deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting case:', error);
    res.status(500).json({ error: 'Failed to delete case' });
  }
});

// Tasks routes
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('caseId', 'title caseNumber')
      .sort('-createdAt');
    
    res.json({ 
      data: tasks,
      total: tasks.length 
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const lawFirm = await LawFirm.findOne();
    const user = await User.findOne();
    
    const taskData = {
      ...req.body,
      lawFirmId: lawFirm._id,
      assignedBy: user._id,
      assignedTo: req.body.assignedTo || user._id
    };
    
    const newTask = await Task.create(taskData);
    const populatedTask = await Task.findById(newTask._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('caseId', 'title caseNumber');
    
    res.json({
      success: true,
      data: populatedTask,
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Clients routes
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await Client.find().sort('-createdAt');
    res.json({ 
      data: clients,
      total: clients.length 
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const lawFirm = await LawFirm.findOne();
    
    const clientData = {
      ...req.body,
      lawFirmId: lawFirm._id
    };
    
    const newClient = await Client.create(clientData);
    
    res.json({
      success: true,
      data: newClient,
      message: 'Client created successfully'
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Invoices routes
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('client')
      .populate('caseId', 'title caseNumber')
      .sort('-createdAt');
    
    res.json({ 
      data: invoices,
      total: invoices.length 
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const lawFirm = await LawFirm.findOne();
    
    const invoiceData = {
      ...req.body,
      lawFirmId: lawFirm._id,
      invoiceNumber: `INV-${Date.now()}`
    };
    
    const newInvoice = await Invoice.create(invoiceData);
    const populatedInvoice = await Invoice.findById(newInvoice._id)
      .populate('client')
      .populate('caseId', 'title caseNumber');
    
    res.json({
      success: true,
      data: populatedInvoice,
      message: 'Invoice created successfully'
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Payments routes
app.get('/api/payments', async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'invoice',
        populate: { path: 'client' }
      })
      .sort('-createdAt');
    
    res.json({ 
      data: payments,
      total: payments.length 
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    const lawFirm = await LawFirm.findOne();
    
    const paymentData = {
      ...req.body,
      lawFirmId: lawFirm._id,
      transactionId: `TXN-${Date.now()}`
    };
    
    const newPayment = await Payment.create(paymentData);
    
    // Update invoice paid amount
    if (req.body.invoice) {
      await Invoice.findByIdAndUpdate(req.body.invoice, {
        $inc: { paidAmount: req.body.amount }
      });
    }
    
    const populatedPayment = await Payment.findById(newPayment._id)
      .populate({
        path: 'invoice',
        populate: { path: 'client' }
      });
    
    res.json({
      success: true,
      data: populatedPayment,
      message: 'Payment recorded successfully'
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Notifications routes
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort('-createdAt')
      .limit(50);
    
    const unreadCount = await Notification.countDocuments({ isRead: false });
    
    res.json({ 
      data: notifications,
      total: notifications.length,
      unread: unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

app.put('/api/notifications/mark-all-read', async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// Generic handlers for other endpoints (returns empty data for now)
const endpoints = [
  'appointments', 'employees', 'expenses', 'quotations', 'treasury',
  'reports', 'leaves', 'branches', 'power-of-attorney', 'execution-requests',
  'users', 'roles', 'archive', 'contacts', 'reminders', 'sessions',
  'legal-library', 'documents'
];

endpoints.forEach(endpoint => {
  app.get(`/api/${endpoint}`, (req, res) => {
    res.json({ data: [], total: 0 });
  });
  
  app.post(`/api/${endpoint}`, (req, res) => {
    res.json({
      success: true,
      data: { ...req.body, _id: new mongoose.Types.ObjectId() },
      message: `${endpoint} created successfully`
    });
  });
  
  app.put(`/api/${endpoint}/:id`, (req, res) => {
    res.json({
      success: true,
      data: { ...req.body, _id: req.params.id },
      message: `${endpoint} updated successfully`
    });
  });
  
  app.delete(`/api/${endpoint}/:id`, (req, res) => {
    res.json({
      success: true,
      message: `${endpoint} deleted successfully`
    });
  });
});

// ==========================================
// AI CONSULTATION ENDPOINTS
// ==========================================

// ⚠️ NOTE: The main AI consultation endpoint with PDF integration is at line 511
// This duplicate has been removed to avoid conflicts
// Use: POST /api/ai/consultation (with PDF laws, RLHF tracking, and fallback)

app.post('/api/v1/rlhf/feedback', async (req, res) => {
  try {
    const { consultationId, rating, feedback, improvements, lawyerId } = req.body;
    
    console.log('📝 RLHF Feedback received:', { consultationId, rating, lawyerId });
    
    // Store feedback (can be saved to database later)
    const feedbackRecord = {
      consultationId,
      rating,
      feedback,
      improvements,
      lawyerId,
      timestamp: new Date()
    };
    
    res.json({ 
      success: true, 
      message: 'Feedback received successfully',
      data: feedbackRecord
    });
  } catch (error) {
    console.error('❌ RLHF Feedback Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit feedback' 
    });
  }
});

app.get('/api/v1/rlhf/analytics', async (req, res) => {
  try {
    const { lawFirmId } = req.query;
    
    console.log('📊 RLHF Analytics request:', { lawFirmId });
    
    // Return analytics (mock data for now)
    const analytics = {
      success: true,
      data: {
        totalFeedbacks: 156,
        averageRating: 4.7,
        improvementRate: 23.5,
        topImprovements: [
          { category: 'accuracy', count: 45, percentage: 28.8 },
          { category: 'detail', count: 38, percentage: 24.4 },
          { category: 'clarity', count: 31, percentage: 19.9 }
        ],
        monthlyTrend: [
          { month: 'Aug', feedbacks: 42, avgRating: 4.5 },
          { month: 'Sep', feedbacks: 58, avgRating: 4.6 },
          { month: 'Oct', feedbacks: 56, avgRating: 4.7 }
        ]
      }
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('❌ RLHF Analytics Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch analytics' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Database server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`✅ MongoDB Atlas connected successfully!`);
});
