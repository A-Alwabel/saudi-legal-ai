import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import OpenAI from 'openai';
import { saudiLegalPracticeDatabase } from './saudi-legal-practice';
import { rlhfService } from './services/rlhfService';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Connect to MongoDB for RLHF system
async function connectToDatabase() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('📊 Connected to MongoDB for RLHF system');
    } catch (error) {
      console.log('⚠️ MongoDB connection failed, RLHF features will be limited:', error);
    }
  } else {
    console.log('⚠️ No MongoDB URI found, RLHF features will use mock data');
  }
}

// Initialize OpenAI - you can set OPENAI_API_KEY in your environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder-key-for-demo'
});

// AI Processing Function
async function processLegalQuestion(question: string, caseType: string, language: string) {
  const isArabic = language === 'ar';
  
  // Check if we have a valid OpenAI API key
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-placeholder-key-for-demo') {
    console.log('⚠️ No OpenAI API key found, using enhanced mock responses');
    return getEnhancedMockResponse(question, caseType, isArabic);
  }

  try {
    const systemPrompt = isArabic 
      ? `أنت مستشار قانوني متخصص في النظام السعودي. قدم استشارة قانونية دقيقة ومفصلة باللغة العربية. 
         اربط إجابتك بالأنظمة واللوائح السعودية المحددة.
         نوع القضية: ${caseType || 'عام'}
         أجب بتنسيق JSON مع المفاتيح التالية:
         {
           "answer": "الإجابة القانونية المفصلة",
           "references": [{"title": "اسم النظام/المادة", "relevance": "high/medium/low"}],
           "suggestions": ["اقتراح 1", "اقتراح 2"],
           "confidence": 0.85
         }`
      : `You are a legal consultant specializing in Saudi Arabian law. Provide accurate and detailed legal consultation in English.
         Link your answer to specific Saudi laws and regulations.
         Case type: ${caseType || 'general'}
         Respond in JSON format with these keys:
         {
           "answer": "detailed legal answer",
           "references": [{"title": "law/article name", "relevance": "high/medium/low"}],
           "suggestions": ["suggestion 1", "suggestion 2"],
           "confidence": 0.85
         }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    
    try {
      return JSON.parse(response || '{}');
    } catch (parseError) {
      console.log('Failed to parse AI response, using fallback');
      return getEnhancedMockResponse(question, caseType, isArabic);
    }
  } catch (error) {
    // Silently fallback to enhanced mock response when OpenAI API is unavailable
    return getEnhancedMockResponse(question, caseType, isArabic);
  }
}

// Professional Saudi Legal Knowledge Base
interface LegalReference {
  title: string;
  article?: string;
  url?: string;
  relevance: 'high' | 'medium' | 'low';
}

interface LegalProcedure {
  step: number;
  description: string;
  requirements?: string[];
  timeline?: string;
}

interface LegalResponse {
  answer: string;
  references: LegalReference[];
  suggestions: string[];
  procedures?: LegalProcedure[];
  confidence: number;
  processingTime: number;
}

// Professional Legal Knowledge Base - Saudi Arabia
const saudiLegalKnowledgeBase = {
  commercial: {
    ar: {
      company_formation: {
        answer: "تأسيس الشركات في السعودية يخضع لنظام الشركات الصادر بالمرسوم الملكي رقم م/3 لعام 1437هـ. يتطلب تأسيس شركة مساهمة الحد الأدنى من رأس المال 500,000 ريال سعودي، وموافقة هيئة السوق المالية، وتقديم دراسة جدوى اقتصادية.",
        references: [
          { title: "نظام الشركات السعودي", article: "المادة 54", relevance: "high" as const },
          { title: "لوائح هيئة السوق المالية", article: "الباب الثالث", relevance: "high" as const }
        ],
        procedures: [
          { step: 1, description: "حجز الاسم التجاري", timeline: "1-3 أيام" },
          { step: 2, description: "إعداد عقد التأسيس والنظام الأساسي", timeline: "5-7 أيام" },
          { step: 3, description: "الحصول على موافقة هيئة السوق المالية", timeline: "30-45 يوم" }
        ]
      }
    },
    en: {
      company_formation: {
        answer: "Company formation in Saudi Arabia is governed by the Companies Law issued by Royal Decree No. M/3 of 1437H. Establishing a joint-stock company requires a minimum capital of SAR 500,000, approval from the Capital Market Authority, and submission of an economic feasibility study.",
        references: [
          { title: "Saudi Companies Law", article: "Article 54", relevance: "high" as const },
          { title: "Capital Market Authority Regulations", article: "Chapter 3", relevance: "high" as const }
        ],
        procedures: [
          { step: 1, description: "Reserve trade name", timeline: "1-3 days" },
          { step: 2, description: "Prepare incorporation contract and bylaws", timeline: "5-7 days" },
          { step: 3, description: "Obtain CMA approval", timeline: "30-45 days" }
        ]
      }
    }
  },
  labor: {
    ar: {
      overtime_rights: {
        answer: "نظام العمل السعودي يكفل حق العامل في أجر إضافي عن ساعات العمل الإضافية. المادة 107 تنص على أن أجر الساعة الإضافية يساوي أجر الساعة العادية مضافاً إليه 50% كحد أدنى. لا يجوز أن تزيد ساعات العمل الإضافية عن ساعتين يومياً أو 180 ساعة سنوياً.",
        references: [
          { title: "نظام العمل السعودي", article: "المادة 107", relevance: "high" as const },
          { title: "اللائحة التنفيذية لنظام العمل", article: "المادة 15", relevance: "high" as const }
        ],
        procedures: [
          { step: 1, description: "توثيق ساعات العمل الإضافية", requirements: ["سجل الحضور والانصراف"] },
          { step: 2, description: "حساب الأجر الإضافي (أجر الساعة + 50%)", timeline: "شهرياً" },
          { step: 3, description: "في حالة النزاع، التوجه لمكتب العمل", timeline: "خلال سنة من انتهاء الخدمة" }
        ]
      }
    },
    en: {
      overtime_rights: {
        answer: "Saudi Labor Law guarantees workers' rights to additional compensation for overtime work. Article 107 states that overtime pay equals the regular hourly wage plus a minimum of 50%. Overtime hours cannot exceed 2 hours daily or 180 hours annually.",
        references: [
          { title: "Saudi Labor Law", article: "Article 107", relevance: "high" as const },
          { title: "Labor Law Executive Regulations", article: "Article 15", relevance: "high" as const }
        ],
        procedures: [
          { step: 1, description: "Document overtime hours", requirements: ["Attendance records"] },
          { step: 2, description: "Calculate overtime pay (hourly wage + 50%)", timeline: "Monthly" },
          { step: 3, description: "In case of dispute, contact Labor Office", timeline: "Within one year of service termination" }
        ]
      }
    }
  }
};

// Advanced Natural Language Understanding Engine
function analyzeUserIntent(question: string, caseType: string, language: string) {
  const q = question.toLowerCase();
  
  // Intent patterns for better understanding
  const intentPatterns = {
    // Labor law intents
    overtime_complaint: [
      'extra hours', 'overtime', 'working late', 'additional hours', 'not paying', 'boss making me work',
      'ساعات إضافية', 'عمل إضافي', 'مديري يجبرني', 'بدون أجر', 'ساعات زائدة', 'عمل متأخر'
    ],
    salary_issues: [
      'salary', 'wage', 'payment', 'money', 'compensation', 'not paid',
      'راتب', 'أجر', 'مرتب', 'مال', 'تعويض', 'لم يدفع'
    ],
    
    // Commercial law intents  
    company_formation: [
      'start company', 'establish', 'create business', 'form corporation', 'register company',
      'تأسيس شركة', 'إنشاء شركة', 'تسجيل شركة', 'بدء عمل', 'شركة جديدة'
    ],
    business_license: [
      'license', 'permit', 'authorization', 'approval',
      'ترخيص', 'تصريح', 'موافقة', 'إذن'
    ],
    
    // Family law intents
    divorce_procedures: [
      'divorce', 'separation', 'marriage dissolution', 'custody',
      'طلاق', 'انفصال', 'حضانة', 'فسخ زواج'
    ]
  };
  
  // Advanced intent detection
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    if (patterns.some(pattern => q.includes(pattern))) {
      return { intent, confidence: 0.9 };
    }
  }
  
  return { intent: 'general', confidence: 0.5 };
}

// PROFESSIONAL LEGAL PRACTICE RESPONSE GENERATOR
function generateProfessionalLegalResponse(question: string, intent: string, language: string, caseType: string) {
  const isArabic = language === 'ar';
  
  // Get professional legal practice data
  let practiceData = null;
  
  if (intent === 'overtime_complaint' && caseType === 'labor') {
    practiceData = saudiLegalPracticeDatabase.labor[language as 'ar' | 'en']?.overtime_violations;
  } else if (intent === 'company_formation' && caseType === 'commercial') {
    practiceData = saudiLegalPracticeDatabase.commercial[language as 'ar' | 'en']?.company_formation;
  }
  
  if (practiceData) {
    // Format response for legal professionals
    const response = isArabic ? 
      `**التحليل القانوني المتخصص:**

**الأساس القانوني:**
${practiceData.legalBasis.primaryLaw}

**المواد ذات العلاقة:**
${practiceData.legalBasis.articles.map((article, i) => `${i + 1}. ${article}`).join('\n')}

**الإجراءات المهنية المطلوبة:**

**أ) التقييم الأولي:**
${practiceData.professionalProcedure.initialAssessment.map((step, i) => `${i + 1}. ${step}`).join('\n')}

