# 📖 START HERE - Developer Guide
**Welcome to Saudi Legal AI v2**  
**Last Updated:** October 8, 2025

---

## 🎯 YOU'RE A DEVELOPER? START HERE!

This guide will get you up to speed in 15 minutes.

---

## 📚 ESSENTIAL DOCUMENTS (Read in this order)

### **1. 🎯 MASTER_PROJECT_STATUS.md** ⭐ READ FIRST
- **Purpose:** Single source of truth for project status
- **Contains:** Current completion %, working/broken features
- **Read before:** ANY work on this project
- **Update after:** ANY changes you make

### **2. 🤖 AI_ASSISTANT_RULES.md** ⭐ MANDATORY
- **Purpose:** Workflow rules to prevent conflicts
- **Contains:** Git workflow, documentation rules, testing requirements
- **Follow:** ALWAYS - these prevent chaos

### **3. 📋 PROJECT_PLAN.md** 
- **Purpose:** Development roadmap with phases
- **Contains:** What needs to be done, in what order, time estimates
- **Use for:** Planning your work, understanding priorities

### **4. 🐛 KNOWN_ISSUES.md**
- **Purpose:** Complete list of ALL known issues
- **Contains:** Issues, priorities, fixes, status
- **Use for:** Knowing what's broken and needs fixing

### **5. GitHub Push Guides**
- `GITHUB_PUSH_GUIDE.md` - Complete guide
- `QUICK_PUSH_README.md` - Quick reference
- Scripts: `push-to-github.bat`, `quick-push.bat`

---

## ⚡ QUICK START (5 Minutes)

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/A-Alwabel/saudi-legal-ai.git
cd saudi-legal-ai
```

### **Step 2: Install Dependencies**
```bash
# Root dependencies
npm install

# Frontend dependencies
cd client-nextjs
npm install
cd ..

# Backend dependencies
cd server
npm install
cd ..
```

### **Step 3: Configure Environment**
```bash
# Copy example env file
cp env.example .env

# Edit server/.env with your MongoDB connection
# (or use provided credentials for development)
```

### **Step 4: Start the System**

**Option A: Using Scripts (Windows)**
```bash
scripts\start-system.bat
```

**Option B: Manual**
```bash
# Terminal 1: Backend
cd server
node db-server.js

# Terminal 2: Frontend
cd client-nextjs
npm run dev
```

### **Step 5: Access the Application**
- Frontend: http://localhost:3005
- Backend API: http://localhost:5000
- MongoDB: Connected to Atlas

---

## 🔍 CURRENT PROJECT STATE

### **⚠️ STATUS: NEEDS VERIFICATION**

The project has **conflicting status reports**:
- Some docs say 45% complete
- Some docs say 95% complete
- Some docs say 98% complete

**Truth:** We need to TEST everything to know the real status.

### **Next Critical Action:**
Run **Phase 1 Verification** from `PROJECT_PLAN.md` to determine true state.

---

## 📁 PROJECT STRUCTURE

```
saudi-legal-ai/
├── 📁 client-nextjs/          # Next.js frontend
│   ├── src/
│   │   ├── app/              # Pages (App Router)
│   │   ├── components/       # React components
│   │   ├── services/         # API services
│   │   ├── store/            # Redux state
│   │   └── ...
│   └── package.json
│
├── 📁 server/                 # Node.js backend
│   ├── src/                  # TypeScript source (broken)
│   ├── db-server.js          # Working JS server ✅
│   ├── mock-server.js        # Mock API server
│   ├── email-service.js      # Email service
│   └── package.json
│
├── 📁 docs/                   # Documentation
├── 📁 scripts/                # Helper scripts
├── 📁 shared/                 # Shared types/constants
│
├── 🎯 MASTER_PROJECT_STATUS.md    # ⭐ Main status doc
├── 🤖 AI_ASSISTANT_RULES.md       # ⭐ Workflow rules
├── 📋 PROJECT_PLAN.md             # Development plan
├── 🐛 KNOWN_ISSUES.md             # Issues tracker
├── 📖 START_HERE_DEVELOPER.md     # This file
└── README.md                       # Project overview
```

---

## 🛠️ DEVELOPMENT WORKFLOW

### **Every Time You Start Working:**

```bash
# 1. Pull latest changes
git pull origin master

