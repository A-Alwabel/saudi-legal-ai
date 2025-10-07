// Email Notification Service for Saudi Legal AI v2
// Simple email service that can work with or without SMTP configuration

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initialize();
  }

  initialize() {
    // Check if email credentials are provided
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    };

    // Only create transporter if credentials are provided
    if (emailConfig.auth.user && emailConfig.auth.pass) {
      try {
        this.transporter = nodemailer.createTransport(emailConfig);
        this.isConfigured = true;
        console.log('✅ Email service configured');
      } catch (error) {
        console.warn('⚠️ Email service not configured:', error.message);
        this.isConfigured = false;
      }
    } else {
      console.log('ℹ️ Email service not configured (SMTP credentials not provided)');
      // Use mock email for development
      this.setupMockTransporter();
    }
  }

  setupMockTransporter() {
    // Mock transporter for development/testing
    this.transporter = {
      sendMail: async (mailOptions) => {
        console.log('\n📧 MOCK EMAIL SENT:');
        console.log('───────────────────────────────────');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('Content:', mailOptions.text?.substring(0, 100) + '...');
        console.log('───────────────────────────────────\n');
        return { messageId: 'mock-' + Date.now() };
      }
    };
    this.isConfigured = true; // Mock is "configured"
  }

  // Send welcome email
  async sendWelcomeEmail(user, language = 'en') {
    const subject = language === 'ar' 
      ? 'مرحباً بك في نظام الإدارة القانونية السعودي'
      : 'Welcome to Saudi Legal AI';
    
    const text = language === 'ar'
      ? `مرحباً ${user.name},\n\nنشكرك على التسجيل في نظام الإدارة القانونية السعودي.\n\nيمكنك الآن:\n- إدارة القضايا والعملاء\n- الحصول على استشارات قانونية بالذكاء الاصطناعي\n- تتبع المهام والمواعيد\n- وأكثر من ذلك بكثير!\n\nمع تحياتنا,\nفريق الإدارة القانونية السعودية`
      : `Dear ${user.name},\n\nThank you for registering with Saudi Legal AI.\n\nYou can now:\n- Manage cases and clients\n- Get AI-powered legal consultations\n- Track tasks and appointments\n- And much more!\n\nBest regards,\nSaudi Legal AI Team`;

    return this.sendEmail({
      to: user.email,
      subject,
      text,
      html: this.generateWelcomeHTML(user, language)
    });
  }

  // Send case update notification
  async sendCaseUpdateEmail(user, caseData, language = 'en') {
    const subject = language === 'ar'
      ? `تحديث القضية: ${caseData.titleAr || caseData.title}`
      : `Case Update: ${caseData.title}`;
    
    const text = language === 'ar'
      ? `عزيزي ${user.name},\n\nتم تحديث القضية: ${caseData.titleAr || caseData.title}\n\nالحالة: ${caseData.status}\n\nيرجى تسجيل الدخول لعرض التفاصيل الكاملة.\n\nمع تحياتنا,\nفريق الإدارة القانونية السعودية`
      : `Dear ${user.name},\n\nYour case has been updated: ${caseData.title}\n\nStatus: ${caseData.status}\n\nPlease login to view full details.\n\nBest regards,\nSaudi Legal AI Team`;

    return this.sendEmail({
      to: user.email,
      subject,
      text
    });
  }

  // Send appointment reminder
  async sendAppointmentReminder(user, appointment, language = 'en') {
    const subject = language === 'ar'
      ? `تذكير بالموعد: ${appointment.title}`
      : `Appointment Reminder: ${appointment.title}`;
    
    const text = language === 'ar'
      ? `عزيزي ${user.name},\n\nتذكير بموعدك القادم:\n\nالعنوان: ${appointment.title}\nالتاريخ: ${new Date(appointment.date).toLocaleDateString('ar-SA')}\nالوقت: ${appointment.time}\n\nيرجى الاستعداد للموعد.\n\nمع تحياتنا,\nفريق الإدارة القانونية السعودية`
      : `Dear ${user.name},\n\nReminder for your upcoming appointment:\n\nTitle: ${appointment.title}\nDate: ${new Date(appointment.date).toLocaleDateString()}\nTime: ${appointment.time}\n\nPlease be prepared for your appointment.\n\nBest regards,\nSaudi Legal AI Team`;

    return this.sendEmail({
      to: user.email,
      subject,
      text
    });
  }

  // Send invoice email
  async sendInvoiceEmail(user, invoice, language = 'en') {
    const subject = language === 'ar'
      ? `فاتورة جديدة - رقم ${invoice.invoiceNumber}`
      : `New Invoice - #${invoice.invoiceNumber}`;
    
    const text = language === 'ar'
      ? `عزيزي ${user.name},\n\nتم إنشاء فاتورة جديدة:\n\nرقم الفاتورة: ${invoice.invoiceNumber}\nالمبلغ: ${invoice.amount} ${invoice.currency || 'SAR'}\nالحالة: ${invoice.status}\n\nيرجى تسجيل الدخول لعرض التفاصيل والدفع.\n\nمع تحياتنا,\nفريق الإدارة القانونية السعودية`
      : `Dear ${user.name},\n\nA new invoice has been generated:\n\nInvoice #: ${invoice.invoiceNumber}\nAmount: ${invoice.amount} ${invoice.currency || 'SAR'}\nStatus: ${invoice.status}\n\nPlease login to view details and make payment.\n\nBest regards,\nSaudi Legal AI Team`;

    return this.sendEmail({
      to: user.email,
      subject,
      text
    });
  }

  // Send AI consultation result
  async sendAIConsultationEmail(user, consultation, language = 'en') {
    const subject = language === 'ar'
      ? 'نتيجة الاستشارة القانونية بالذكاء الاصطناعي'
      : 'AI Legal Consultation Result';
    
    const text = language === 'ar'
      ? `عزيزي ${user.name},\n\nتم إنشاء استشارة قانونية جديدة:\n\nالسؤال: ${consultation.query}\n\nيمكنك عرض الإجابة الكاملة بتسجيل الدخول إلى النظام.\n\nمع تحياتنا,\nفريق الإدارة القانونية السعودية`
      : `Dear ${user.name},\n\nYour AI legal consultation is ready:\n\nQuery: ${consultation.query}\n\nYou can view the full answer by logging into the system.\n\nBest regards,\nSaudi Legal AI Team`;

    return this.sendEmail({
      to: user.email,
      subject,
      text
    });
  }

  // Generic send email method
  async sendEmail({ to, subject, text, html }) {
    if (!this.isConfigured) {
      console.warn('⚠️ Email service not configured. Email not sent.');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'Saudi Legal AI <noreply@saudilegal.ai>',
        to,
        subject,
        text,
        html: html || text.replace(/\n/g, '<br>')
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email send error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Generate HTML email template
  generateWelcomeHTML(user, language = 'en') {
    const isArabic = language === 'ar';
    return `
<!DOCTYPE html>
<html lang="${isArabic ? 'ar' : 'en'}" dir="${isArabic ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #1976d2, #42a5f5);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .content {
      padding: 30px;
    }
    .button {
      display: inline-block;
      background: #1976d2;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 20px;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isArabic ? 'مرحباً بك!' : 'Welcome!'}</h1>
      <p>${isArabic ? 'نظام الإدارة القانونية السعودي' : 'Saudi Legal AI'}</p>
    </div>
    <div class="content">
      <h2>${isArabic ? `أهلاً ${user.name}` : `Hello ${user.name}`}</h2>
      <p>
        ${isArabic 
          ? 'نشكرك على الانضمام إلى نظام الإدارة القانونية السعودي المدعوم بالذكاء الاصطناعي.'
          : 'Thank you for joining Saudi Legal AI - the AI-powered legal management system.'}
      </p>
      <p>${isArabic ? 'يمكنك الآن:' : 'You can now:'}</p>
      <ul>
        <li>${isArabic ? '⚖️ إدارة القضايا والعملاء' : '⚖️ Manage cases and clients'}</li>
        <li>${isArabic ? '🤖 الحصول على استشارات قانونية بالذكاء الاصطناعي' : '🤖 Get AI-powered legal consultations'}</li>
        <li>${isArabic ? '📅 تتبع المهام والمواعيد' : '📅 Track tasks and appointments'}</li>
        <li>${isArabic ? '💰 إدارة الفواتير والمدفوعات' : '💰 Manage invoices and payments'}</li>
        <li>${isArabic ? '📊 عرض التقارير والتحليلات' : '📊 View reports and analytics'}</li>
      </ul>
      <a href="${process.env.APP_URL || 'http://localhost:3005'}" class="button">
        ${isArabic ? 'ابدأ الآن' : 'Get Started'}
      </a>
    </div>
    <div class="footer">
      <p>&copy; 2025 Saudi Legal AI. ${isArabic ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
      <p>${isArabic ? 'إذا كانت لديك أي أسئلة، يرجى الاتصال بنا.' : 'If you have any questions, please contact us.'}</p>
    </div>
  </div>
</body>
</html>`;
  }

  // Check if email service is ready
  isReady() {
    return this.isConfigured;
  }

  // Get service status
  getStatus() {
    return {
      configured: this.isConfigured,
      provider: process.env.SMTP_HOST || 'mock',
      ready: this.isReady()
    };
  }
}

// Export singleton instance
const emailService = new EmailService();
module.exports = emailService;

