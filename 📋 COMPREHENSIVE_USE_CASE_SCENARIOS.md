# 📋 COMPREHENSIVE USE CASE SCENARIOS
**Saudi Legal AI System v2.0**  
**Date:** October 9, 2025  
**Status:** Complete Documentation

---

## 🎯 **SYSTEM OVERVIEW**

### **Purpose:**
Intelligent legal management system for Saudi law firms with AI-powered consultation, case management, and document processing.

### **Users:**
1. **Lawyers** - Case management, AI consultation
2. **Clients** - Portal access, document upload, consultations
3. **Admins** - System management, user administration
4. **Law Firms** - Multi-tenant organization management

### **Core Features:**
- User Authentication & Authorization
- Case Management (CRUD)
- Client Portal
- AI Legal Consultation with RLHF
- Document Management
- Appointment Scheduling
- Task Management
- Invoice & Payment Tracking
- Analytics & Reporting

---

## 📝 **USE CASE 1: USER REGISTRATION & AUTHENTICATION**

### **Actors:** New Lawyer, System

### **Preconditions:** None

### **Flow:**
1. **User visits registration page** `/ar/register` or `/en/register`
2. **User enters information:**
   - Full Name (Arabic/English)
   - Email address
   - Password (min 8 chars, with strength validation)
   - Phone number (Saudi format: +966XXXXXXXXX)
   - Role selection (Lawyer/Admin)
   - Law Firm affiliation

3. **System validates input:**
   - Email format validation
   - Password strength check
   - Saudi phone number format
   - Unique email check

4. **System creates account:**
   ```javascript
   POST /api/auth/register
   Body: {
     name: "أحمد العلي",
     email: "ahmed@lawfirm.sa",
     password: "SecurePass123!",
     phone: "+966501234567",
     role: "lawyer",
     lawFirmId: "507f1f77bcf86cd799439011"
   }
   ```

5. **System responses:**
   - **Success (201):** User created, JWT token issued
   - **Error (400):** Validation errors
   - **Error (409):** Email already exists

6. **User redirected to dashboard** with active session

### **Postconditions:**
- User account created in MongoDB
- JWT token stored in localStorage
- User authenticated and logged in
- Dashboard displays with personalized data

### **Alternative Flows:**
- **A1:** Email already exists → Show error, suggest login
- **A2:** Weak password → Show strength requirements
- **A3:** Invalid phone format → Show Saudi phone format example

---

## 📝 **USE CASE 2: USER LOGIN**

### **Actors:** Registered User, System

### **Preconditions:** User has registered account

### **Flow:**
1. **User visits login page** `/ar/login` or `/en/login`
2. **User enters credentials:**
   - Email
   - Password

3. **System authenticates:**
   ```javascript
   POST /api/auth/login
   Body: {
     email: "ahmed@lawfirm.sa",
     password: "SecurePass123!"
   }
   ```

4. **System verifies:**
   - Email exists in database
   - Password matches (bcrypt comparison)
   - Account is active

5. **System issues JWT token:**
   ```javascript
   Response: {
     success: true,
     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     user: {
       id: "507f1f77bcf86cd799439011",
       name: "أحمد العلي",
       email: "ahmed@lawfirm.sa",
       role: "lawyer"
     }
   }
   ```

6. **User redirected to dashboard** based on role

### **Postconditions:**
- User authenticated with JWT
- Token stored in localStorage
- User context loaded in Redux
- Dashboard displays user-specific data

### **Alternative Flows:**
- **A1:** Invalid credentials → Show error, increment failed attempts
- **A2:** Account locked → Show contact admin message
- **A3:** First-time login → Show onboarding tutorial

---

## 📝 **USE CASE 3: CREATE NEW CASE**

### **Actors:** Lawyer, System

### **Preconditions:** User is authenticated as lawyer

### **Flow:**
1. **Lawyer navigates to Cases** `/ar/cases` or `/en/cases`
2. **Lawyer clicks "إضافة قضية جديدة" / "New Case"**
3. **System displays case form:**
   - Case Title (required)
   - Case Type (dropdown: civil, criminal, commercial, family, labor)
   - Client (searchable dropdown)
   - Priority (low, medium, high, urgent)
   - Court ID (optional)
   - Case Number (optional)
   - Description (rich text)
   - Start Date
   - Expected End Date
   - Estimated Value (SAR)