# 2. Read current status
# Open: 🎯 MASTER_PROJECT_STATUS.md

# 3. Check what needs doing
# Open: 📋 PROJECT_PLAN.md
# Open: 🐛 KNOWN_ISSUES.md

# 4. Start working on highest priority
```

### **While Working:**

```bash
# After every meaningful change:
git add .
git commit -m "Clear description of what changed"
git push origin master

# Update documentation:
# Edit: 🎯 MASTER_PROJECT_STATUS.md
# Edit: 🐛 KNOWN_ISSUES.md (if fixing issues)
git add .
git commit -m "Update project status"
git push origin master
```

### **Before Ending Session:**

```bash
# 1. Ensure everything is committed
git status  # Should show "working tree clean"

# 2. Update status document
# Edit: 🎯 MASTER_PROJECT_STATUS.md
# Note: What you accomplished, what's next

# 3. Commit and push
git add .
git commit -m "Session end: [summary of work]"
git push origin master
```

---

## 🚨 CRITICAL RULES

### **ALWAYS:**
1. ✅ Pull before starting work
2. ✅ Read MASTER_PROJECT_STATUS first
3. ✅ Test your changes
4. ✅ Update documentation
5. ✅ Commit frequently
6. ✅ Push to GitHub

### **NEVER:**
1. ❌ Work without pulling latest
2. ❌ Create new status documents
3. ❌ Claim something works without testing
4. ❌ Skip documentation updates
5. ❌ Let commits pile up
6. ❌ Push broken code

---

## 🧪 TESTING

### **Before Claiming Anything Works:**

1. **Test Frontend Build**
   ```bash
   cd client-nextjs
   npm run build
   ```

2. **Test Frontend Dev Server**
   ```bash
   npm run dev
   # Open http://localhost:3005
   # Click everything, test everything
   ```

3. **Test Backend**
   ```bash
   cd server
   node db-server.js
   # Check console for errors
   ```

4. **Test API Endpoints**
   ```bash
   # Use Postman or curl
   POST http://localhost:5000/api/auth/login
   GET http://localhost:5000/api/cases
   POST http://localhost:5000/api/v1/ai/consultation
   ```

5. **Check Browser Console**
   - F12 → Console tab
   - Look for errors (red)
   - Look for warnings (yellow)

---

## 🎯 PRIORITIES

### **Work on These in Order:**

1. **🔴 CRITICAL** - Blocks deployment
   - Frontend build errors
   - Authentication not working
   - AI endpoints missing
   
2. **🟡 HIGH** - Important for users
   - Missing components
   - React warnings
   - Validation issues

3. **🟢 MEDIUM** - Nice to have
   - Testing
   - Email configuration
   - Performance optimization

4. **🔵 LOW** - Post-launch
   - Mobile app
   - WhatsApp integration
   - Advanced features

---

## 📊 USEFUL COMMANDS

### **Frontend:**
```bash
cd client-nextjs

npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Check for errors
```

### **Backend:**
```bash
cd server

node db-server.js    # Start main server (working)
node mock-server.js  # Start mock server
npm run dev          # Start with nodemon (if configured)
```

### **Git:**
```bash
git status                    # Check current state
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push origin master        # Push to GitHub
git pull origin master        # Pull latest changes
git log --oneline -10         # View recent commits
```

### **Quick Push (Windows):**
```bash
push-to-github.bat    # Interactive push (asks for message)
quick-push.bat        # Quick push (auto message)
```

---

## 🔍 FINDING THINGS

### **Where is...?**

| Looking for | Location |
|-------------|----------|
| Frontend pages | `client-nextjs/src/app/[locale]/` |
| React components | `client-nextjs/src/components/` |
| API services | `client-nextjs/src/services/` |
| Redux state | `client-nextjs/src/store/` |
| Backend routes | `server/src/routes/` |
| Database models | `server/src/models/` |
| API endpoints | `server/db-server.js` |
| Email templates | `server/email-service.js` |
| Project status | `🎯 MASTER_PROJECT_STATUS.md` |
| Known issues | `🐛 KNOWN_ISSUES.md` |
| Development plan | `📋 PROJECT_PLAN.md` |
| Workflow rules | `🤖 AI_ASSISTANT_RULES.md` |

---

## 🆘 TROUBLESHOOTING

### **Frontend won't build?**
```bash
cd client-nextjs
rm -rf node_modules .next
npm install
npm run build
```

### **Backend won't start?**
```bash
cd server
rm -rf node_modules
npm install
# Check MongoDB connection in .env
node db-server.js
```

### **Port already in use?**
```bash
# Windows
netstat -ano | findstr :3005
netstat -ano | findstr :5000
taskkill /PID [PID] /F

