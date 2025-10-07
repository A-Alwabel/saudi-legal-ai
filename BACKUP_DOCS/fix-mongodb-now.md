# 🚀 FIX MONGODB AUTHENTICATION - QUICK GUIDE

## Step 1: Go to MongoDB Atlas
1. Open: https://cloud.mongodb.com/
2. Sign in to your account

## Step 2: Reset Your Password
1. Click **"Database Access"** in left sidebar
2. Find user **"aalwabel"**
3. Click the **"Edit"** button (pencil icon)
4. Click **"Password"** section
5. Click **"Edit Password"**
6. Enter new password: **Pass123456**
   - ✅ Simple password
   - ✅ No special characters
   - ✅ Easy to remember
7. Click **"Update User"**

## Step 3: Verify Network Access
1. Go to **"Network Access"** in left sidebar
2. Check if your IP is whitelisted:
   - Your IP: **5.163.146.13**
   - OR click **"Allow Access from Anywhere"** (0.0.0.0/0)

## Step 4: Update Connection String
Edit `server/db-server.js` line 15:

```javascript
// Change FROM:
const MONGODB_URI = 'mongodb+srv://aalwabel:Bi123123@cluster0.qih14yv.mongodb.net/saudi-legal-ai?retryWrites=true&w=majority&appName=Cluster0';

// Change TO:
const MONGODB_URI = 'mongodb+srv://aalwabel:Pass123456@cluster0.qih14yv.mongodb.net/saudi-legal-ai?retryWrites=true&w=majority&appName=Cluster0';
```

## Step 5: Test Connection
```bash
cd server
node db-server.js
```

You should see:
```
✅ Connected to MongoDB Atlas!
🎉 Database initialized successfully!
```