4. **Lawyer fills form and submits:**
   ```javascript
   POST /api/cases
   Headers: { Authorization: "Bearer <token>" }
   Body: {
     title: "قضية تجارية - نزاع عقد",
     caseType: "commercial",
     clientId: "507f1f77bcf86cd799439012",
     priority: "high",
     description: "نزاع حول شروط العقد التجاري...",
     startDate: "2025-10-09",
     expectedEndDate: "2025-12-31",
     estimatedValue: 500000
   }
   ```

5. **System validates and creates:**
   - Validates required fields
   - Checks client exists
   - Verifies lawyer permissions
   - Creates case in MongoDB
   - Generates case ID
   - Sends notification to client

6. **System returns created case:**
   ```javascript
   Response: {
     success: true,
     data: {
       id: "507f1f77bcf86cd799439013",
       caseNumber: "CASE-2025-001",
       title: "قضية تجارية - نزاع عقد",
       status: "open",
       createdAt: "2025-10-09T10:00:00Z"
     }
   }
   ```

7. **Lawyer redirected to case details page**

### **Postconditions:**
- New case created in database
- Client notified via email/SMS
- Case appears in lawyer's dashboard
- Case statistics updated
- Activity log created

### **Alternative Flows:**
- **A1:** Client not found → Option to create new client
- **A2:** Duplicate case → Warning about similar case
- **A3:** Validation errors → Highlight fields, show messages

---

## 📝 **USE CASE 4: AI LEGAL CONSULTATION**

### **Actors:** Lawyer/Client, AI System, RLHF System

### **Preconditions:** User is authenticated

### **Flow:**
1. **User navigates to AI Assistant** `/ar/ai-consultation` or clicks AI button
2. **User enters legal question:**
   - Question text (Arabic/English)
   - Case type (optional context)
   - Related case ID (optional)
   - Include references toggle

3. **User submits query:**
   ```javascript
   POST /api/v1/ai/consultation
   Headers: { Authorization: "Bearer <token>" }
   Body: {
     query: "ما هي الإجراءات القانونية لرفع دعوى تجارية في المحاكم السعودية؟",
     caseType: "commercial",
     language: "ar",
     includeReferences: true
   }
   ```

4. **AI System processes:**
   - Analyzes query intent
   - Searches PDF law database
   - Retrieves relevant Saudi laws
   - Generates structured response using GPT-4
   - Adds legal references
   - Includes confidence score

5. **System returns AI response:**
   ```javascript
   Response: {
     success: true,
     data: {
       consultationId: "507f1f77bcf86cd799439014",
       response: "للرفع دعوى تجارية في المحاكم السعودية، يجب اتباع الخطوات التالية:\n\n1. تحضير المستندات...",
       references: [
         {
           law: "نظام المحاكم التجارية",
           article: "المادة 12",
           text: "يجب أن تتضمن الدعوى...",
           page: 45
         }
       ],
       confidence: 0.92,
       relatedCases: [],
       createdAt: "2025-10-09T10:05:00Z"
     }
   }
   ```

6. **User reviews response**
7. **User provides feedback (RLHF):**
   ```javascript
   POST /api/v1/rlhf/feedback
   Body: {
     consultationId: "507f1f77bcf86cd799439014",
     rating: 5,
     helpful: true,
     feedback: "إجابة دقيقة ومفيدة",
     improvementSuggestions: []
   }
   ```

8. **System stores feedback for learning**

### **Postconditions:**
- Consultation saved in database
- AI response logged
- User feedback recorded
- RLHF system updated
- Consultation available in history

### **Alternative Flows:**
- **A1:** Query too vague → AI requests clarification
- **A2:** No relevant laws found → General legal guidance
- **A3:** Multiple interpretations → AI presents options
- **A4:** Low confidence → AI suggests lawyer consultation

---

## 📝 **USE CASE 5: DOCUMENT UPLOAD & MANAGEMENT**

### **Actors:** Lawyer, System, Storage Service

### **Preconditions:** User authenticated, case exists

### **Flow:**
1. **Lawyer navigates to case documents** `/ar/cases/:id/documents`
2. **Lawyer clicks "رفع مستند" / "Upload Document"**
3. **System displays upload form:**
   - File selection (PDF, DOCX, JPG, PNG)
   - Document type (contract, evidence, report, etc.)
   - Document title
   - Description
   - Tags

