# 🧪 BACKEND TESTING SCRIPT
**Comprehensive Backend & Database Testing**  
**Date:** October 9, 2025

---

## 📋 **TESTING CHECKLIST**

### **Phase 1: MongoDB Connection** ✅
- [x] Connection string verified
- [x] Credentials present in `server/db-server.js`
- [ ] Test connection
- [ ] Verify database creation
- [ ] Check collections

### **Phase 2: Server Startup** 
- [ ] Install server dependencies
- [ ] Start backend server (port 5000)
- [ ] Verify CORS configuration
- [ ] Check middleware initialization
- [ ] Verify routes registration

### **Phase 3: Authentication Endpoints**
- [ ] POST `/api/auth/register` - Create new user
- [ ] POST `/api/auth/login` - Login user
- [ ] GET `/api/auth/me` - Get current user
- [ ] POST `/api/auth/logout` - Logout user
- [ ] POST `/api/auth/forgot-password` - Password reset request
- [ ] POST `/api/auth/reset-password` - Reset password

### **Phase 4: Case Management**
- [ ] GET `/api/cases` - List all cases
- [ ] POST `/api/cases` - Create case
- [ ] GET `/api/cases/:id` - Get case details
- [ ] PUT `/api/cases/:id` - Update case
- [ ] DELETE `/api/cases/:id` - Delete case
- [ ] GET `/api/cases?search=query` - Search cases

### **Phase 5: Client Management**
- [ ] GET `/api/clients` - List clients
- [ ] POST `/api/clients` - Create client
- [ ] GET `/api/clients/:id` - Get client
- [ ] PUT `/api/clients/:id` - Update client
- [ ] DELETE `/api/clients/:id` - Delete client

### **Phase 6: Document Management**
- [ ] POST `/api/documents/upload` - Upload document
- [ ] GET `/api/documents` - List documents
- [ ] GET `/api/documents/:id` - Get document
- [ ] GET `/api/documents/:id/download` - Download document
- [ ] DELETE `/api/documents/:id` - Delete document

### **Phase 7: AI Consultation**
- [ ] POST `/api/v1/ai/consultation` - AI consultation
- [ ] GET `/api/v1/ai/consultations` - List consultations
- [ ] POST `/api/v1/rlhf/feedback` - Submit feedback
- [ ] GET `/api/v1/ai/law-stats` - Law database stats

### **Phase 8: Analytics**
- [ ] GET `/api/analytics/dashboard` - Dashboard stats
- [ ] GET `/api/analytics/cases?period=month` - Case analytics
- [ ] GET `/api/analytics/financial` - Financial analytics

---

## 🔍 **TEST SCRIPTS**

### **1. Test MongoDB Connection**
```bash
cd server
node -e "
const mongoose = require('mongoose');
const uri = 'mongodb+srv://aalwabel:RvdRFdgsd7GSQBcA@cluster0.qih14yv.mongodb.net/saudi-legal-ai?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(uri).then(() => {
  console.log('✅ MongoDB Connected Successfully!');
  console.log('Database:', mongoose.connection.name);
  mongoose.connection.close();
}).catch(err => {
  console.error('❌ MongoDB Connection Failed:', err.message);
});
"
```

### **2. Start Backend Server**
```bash
cd server
npm install
npm start
```

Expected output:
```
🚀 Server running on port 5000
✅ MongoDB Connected Successfully!
📚 Law database initialized with X documents
```

### **3. Test Registration**
```powershell
$body = @{
    name = "أحمد العلي"
    email = "ahmed.test@example.com"
    password = "SecurePass123!"
    phone = "+966501234567"
    role = "lawyer"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $body -ContentType "application/json"
$response | ConvertTo-Json -Depth 10
```

