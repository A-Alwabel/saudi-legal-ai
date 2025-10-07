# 🚨 SYSTEM NOT WORKING - COMPLETE FIX

## Issue: "I can't navigate to anything"

This means the servers aren't running properly.

---

## ✅ COMPLETE SOLUTION

### Step 1: Start Backend Server

**Open Command Prompt or PowerShell** and run:

```powershell
cd C:\Users\User\Desktop\saudi-legal-ai-v2\server
node db-server.js
```

**Keep this window open!** You should see:
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB Atlas
✅ Database: saudi-legal-ai
🚀 Server running on port 5000
```

---

### Step 2: Start Frontend Server

**Open ANOTHER Command Prompt/PowerShell** and run:

```powershell
cd C:\Users\User\Desktop\saudi-legal-ai-v2\client-nextjs
npm run dev
```

**Keep this window open too!** You should see:
```
- ready started server on 0.0.0.0:3005
✓ Ready in 3.2s
○ Local:   http://localhost:3005
```

---

### Step 3: Open Browser

Go to: **http://localhost:3005**

---

## 🎯 EASIER METHOD - Use PowerShell Script

I created a script that starts both servers automatically:

### Run This:

```powershell
cd C:\Users\User\Desktop\saudi-legal-ai-v2
powershell -ExecutionPolicy Bypass -File start-system.ps1
```

This will:
- ✅ Open 2 windows (backend & frontend)
- ✅ Start both servers automatically
- ✅ Open browser after 10 seconds

---

## 🔍 TROUBLESHOOTING

### Problem: "Port already in use"

**Solution:**
```powershell
# Kill processes on ports
npx kill-port 5000
npx kill-port 3005
```

Then restart servers.

---

### Problem: "Cannot find module"

**Solution:**
```powershell
# Reinstall dependencies
cd server
npm install

cd ..\client-nextjs
npm install
```

---

### Problem: "MongoDB connection failed"

**Solution:**
Check internet connection. The system uses MongoDB Atlas (cloud database).

---

### Problem: "npm command not found"

**Solution:**
Install Node.js from: https://nodejs.org/

---

## ✅ VERIFICATION CHECKLIST

Before trying to use the system:

- [ ] Backend server is running (port 5000)
- [ ] Frontend server is running (port 3005)
- [ ] Both terminal windows are still open
- [ ] No error messages in terminals
- [ ] Browser can access http://localhost:3005

---

## 🎯 MANUAL STARTUP (GUARANTEED TO WORK)

### Terminal 1 - Backend:
```powershell
cd C:\Users\User\Desktop\saudi-legal-ai-v2
cd server
node db-server.js
```

**Wait for:** "🚀 Server running on port 5000"

### Terminal 2 - Frontend:
```powershell
cd C:\Users\User\Desktop\saudi-legal-ai-v2
cd client-nextjs
npm run dev
```

**Wait for:** "✓ Ready in X seconds"

### Browser:
```
http://localhost:3005
```

---

## 📊 EXPECTED OUTPUT

### Backend Terminal Should Show:
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB Atlas
✅ Database: saudi-legal-ai
📊 Collections initialized:
   - users
   - cases
   - clients
   - documents
   - tasks
   - invoices
   - payments
   - lawfirms
   - legaldocuments (16 laws loaded)
🚀 Server running on port 5000
```

### Frontend Terminal Should Show:
```
> saudi-legal-ai-client@0.1.0 dev
> next dev -p 3005

- ready started server on 0.0.0.0:3005, url: http://localhost:3005
- event compiled client and server successfully in 2.8s (1234 modules)
✓ Ready in 3.2s
○ Local:   http://localhost:3005
```

---

## 🚨 COMMON MISTAKES

### ❌ Mistake 1: Closing Terminal Windows
**Don't close** the terminal windows! Both servers need to keep running.

### ❌ Mistake 2: Wrong Directory
Make sure you're in the correct directory:
- Backend: `saudi-legal-ai-v2/server`
- Frontend: `saudi-legal-ai-v2/client-nextjs`

### ❌ Mistake 3: Not Waiting
Wait for servers to fully start before opening browser (10-15 seconds).

---

## ✅ SUCCESS INDICATORS

You'll know it's working when:

1. ✅ Backend terminal shows "Server running on port 5000"
2. ✅ Frontend terminal shows "Ready in X seconds"
3. ✅ Browser loads http://localhost:3005
4. ✅ You see the Saudi Legal AI homepage
5. ✅ You can click "Login" and see the login page

---

## 🎯 QUICK TEST

After starting both servers, test these URLs:

1. **Frontend**: http://localhost:3005
   - Should show homepage

2. **Backend Health**: http://localhost:5000/health
   - Should show: `{"status":"healthy"}`

3. **Law Database**: http://localhost:5000/api/ai/law-database-stats
   - Should show: `{"totalDocuments":16}`

If all three work → System is running correctly! ✅

---

## 📞 STILL NOT WORKING?

### Share This Info:

1. **Backend terminal output**: Copy/paste what you see
2. **Frontend terminal output**: Copy/paste what you see
3. **Browser error**: What do you see in browser?
4. **Console errors**: Press F12 in browser, check Console tab

---

## 🎯 ABSOLUTE SIMPLEST METHOD

### Copy and paste these commands ONE BY ONE:

**Step 1:**
```powershell
cd C:\Users\User\Desktop\saudi-legal-ai-v2\server
```

**Step 2:**
```powershell
node db-server.js
```

**Keep this window open!**

**Step 3:** Open NEW terminal window

**Step 4:**
```powershell
cd C:\Users\User\Desktop\saudi-legal-ai-v2\client-nextjs
```

**Step 5:**
```powershell
npm run dev
```

**Keep this window open too!**

**Step 6:** Wait 15 seconds

**Step 7:** Open browser to http://localhost:3005

---

**That's it! The system should now be accessible.** 🎉