4. **Lawyer selects file and fills metadata:**
   ```javascript
   POST /api/documents/upload
   Headers: { 
     Authorization: "Bearer <token>",
     Content-Type: "multipart/form-data"
   }
   Body: FormData {
     file: <file_binary>,
     metadata: {
       caseId: "507f1f77bcf86cd799439013",
       title: "عقد الإيجار",
       type: "contract",
       description: "عقد الإيجار الأصلي",
       tags: ["عقد", "إيجار", "أصلي"]
     }
   }
   ```

5. **System processes upload:**
   - Validates file type and size (max 10MB)
   - Scans for viruses
   - Generates unique filename
   - Uploads to storage (AWS S3 / local)
   - Extracts text (OCR if image)
   - Creates thumbnail
   - Saves metadata to MongoDB

6. **System returns document info:**
   ```javascript
   Response: {
     success: true,
     data: {
       id: "507f1f77bcf86cd799439015",
       fileName: "عقد_الإيجار_2025.pdf",
       fileSize: 2048576,
       fileUrl: "/uploads/documents/507f1f77bcf86cd799439015.pdf",
       thumbnailUrl: "/uploads/thumbnails/507f1f77bcf86cd799439015.jpg",
       uploadedAt: "2025-10-09T10:10:00Z"
     }
   }
   ```

7. **Document appears in case files list**

### **Postconditions:**
- Document stored in file system
- Metadata saved in database
- Document linked to case
- Activity log updated
- Searchable in document library

### **Alternative Flows:**
- **A1:** File too large → Show compression options
- **A2:** Invalid file type → Show allowed formats
- **A3:** Upload fails → Retry mechanism
- **A4:** Virus detected → Reject and notify admin

---

## 📝 **USE CASE 6: CLIENT PORTAL ACCESS**

### **Actors:** Client, System

### **Preconditions:** Client account created by lawyer

### **Flow:**
1. **Client receives invitation email** with login link
2. **Client clicks link** → Redirected to `/client-portal/login`
3. **Client logs in** with provided credentials
4. **System displays client dashboard:**
   - Active cases count
   - Recent documents
   - Upcoming appointments
   - Messages from lawyer
   - Consultation requests

5. **Client views case details:**
   ```javascript
   GET /api/client-portal/cases
   Headers: { Authorization: "Bearer <client_token>" }
   ```

6. **System returns client-specific data:**
   ```javascript
   Response: {
     success: true,
     data: {
       cases: [
         {
           id: "507f1f77bcf86cd799439013",
           title: "قضية تجارية - نزاع عقد",
           status: "in_progress",
           lawyerName: "أحمد العلي",
           lastUpdate: "2025-10-08",
           canViewDocuments: true,
           canUploadDocuments: true
         }
       ]
     }
   }
   ```

7. **Client uploads document:**
   ```javascript
   POST /api/client-portal/documents/upload
   Body: {
     caseId: "507f1f77bcf86cd799439013",
     file: <file>,
     description: "مستند إضافي"
   }
   ```

8. **Client requests consultation:**
   ```javascript
   POST /api/client-portal/consultation-request
   Body: {
     caseId: "507f1f77bcf86cd799439013",
     message: "أحتاج إلى استشارة بخصوص...",
     urgency: "normal"
   }
   ```

### **Postconditions:**
- Client has limited access to case data
- Document uploaded and linked to case
- Lawyer notified of new documents
- Consultation request queued
- Activity logged

### **Alternative Flows:**
- **A1:** No active cases → Show welcome message
- **A2:** Document rejected → Lawyer reviews and approves
- **A3:** Urgent request → Immediate notification to lawyer

---

## 📝 **USE CASE 7: APPOINTMENT SCHEDULING**

### **Actors:** Lawyer, Client, System

### **Preconditions:** Both users authenticated

### **Flow:**
1. **Lawyer navigates to calendar** `/ar/appointments`
2. **Lawyer clicks time slot** to create appointment
3. **System displays appointment form:**
   - Client (searchable)
   - Case (optional link)
   - Date & Time
   - Duration
   - Location (office, court, online)
   - Meeting link (if online)
   - Notes

4. **Lawyer creates appointment:**
   ```javascript
   POST /api/appointments
   Body: {
     clientId: "507f1f77bcf86cd799439012",
     caseId: "507f1f77bcf86cd799439013",
     date: "2025-10-15",
     time: "10:00",
     duration: 60,
     location: "office",
     notes: "مراجعة تقدم القضية"
   }
   ```