Expected response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "أحمد العلي",
    "email": "ahmed.test@example.com",
    "role": "lawyer"
  }
}
```

### **4. Test Login**
```powershell
$body = @{
    email = "ahmed.test@example.com"
    password = "SecurePass123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $response.token
Write-Host "✅ Login successful! Token: $token"
```

### **5. Test Create Case**
```powershell
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    title = "قضية تجارية - نزاع عقد"
    caseType = "commercial"
    clientId = "..."
    priority = "high"
    description = "نزاع حول شروط العقد التجاري"
    startDate = "2025-10-09"
    estimatedValue = 500000
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/cases" -Method Post -Headers $headers -Body $body
$response | ConvertTo-Json -Depth 10
```

### **6. Test AI Consultation**
```powershell
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    query = "ما هي الإجراءات القانونية لرفع دعوى تجارية؟"
    caseType = "commercial"
    language = "ar"
    includeReferences = $true
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/ai/consultation" -Method Post -Headers $headers -Body $body
$response | ConvertTo-Json -Depth 10
```

### **7. Test Document Upload**
```powershell
$filePath = "C:\path\to\test-document.pdf"
$uri = "http://localhost:5000/api/documents/upload"
$headers = @{
    Authorization = "Bearer $token"
}

$form = @{
    file = Get-Item -Path $filePath
    metadata = @{
        caseId = "..."
        title = "Test Document"
        type = "contract"
    } | ConvertTo-Json
}

$response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Form $form
$response | ConvertTo-Json -Depth 10
```

### **8. Test Analytics**
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/analytics/dashboard" -Method Get -Headers $headers
$response | ConvertTo-Json -Depth 10
```

---

## 📊 **AUTOMATED TEST SUITE**

Create file: `server/test-all-endpoints.js`

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let createdCaseId = '';
let createdClientId = '';

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function
async function test(name, fn) {
  try {
    await fn();
    results.passed++;
    results.tests.push({ name, status: '✅ PASS' });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: '❌ FAIL', error: error.message });
    console.log(`❌ ${name}: ${error.message}`);
  }
}