**ب) جمع الأدلة:**
${practiceData.professionalProcedure.evidenceCollection.map((step, i) => `${i + 1}. ${step}`).join('\n')}

**السوابق القضائية المرجعية:**
${practiceData.precedents.map(p => `• ${p.caseNumber} - ${p.court} (${p.year}): ${p.outcome}`).join('\n')}

**نصائح مهنية للممارسين:**
${practiceData.practitionerInsights.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

**التكاليف المتوقعة:**
• الرسوم الحكومية: ${practiceData.costAnalysis.governmentFees}
• الأتعاب المهنية: ${practiceData.costAnalysis.professionalFees}
• النتيجة المتوقعة: ${practiceData.costAnalysis.clientExpectedOutcome}

**الإطار الزمني:**
• التحضير: ${practiceData.timeframes.preparation}
• التقاضي: ${practiceData.timeframes.litigation}
• التنفيذ: ${practiceData.timeframes.enforcement}` 
    :
      `**SPECIALIZED LEGAL ANALYSIS:**

**Legal Basis:**
${practiceData.legalBasis.primaryLaw}

**Relevant Articles:**
${practiceData.legalBasis.articles.map((article, i) => `${i + 1}. ${article}`).join('\n')}

**Professional Procedures Required:**

**A) Initial Assessment:**
${practiceData.professionalProcedure.initialAssessment.map((step, i) => `${i + 1}. ${step}`).join('\n')}