5. **System creates appointment:**
   - Validates time slot availability
   - Checks for conflicts
   - Creates calendar event
   - Sends email to client
   - Sends SMS reminder
   - Adds to lawyer's calendar

6. **Client receives notification** with:
   - Appointment details
   - Calendar invite (ICS file)
   - Map/directions
   - Confirmation link

7. **System sends reminders:**
   - 24 hours before
   - 1 hour before
   - Allows rescheduling

### **Postconditions:**
- Appointment in database
- Both parties notified
- Calendar synced
- Reminders scheduled
- Can be rescheduled/cancelled

### **Alternative Flows:**
- **A1:** Time conflict → Suggest alternative times
- **A2:** Client declines → Notify lawyer, allow rescheduling
- **A3:** Last-minute changes → Urgent notifications

---

## 📝 **USE CASE 8: INVOICE GENERATION & PAYMENT**

### **Actors:** Lawyer, Client, Payment System

### **Preconditions:** Case exists, services provided

### **Flow:**
1. **Lawyer creates invoice** from case page
2. **System displays invoice form:**
   - Client (auto-filled from case)
   - Case (linked)
   - Service items (line items)
   - Amounts
   - Tax (15% VAT)
   - Payment terms
   - Due date

3. **Lawyer adds line items:**
   ```javascript
   POST /api/invoices
   Body: {
     caseId: "507f1f77bcf86cd799439013",
     clientId: "507f1f77bcf86cd799439012",
     items: [
       {
         description: "استشارة قانونية",
         quantity: 5,
         unitPrice: 1000,
         total: 5000
       },
       {
         description: "تمثيل في المحكمة",
         quantity: 2,
         unitPrice: 3000,
         total: 6000
       }
     ],
     subtotal: 11000,
     tax: 1650,
     total: 12650,
     dueDate: "2025-11-09"
   }
   ```

4. **System generates invoice:**
   - Creates invoice PDF
   - Generates invoice number
   - Calculates totals with VAT
   - Stores in database
   - Sends email to client

5. **Client receives invoice** with payment link
6. **Client pays online** through payment gateway
7. **System updates invoice status:**
   ```javascript
   PUT /api/invoices/:id/payment
   Body: {
     paymentMethod: "credit_card",
     transactionId: "TXN-2025-001",
     amount: 12650,
     status: "paid"
   }
   ```

8. **System generates receipt** and sends to client

### **Postconditions:**
- Invoice created and stored
- Client notified
- Payment recorded
- Receipt generated
- Accounting updated
- Tax records maintained

### **Alternative Flows:**
- **A1:** Partial payment → Track balance
- **A2:** Late payment → Send reminders
- **A3:** Payment failed → Retry mechanism
- **A4:** Dispute → Escalate to admin

---

## 📝 **USE CASE 9: TASK MANAGEMENT**

### **Actors:** Lawyer, Team Members, System

### **Preconditions:** User authenticated, case exists

### **Flow:**
1. **Lawyer creates task** from case or tasks page
2. **System displays task form:**
   - Task title
   - Description
   - Case link (optional)
   - Assigned to
   - Priority
   - Due date
   - Checklist items
   - Tags

3. **Lawyer creates task:**
   ```javascript
   POST /api/tasks
   Body: {
     title: "تحضير مذكرة الدفاع",
     description: "إعداد مذكرة دفاع شاملة للجلسة القادمة",
     caseId: "507f1f77bcf86cd799439013",
     assignedTo: "507f1f77bcf86cd799439016",
     priority: "high",
     dueDate: "2025-10-20",
     checklist: [
       "مراجعة القضية",
       "جمع الأدلة",
       "كتابة المذكرة",
       "مراجعة قانونية"
     ]
   }
   ```

4. **System creates task:**
   - Validates assignment
   - Sets reminders
   - Notifies assignee
   - Adds to calendar

5. **Assignee receives notification**
6. **Assignee updates progress:**
   ```javascript
   PUT /api/tasks/:id
   Body: {
     status: "in_progress",
     completedItems: ["مراجعة القضية", "جمع الأدلة"],
     notes: "تم جمع معظم الأدلة"
   }
   ```

7. **Assignee marks complete:**
   ```javascript
   PUT /api/tasks/:id
   Body: {
     status: "completed",
     completionNotes: "تم إنجاز المهمة بالكامل"
   }
   ```

### **Postconditions:**
- Task created and assigned
- Assignee notified
- Progress tracked
- Completion recorded
- Team productivity metrics updated