// Tests
async function runTests() {
  console.log('\n🧪 STARTING COMPREHENSIVE BACKEND TESTS\n');

  // 1. Test Registration
  await test('User Registration', async () => {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'SecurePass123!',
      phone: '+966501234567',
      role: 'lawyer'
    });
    if (!response.data.token) throw new Error('No token returned');
    authToken = response.data.token;
  });

  // 2. Test Login
  await test('User Login', async () => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'ahmed@lawfirm.sa',
      password: 'SecurePass123!'
    });
    if (!response.data.token) throw new Error('No token returned');
  });

  // 3. Test Get Current User
  await test('Get Current User', async () => {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!response.data.user) throw new Error('No user data');
  });

  // 4. Test Create Client
  await test('Create Client', async () => {
    const response = await axios.post(`${BASE_URL}/clients`, {
      name: 'Test Client',
      email: `client${Date.now()}@example.com`,
      phone: '+966501234568',
      nationalId: '1234567890'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!response.data.id) throw new Error('No client ID');
    createdClientId = response.data.id;
  });

  // 5. Test Create Case
  await test('Create Case', async () => {
    const response = await axios.post(`${BASE_URL}/cases`, {
      title: 'Test Case',
      caseType: 'commercial',
      clientId: createdClientId,
      priority: 'high',
      description: 'Test case description',
      startDate: new Date().toISOString()
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!response.data.id) throw new Error('No case ID');
    createdCaseId = response.data.id;
  });

  // 6. Test Get Cases
  await test('Get All Cases', async () => {
    const response = await axios.get(`${BASE_URL}/cases`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!Array.isArray(response.data)) throw new Error('Invalid response');
  });

  // 7. Test Get Case by ID
  await test('Get Case by ID', async () => {
    const response = await axios.get(`${BASE_URL}/cases/${createdCaseId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!response.data.id) throw new Error('No case data');
  });

  // 8. Test Update Case
  await test('Update Case', async () => {
    const response = await axios.put(`${BASE_URL}/cases/${createdCaseId}`, {
      status: 'in_progress'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.data.status !== 'in_progress') throw new Error('Update failed');
  });

  // 9. Test AI Consultation
  await test('AI Consultation', async () => {
    const response = await axios.post(`${BASE_URL}/v1/ai/consultation`, {
      query: 'What are the legal procedures for commercial cases?',
      caseType: 'commercial',
      language: 'en',
      includeReferences: true
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!response.data.response) throw new Error('No AI response');
  });

  // 10. Test RLHF Feedback
  await test('Submit RLHF Feedback', async () => {
    await axios.post(`${BASE_URL}/v1/rlhf/feedback`, {
      consultationId: 'test-consultation-id',
      rating: 5,
      helpful: true,
      feedback: 'Great response!'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
  });

  // 11. Test Analytics
  await test('Get Dashboard Analytics', async () => {
    const response = await axios.get(`${BASE_URL}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!response.data) throw new Error('No analytics data');
  });

  // 12. Test Delete Case
  await test('Delete Case', async () => {
    await axios.delete(`${BASE_URL}/cases/${createdCaseId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
  });

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.tests.length}`);
  console.log(`🎯 Success Rate: ${(results.passed / results.tests.length * 100).toFixed(2)}%`);
  console.log('='.repeat(50) + '\n');
}

// Run tests
runTests().catch(console.error);
```

Run with: `node server/test-all-endpoints.js`

---

## 🔍 **DATABASE VERIFICATION**

### **Check MongoDB Collections:**
```javascript
// server/check-database.js
const mongoose = require('mongoose');

const uri = 'mongodb+srv://aalwabel:RvdRFdgsd7GSQBcA@cluster0.qih14yv.mongodb.net/saudi-legal-ai?retryWrites=true&w=majority&appName=Cluster0';

async function checkDatabase() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log('📊 Collections in database:');
    console.log('='.repeat(50));

    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  ${collection.name}: ${count} documents`);
    }

    console.log('='.repeat(50) + '\n');

    // Sample documents
    console.log('📄 Sample Documents:\n');

    if (collections.find(c => c.name === 'users')) {
      const user = await db.collection('users').findOne();
      console.log('Users:', JSON.stringify(user, null, 2));
    }

    if (collections.find(c => c.name === 'cases')) {
      const caseDoc = await db.collection('cases').findOne();
      console.log('Cases:', JSON.stringify(caseDoc, null, 2));
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabase();
```

---

## ✅ **EXPECTED RESULTS**

### **Successful Test Output:**
```
🧪 STARTING COMPREHENSIVE BACKEND TESTS

✅ User Registration
✅ User Login
✅ Get Current User
✅ Create Client
✅ Create Case
✅ Get All Cases
✅ Get Case by ID
✅ Update Case
✅ AI Consultation
✅ Submit RLHF Feedback
✅ Get Dashboard Analytics
✅ Delete Case

==================================================
📊 TEST SUMMARY
==================================================
✅ Passed: 12
❌ Failed: 0
📊 Total: 12
🎯 Success Rate: 100.00%
==================================================
```

---

## 🚨 **TROUBLESHOOTING**

### **MongoDB Connection Issues:**
- Check internet connection
- Verify credentials in `server/db-server.js`
- Check MongoDB Atlas IP whitelist
- Verify cluster is running

### **Server Won't Start:**
- Check if port 5000 is available
- Install all dependencies: `npm install`
- Check for syntax errors in server files
- Verify environment variables

### **API Endpoint Errors:**
- Verify JWT token is valid
- Check request body format
- Verify user permissions
- Check MongoDB connection

### **AI Consultation Fails:**
- Verify OpenAI API key
- Check PDF law database
- Verify law documents exist
- Check API rate limits

---

## 📝 **MANUAL TESTING STEPS**

1. **Start Backend:**
   ```bash
   cd server
   npm start
   ```

2. **Open New Terminal - Test Registration:**
   ```powershell
   # Save this as test-register.ps1
   $body = @{
       name = "Test User"
       email = "test@example.com"
       password = "SecurePass123!"
       phone = "+966501234567"
       role = "lawyer"
   } | ConvertTo-Json

   $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $body -ContentType "application/json"
   $global:token = $response.token
   Write-Host "✅ Registration successful!"
   Write-Host "Token: $global:token"
   ```

3. **Run all other tests using saved token**

---

<div align="center">

## ✅ **COMPREHENSIVE TESTING GUIDE COMPLETE**
## 🧪 **READY TO TEST BACKEND & DATABASE**
## 📊 **ALL ENDPOINTS DOCUMENTED**
## 🔍 **TROUBLESHOOTING INCLUDED**

**Next Steps:**
1. Start backend server
2. Run automated test suite
3. Verify all endpoints
4. Check database operations
5. Document results

</div>

---

*Document Created: October 9, 2025*  
*Status: Ready for Testing*  
*Next: Execute Backend Tests*