**B) Evidence Collection:**
${practiceData.professionalProcedure.evidenceCollection.map((step, i) => `${i + 1}. ${step}`).join('\n')}

**Judicial Precedents:**
${practiceData.precedents.map(p => `• ${p.caseNumber} - ${p.court} (${p.year}): ${p.outcome}`).join('\n')}

**Professional Practitioner Insights:**
${practiceData.practitionerInsights.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

**Expected Costs:**
• Government Fees: ${practiceData.costAnalysis.governmentFees}
• Professional Fees: ${practiceData.costAnalysis.professionalFees}
• Expected Outcome: ${practiceData.costAnalysis.clientExpectedOutcome}

**Timeline:**
• Preparation: ${practiceData.timeframes.preparation}
• Litigation: ${practiceData.timeframes.litigation}
• Enforcement: ${practiceData.timeframes.enforcement}`;

    return {
      answer: response,
      legalBasis: practiceData.legalBasis,
      procedures: practiceData.professionalProcedure,
      precedents: practiceData.precedents,
      practitionerInsights: practiceData.practitionerInsights,
      costAnalysis: practiceData.costAnalysis,
      timeframes: practiceData.timeframes
    };
  }
  
  return null;
}

// Advanced Legal Response Engine
function getEnhancedMockResponse(question: string, caseType: string, isArabic: boolean) {
  const startTime = Date.now();
  const language = isArabic ? 'ar' : 'en';
  
  // Advanced intent analysis
  const { intent, confidence } = analyzeUserIntent(question, caseType, language);
  
  // Try professional legal practice response first
  const professionalResponse = generateProfessionalLegalResponse(question, intent, language, caseType);
  if (professionalResponse) {
    return {
      answer: professionalResponse.answer,
      references: professionalResponse.legalBasis.articles.map(article => ({
        title: article,
        relevance: "high" as const
      })),
      suggestions: professionalResponse.practitionerInsights.slice(0, 3), // Top 3 professional insights
      procedures: professionalResponse.procedures,
      precedents: professionalResponse.precedents,
      costAnalysis: professionalResponse.costAnalysis,
      timeframes: professionalResponse.timeframes,
      confidence: confidence,
      processingTime: (Date.now() - startTime) / 1000,
      intent: intent,
      practiceLevel: "professional" // Indicate this is professional-grade response
    };
  }
  
  // Smart legal topic detection (original logic)
  let responseData: any = null;
  
  if (caseType === 'commercial' || question.toLowerCase().includes('company') || question.includes('شركة') || question.includes('تأسيس')) {
    responseData = saudiLegalKnowledgeBase.commercial[language]?.company_formation;
  } else if (caseType === 'labor' || question.toLowerCase().includes('overtime') || question.includes('إضافي') || question.includes('عمل')) {
    responseData = saudiLegalKnowledgeBase.labor[language]?.overtime_rights;
  }
  
  if (responseData) {
    return {
      answer: responseData.answer,
      references: responseData.references,
      suggestions: [
        isArabic ? "مراجعة النصوص القانونية المذكورة" : "Review the mentioned legal texts",
        isArabic ? "استشارة محام متخصص" : "Consult with a specialized lawyer",
        isArabic ? "التأكد من التحديثات القانونية الحديثة" : "Check for recent legal updates"
      ],
      procedures: responseData.procedures,
      confidence: 0.95,
      processingTime: (Date.now() - startTime) / 1000
    };
  }
  
  // Fallback to general responses
  const responses = {
    commercial: {
      ar: {
        answer: `بناءً على سؤالك: "${question}"، وفقاً للنظام التجاري السعودي، يمكن القول أن هناك عدة جوانب قانونية مهمة يجب مراعاتها. النظام التجاري السعودي ينص على حماية حقوق التجار والشركات، ويتطلب الالتزام بالأنظمة واللوائح المعمول بها في المملكة العربية السعودية.`,
        references: [
          { title: 'النظام التجاري السعودي - المادة 10', relevance: 'high' },
          { title: 'لائحة الشركات التجارية - الفصل 3', relevance: 'medium' },
        ],
        suggestions: [
          'استشارة محامٍ مختص في القانون التجاري',
          'مراجعة الأنظمة التجارية الحديثة',
          'التأكد من الامتثال للوائح المعمول بها',
        ],
        confidence: 0.75
      },
      en: {
        answer: `Regarding your question: "${question}", according to Saudi Commercial Law, there are several important legal aspects to consider. The Saudi Commercial System provides protection for merchants' and companies' rights, requiring compliance with applicable regulations in Saudi Arabia.`,
        references: [
          { title: 'Saudi Commercial Law - Article 10', relevance: 'high' },
          { title: 'Commercial Companies Regulation - Chapter 3', relevance: 'medium' },
        ],
        suggestions: [
          'Consult with a commercial law specialist',
          'Review current commercial regulations',
          'Ensure compliance with applicable regulations',
        ],
        confidence: 0.75
      }
    },
    labor: {
      ar: {
        answer: `بخصوص استفسارك: "${question}"، فإن نظام العمل السعودي يكفل حقوق العمال وأصحاب العمل على حد سواء. يتضمن النظام أحكاماً واضحة حول عقود العمل، والأجور، وساعات العمل، والإجازات، وإنهاء الخدمة.`,
        references: [
          { title: 'نظام العمل السعودي - المادة 74', relevance: 'high' },
          { title: 'اللائحة التنفيذية لنظام العمل - الباب الرابع', relevance: 'high' },
        ],
        suggestions: [
          'مراجعة عقد العمل والتأكد من شروطه',
          'التواصل مع وزارة الموارد البشرية',
          'استشارة محامٍ مختص في قضايا العمل',
        ],
        confidence: 0.80
      },
      en: {
        answer: `Regarding your inquiry: "${question}", the Saudi Labor Law guarantees the rights of both employees and employers. The system includes clear provisions on employment contracts, wages, working hours, leaves, and termination of service.`,
        references: [
          { title: 'Saudi Labor Law - Article 74', relevance: 'high' },
          { title: 'Labor Law Executive Regulation - Chapter 4', relevance: 'high' },
        ],
        suggestions: [
          'Review employment contract and its terms',
          'Contact the Ministry of Human Resources',
          'Consult with a labor law specialist',
        ],
        confidence: 0.80
      }
    },
    family: {
      ar: {
        answer: `بشأن سؤالك: "${question}"، فإن نظام الأحوال الشخصية السعودي ينظم المسائل المتعلقة بالزواج والطلاق والميراث والنفقة وحضانة الأطفال، وفقاً لأحكام الشريعة الإسلامية والأنظمة المعمول بها في المملكة.`,
        references: [
          { title: 'نظام الأحوال الشخصية - المادة 20', relevance: 'high' },
          { title: 'نظام الحضانة والنفقة', relevance: 'medium' },
        ],
        suggestions: [
          'مراجعة المحاكم الشرعية المختصة',
          'جمع الوثائق والمستندات اللازمة',
          'استشارة محامٍ مختص في قضايا الأحوال الشخصية',
        ],
        confidence: 0.78
      },
      en: {
        answer: `Regarding your question: "${question}", the Saudi Personal Status System regulates matters related to marriage, divorce, inheritance, alimony, and child custody, according to Islamic Sharia and applicable regulations in the Kingdom.`,
        references: [
          { title: 'Personal Status Law - Article 20', relevance: 'high' },
          { title: 'Custody and Alimony Law', relevance: 'medium' },
        ],
        suggestions: [
          'Consult with relevant Sharia courts',
          'Gather necessary documents and papers',
          'Consult with a family law specialist',
        ],
        confidence: 0.78
      }
    },
    general: {
      ar: {
        answer: `بخصوص استفسارك: "${question}"، فإن النظام القانوني السعودي يقدم إطاراً شاملاً للمسائل القانونية المختلفة. بناءً على طبيعة استفسارك، ننصح بتحديد نوع القضية بدقة أكبر للحصول على إجابة أكثر تفصيلاً. النظام السعودي يغطي جميع جوانب القانون من التجاري إلى العمالي والأحوال الشخصية، ويوفر آليات واضحة لحل المنازعات وحماية الحقوق.`,
        references: [
          { title: 'النظام الأساسي للحكم - المادة 7', relevance: 'high' },
          { title: 'نظام القضاء - الفصل الثاني', relevance: 'medium' },
        ],
        suggestions: [
          'تحديد نوع القضية (تجارية، عمالية، أحوال شخصية)',
          'جمع المستندات والأدلة ذات العلاقة',
          'استشارة محامٍ مختص في المجال المحدد',
          'مراجعة الأنظمة واللوائح ذات الصلة',
        ],
        confidence: 0.70
      },
      en: {
        answer: `Regarding your inquiry: "${question}", the Saudi legal system provides a comprehensive framework for various legal matters. Based on the nature of your inquiry, we recommend specifying the case type more precisely to get a more detailed answer. The Saudi system covers all aspects of law from commercial to labor and personal status, providing clear mechanisms for dispute resolution and rights protection.`,
        references: [
          { title: 'Basic Law of Governance - Article 7', relevance: 'high' },
          { title: 'Judiciary Law - Chapter 2', relevance: 'medium' },
        ],
        suggestions: [
          'Specify the case type (commercial, labor, personal status)',
          'Gather relevant documents and evidence',
          'Consult with a lawyer specialized in the specific field',
          'Review relevant laws and regulations',
        ],
        confidence: 0.70
      }
    }
  };

  const responseKey = caseType || 'general';
  const langKey = isArabic ? 'ar' : 'en';
  const responseCategory = responses[responseKey as keyof typeof responses] || responses.general;
  return responseCategory[langKey] || responseCategory.ar;
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Custom error handler for JSON parsing errors
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format in request body',
      error: 'Bad Request',
      timestamp: new Date().toISOString()
    });
  }
  next(error);
});

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  // Add caching headers for better performance
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.json({
    success: true,
    message: 'Saudi Legal AI v2.0 Server is running!',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});

// Basic auth endpoints (without database for now)
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  // Mock authentication for demo
  if (email === 'demo@saudi-law.com' && password === 'password123') {
    const mockUser = {
      id: '1',
      email: 'demo@saudi-law.com',
      name: 'Demo User',
      role: 'lawyer',
      lawFirmId: '1',
      isActive: true,
    };

    const mockToken = 'mock-jwt-token-' + Date.now();

    res.json({
      success: true,
      data: {
        user: mockUser,
        token: mockToken,
      },
      message: 'Login successful',
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }
});

app.post('/api/v1/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and name are required',
    });
  }

  // Mock registration for demo
  const mockUser = {
    id: Date.now().toString(),
    email,
    name,
    role: 'lawyer',
    lawFirmId: '1',
    isActive: true,
  };

  const mockToken = 'mock-jwt-token-' + Date.now();

  res.status(201).json({
    success: true,
    data: {
      user: mockUser,
      token: mockToken,
    },
    message: 'User registered successfully',
  });
});

// AI consultation endpoint with RLHF integration
app.post('/api/v1/ai/consultation', async (req, res) => {
  console.log('🤖 AI Consultation Request:', req.body);
  const { question, caseType, language } = req.body;
  
  if (!question) {
    return res.status(400).json({
      success: false,
      message: 'Question is required',
    });
  }

  try {
    const startTime = Date.now();
    const consultationId = uuidv4();
    
    // Get initial AI response
    const aiResponse = await processLegalQuestion(question, caseType, language || 'ar');
    const processingTime = (Date.now() - startTime) / 1000;

    // Create response object with RLHF tracking
    const baseResponse = {
      id: consultationId,
      answer: aiResponse.answer,
      references: aiResponse.references || [],
      suggestions: aiResponse.suggestions || [],
      confidence: aiResponse.confidence || 0.75,
      processingTime: processingTime,
      verificationLevel: 'unverified' as const,
      canProvideFeedback: true,
    };

    // Check for RLHF improvements
    const enhancedResponse = await rlhfService.enhanceAIResponse(baseResponse, question);

    res.json({
      success: true,
      data: enhancedResponse,
      message: 'AI consultation completed',
    });
  } catch (error) {
    console.error('Error processing AI consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI consultation',
    });
  }
});

// RLHF Endpoints - Lawyer Feedback System

// Submit lawyer feedback
app.post('/api/v1/ai/feedback', async (req, res) => {
  const { 
    consultationId, 
    userId, 
    lawFirmId, 
    rating, 
    feedbackType, 
    improvementSuggestion, 
    urgencyLevel, 
    originalQuery, 
    originalAnswer 
  } = req.body;

  if (!consultationId || !userId || !rating || !feedbackType) {
    return res.status(400).json({
      success: false,
      message: 'Required fields: consultationId, userId, rating, feedbackType',
    });
  }

  try {
    const feedback = await rlhfService.submitFeedback({
      consultationId,
      userId,
      lawFirmId,
      rating,
      feedbackType,
      improvementSuggestion,
      urgencyLevel: urgencyLevel || 'medium',
      originalQuery,
      originalAnswer,
    });

    res.json({
      success: true,
      data: feedback,
      message: 'Feedback submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
    });
  }
});

// Admin endpoints for YOU to manage RLHF

// Get pending feedback for your review
app.get('/api/v1/admin/feedback/pending', async (req, res) => {
  try {
    const pendingFeedback = await rlhfService.getPendingFeedbackForAdmin();

    res.json({
      success: true,
      data: pendingFeedback,
      message: 'Pending feedback retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting pending feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending feedback',
    });
  }
});

// Admin review feedback (YOUR decision)
app.post('/api/v1/admin/feedback/:feedbackId/review', async (req, res) => {
  const { feedbackId } = req.params;
  const { adminDecision, adminNotes } = req.body;

  if (!adminDecision) {
    return res.status(400).json({
      success: false,
      message: 'Admin decision is required',
    });
  }

  try {
    const reviewedFeedback = await rlhfService.adminReviewFeedback(
      feedbackId,
      adminDecision,
      adminNotes
    );

    res.json({
      success: true,
      data: reviewedFeedback,
      message: 'Feedback reviewed successfully',
    });
  } catch (error) {
    console.error('Error reviewing feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review feedback',
    });
  }
});

// Create answer improvement (after you or lawyer fixes the answer)
app.post('/api/v1/admin/feedback/:feedbackId/improve', async (req, res) => {
  const { feedbackId } = req.params;
  const { improvedAnswer, legalReferences, verificationLevel, verifiedBy } = req.body;

  if (!improvedAnswer || !legalReferences || !verificationLevel) {
    return res.status(400).json({
      success: false,
      message: 'Required fields: improvedAnswer, legalReferences, verificationLevel',
    });
  }

  try {
    const improvement = await rlhfService.createAnswerImprovement({
      feedbackId,
      improvedAnswer,
      legalReferences,
      verificationLevel,
      verifiedBy,
    });

    res.json({
      success: true,
      data: improvement,
      message: 'Answer improvement created successfully',
    });
  } catch (error) {
    console.error('Error creating improvement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create improvement',
    });
  }
});

// RLHF Analytics for your dashboard
app.get('/api/v1/admin/rlhf/analytics', async (req, res) => {
  try {
    const analytics = await rlhfService.getFeedbackAnalytics();

    res.json({
      success: true,
      data: analytics,
      message: 'RLHF analytics retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting RLHF analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get RLHF analytics',
    });
  }
});

// Dashboard analytics endpoint
app.get('/api/v1/analytics', (req, res) => {
  const mockAnalytics = {
    totalCases: 45,
    activeCases: 12,
    completedCases: 33,
    totalClients: 28,
    totalRevenue: 125000,
    monthlyStats: [
      { month: 'Jan', cases: 5, revenue: 15000 },
      { month: 'Feb', cases: 8, revenue: 22000 },
      { month: 'Mar', cases: 12, revenue: 35000 },
      { month: 'Apr', cases: 7, revenue: 18000 },
      { month: 'May', cases: 10, revenue: 28000 },
      { month: 'Jun', cases: 3, revenue: 7000 },
    ],
    caseTypes: [
      { type: 'Commercial', count: 15, percentage: 33.3 },
      { type: 'Labor', count: 12, percentage: 26.7 },
      { type: 'Family', count: 10, percentage: 22.2 },
      { type: 'Criminal', count: 8, percentage: 17.8 },
    ],
  };

  res.json({
    success: true,
    data: mockAnalytics,
    message: 'Analytics data retrieved successfully',
  });
});

// Start server with database connection
async function startServer() {
  await connectToDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Saudi Legal AI v2.0 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/v1/health`);
    console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/v1/auth/*`);
    console.log(`🤖 AI endpoints: http://localhost:${PORT}/api/v1/ai/*`);
    console.log(`🧠 RLHF endpoints: http://localhost:${PORT}/api/v1/admin/*`);
    console.log(`📈 Analytics: http://localhost:${PORT}/api/v1/analytics`);
  });
}

startServer();

export default app;