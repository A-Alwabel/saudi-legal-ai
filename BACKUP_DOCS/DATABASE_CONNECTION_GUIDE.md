# 🗄️ **DATABASE CONNECTION GUIDE - Saudi Legal AI v2.0**

> **Current Status:** No database connected (using in-memory arrays)  
> **Goal:** Connect real MongoDB for data persistence

---

## **Option 1: MongoDB Atlas (Cloud) - FASTEST** ⚡

### **Steps:**
1. **Sign up for FREE MongoDB Atlas:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create free account (no credit card needed)
   - Create free M0 cluster

2. **Get Connection String:**
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/saudi-legal-ai?retryWrites=true&w=majority
   ```

3. **I'll Update Your Code:**
   ```javascript
   // Just tell me when you have the connection string
   // I'll add it to mock-server.js with full database support
   ```

---

## **Option 2: Install MongoDB Locally (Windows)**

### **Download & Install:**
1. Download MongoDB Community Server:
   - https://www.mongodb.com/try/download/community
   - Choose: Windows x64 (MSI)
   - Version: 7.0 or latest

2. Run installer:
   - Choose "Complete" installation
   - Install MongoDB as Windows Service ✅
   - Install MongoDB Compass (GUI) ✅

3. Start MongoDB:
   ```powershell
   # MongoDB should auto-start as service
   # Check if running:
   net start MongoDB
   ```

---

## **Option 3: Use Docker (If you have Docker)**

```bash
# Run MongoDB in Docker container
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

## **What I'll Do Once Database is Ready:**

### **1. Update mock-server.js with Mongoose:**
```javascript
const mongoose = require('mongoose');

// Connect to database
mongoose.connect('your-connection-string-here', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Create schemas
const CaseSchema = new mongoose.Schema({
  title: String,
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  status: String,
  createdAt: { type: Date, default: Date.now }
});

const Case = mongoose.model('Case', CaseSchema);

// Update endpoints to use database
app.get('/api/cases', async (req, res) => {
  const cases = await Case.find().populate('client');
  res.json({ data: cases });
});

app.post('/api/cases', async (req, res) => {
  const newCase = new Case(req.body);
  await newCase.save();
  res.json({ data: newCase });
});
```

### **2. Migrate All Endpoints to Use Database**
- Cases ✅
- Clients ✅
- Invoices ✅
- Payments ✅
- Tasks ✅
- All 30+ models ✅

### **3. Test Data Persistence**
- Create test data
- Restart server
- Verify data persists

---

## **🚀 QUICK DECISION:**

### **Choose One:**

**A) MongoDB Atlas (5 minutes)** - Recommended
- ✅ No installation
- ✅ Free tier available
- ✅ Accessible from anywhere
- ✅ Automatic backups
- Tell me: "Use Atlas" and I'll guide you

**B) Local MongoDB (20 minutes)**
- ✅ Full control
- ✅ No internet needed
- ⚠️ Requires installation
- Tell me: "Install local"

**C) Continue without database**
- ✅ Works for demo
- ❌ No data persistence
- Tell me: "Keep mock only"

---

## **Your TypeScript Backend Status:**

```
✅ Code exists: server/src/index.ts
❌ Won't compile: 390+ TypeScript errors
❌ MongoDB connection code present but not running
✅ Mock server working without database
```

**Which option do you choose?**