# Kill and restart
```

### **Git conflicts?**
```bash
git status                    # See what conflicts
# Open conflicting files
# Look for <<<<<<< and >>>>>>>
# Edit to keep what you want
git add [file]
git commit -m "Resolve conflicts"
git push origin master
```

---

## 📚 ADDITIONAL RESOURCES

### **Technical Documentation:**
- `docs/technical/` - Technical guides
- `docs/API_DOCUMENTATION_HYBRID_AI.md` - API docs
- `docs/DEPLOYMENT_GUIDE_HYBRID_AI.md` - Deployment guide

### **Legal Resources:**
- `docs/legal/` - Legal consultant guides
- `docs/legal/OFFICIAL_SAUDI_LEGAL_DATABASES.md` - Legal databases

### **Historical Documentation:**
- `BACKUP_DOCS/` - Old status reports (for reference only)

---

## 🎓 LEARNING THE CODEBASE

### **Start Here:**

1. **Understand the Structure**
   - Read this file
   - Read `README.md`
   - Explore `client-nextjs/src/`
   - Explore `server/src/`

2. **Run the System**
   - Start frontend and backend
   - Click through the UI
   - Check browser console
   - Test API endpoints

3. **Read the Code**
   - Start with `server/db-server.js` (main backend)
   - Then `client-nextjs/src/app/[locale]/page.tsx` (home page)
   - Follow imports to understand flow

4. **Make Small Changes**
   - Change some text
   - Add a console.log
   - Test your change
   - Commit it

---

## ✅ YOUR FIRST TASK

### **Recommended First Steps:**

1. **Set Up Environment** (30 mins)
   - Clone repo
   - Install dependencies
   - Get it running locally

2. **Read Documentation** (30 mins)
   - This file
   - MASTER_PROJECT_STATUS
   - AI_ASSISTANT_RULES
   - PROJECT_PLAN

3. **Run Phase 1 Verification** (90 mins)
   - Follow PROJECT_PLAN Phase 1
   - Test everything
   - Document results
   - Update MASTER_PROJECT_STATUS

4. **Fix One Critical Issue** (2-4 hours)
   - Pick from KNOWN_ISSUES
   - Fix it
   - Test it
   - Document it
   - Commit it

---

## 🚀 AFTER YOU'RE COMFORTABLE

### **Contribute to the Project:**

1. Check KNOWN_ISSUES for priorities
2. Pick a task that matches your skills
3. Create a branch (optional) or work on master
4. Fix the issue
5. Test thoroughly
6. Update documentation
7. Commit and push
8. Celebrate! 🎉

---

## 📞 NEED HELP?

### **Resources:**

1. **Documentation** - Check the 4 key documents above
2. **Code Comments** - Most complex code has comments
3. **Git History** - `git log` shows what changed and why
4. **GitHub** - View code online at github.com/A-Alwabel/saudi-legal-ai

---

## 🎯 REMEMBER

> **"Always use Git, always document, always test."**

This project has had issues with:
- Lost context between sessions
- Conflicting documentation
- Untested claims
- No Git workflow

**We're fixing that now with:**
- ✅ Clear documentation
- ✅ Git workflow
- ✅ Testing requirements
- ✅ Single source of truth

**Help us maintain this quality!**

---

<div align="center">

# 🎉 WELCOME TO THE TEAM!

**Let's build something amazing together!**

</div>

---

*Guide Version: 1.0.0*  
*Last Updated: October 8, 2025*  
*Repository: github.com/A-Alwabel/saudi-legal-ai*