---

## 📊 **USE CASE 10: ANALYTICS & REPORTING**

### **Actors:** Admin/Manager, System

### **Preconditions:** User has admin/manager role

### **Flow:**
1. **Admin navigates to analytics** `/ar/dashboard` or `/ar/analytics`
2. **System displays dashboard:**
   - Total cases (open, closed, in-progress)
   - Client statistics
   - Revenue metrics
   - Task completion rates
   - Team performance
   - AI consultation usage

3. **Admin requests detailed report:**
   ```javascript
   GET /api/analytics/cases?startDate=2025-01-01&endDate=2025-10-09
   Headers: { Authorization: "Bearer <token>" }
   ```

4. **System generates analytics:**
   ```javascript
   Response: {
     success: true,
     data: {
       totalCases: 250,
       openCases: 45,
       closedCases: 180,
       inProgressCases: 25,
       successRate: 0.85,
       averageDuration: 45, // days
       revenueByMonth: [...],
       casesByType: {
         commercial: 80,
         civil: 60,
         criminal: 40,
         family: 45,
         labor: 25
       },
       topLawyers: [...],
       clientSatisfaction: 4.5
     }
   }
   ```

5. **Admin generates PDF report:**
   ```javascript
   POST /api/reports/generate
   Body: {
     reportType: "monthly",
     period: "2025-10",
     includeCharts: true,
     includeDetails: true
   }
   ```

6. **System generates and downloads report**

### **Postconditions:**
- Analytics calculated
- Report generated
- Data exported
- Insights available for decision-making

---

## 🔒 **SECURITY & AUTHORIZATION**

### **Access Control Matrix:**

| Feature | Admin | Lawyer | Client |
|---------|-------|--------|--------|
| View all cases | ✅ | ✅ (own) | ✅ (assigned) |
| Create case | ✅ | ✅ | ❌ |
| Edit case | ✅ | ✅ (own) | ❌ |
| Delete case | ✅ | ❌ | ❌ |
| View documents | ✅ | ✅ (case) | ✅ (case) |
| Upload documents | ✅ | ✅ | ✅ |
| Delete documents | ✅ | ✅ (own) | ❌ |
| AI consultation | ✅ | ✅ | ✅ |
| View analytics | ✅ | ✅ (own) | ❌ |
| User management | ✅ | ❌ | ❌ |
| System settings | ✅ | ❌ | ❌ |

---

## 🎯 **SUCCESS CRITERIA**

### **For Each Use Case:**
1. ✅ All steps complete successfully
2. ✅ Data persists in MongoDB
3. ✅ Appropriate notifications sent
4. ✅ Activity logged
5. ✅ Security enforced
6. ✅ Error handling works
7. ✅ UI responsive and localized
8. ✅ API endpoints documented

---

## 📝 **TESTING CHECKLIST**

### **Manual Testing:**
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Create new case
- [ ] Upload document to case
- [ ] Request AI consultation
- [ ] Submit RLHF feedback
- [ ] Create appointment
- [ ] Generate invoice
- [ ] Create and complete task
- [ ] View analytics dashboard
- [ ] Test client portal access
- [ ] Test all CRUD operations

### **API Testing:**
- [ ] Test all auth endpoints
- [ ] Test all case endpoints
- [ ] Test document upload/download
- [ ] Test AI consultation endpoint
- [ ] Test RLHF feedback endpoint
- [ ] Test analytics endpoints
- [ ] Verify JWT authentication
- [ ] Test error responses
- [ ] Test validation middleware

### **Database Testing:**
- [ ] Verify MongoDB connection
- [ ] Test all CRUD operations
- [ ] Verify relationships (refs)
- [ ] Test data integrity
- [ ] Test concurrent operations
- [ ] Verify indexes
- [ ] Test backup/restore

---

<div align="center">

## ✅ **COMPLETE USE CASE SCENARIOS**
## 📊 **10 DETAILED USE CASES DOCUMENTED**
## 🔒 **SECURITY & ACCESS CONTROL DEFINED**
## ✨ **READY FOR IMPLEMENTATION & TESTING**

**All scenarios include:**
- Detailed flows
- API examples
- Success criteria
- Alternative flows
- Security considerations

</div>

---

*Document Created: October 9, 2025*  
*Status: Complete and Ready for Testing*  
*Next: Backend & Database Testing Implementation*

