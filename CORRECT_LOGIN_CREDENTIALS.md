# ✅ CORRECT LOGIN CREDENTIALS

## 🔑 Use These Credentials

```
Email: demo@saudilegal.com
Password: password123
```

⚠️ **Note**: It's `saudilegal.com` (NO hyphen), not `saudi-law.com`

---

## ❌ Common Mistake

**Wrong**: `demo@saudi-law.com` (with hyphen) ❌  
**Correct**: `demo@saudilegal.com` (no hyphen) ✅

---

## 🎯 Login Steps

1. Go to: **http://localhost:3005/ar/login**

2. Enter:
   ```
   Email: demo@saudilegal.com
   Password: password123
   ```

3. Click "دخول" (Sign In)

4. You should be redirected to: **http://localhost:3005/ar/dashboard** ✅

---

## ✅ What Happens After Login

After successful login, the system will:
1. ✅ Validate your credentials
2. ✅ Generate authentication token
3. ✅ Store token in localStorage and cookies
4. ✅ Redirect to dashboard (`/ar/dashboard` or `/en/dashboard`)
5. ✅ Show dashboard with statistics and navigation menu

---

## 📊 Available Demo Accounts

The system has these demo accounts:

### Main Demo Account:
```
Email: demo@saudilegal.com
Password: password123
Role: Admin/Lawyer
```

---

## 🔍 If Login Still Doesn't Work

### Check 1: Verify Backend is Running
```powershell
curl http://localhost:5000/api/health
```
Should return: `{"status":"ok","database":"connected"}`

### Check 2: Check Database Has Users
The backend should show this on startup:
```
✅ Default user created (email: demo@saudilegal.com, password: password123)
```

### Check 3: Try Registering New User
If demo account doesn't work, register a new one:
1. Go to: http://localhost:3005/ar/register
2. Fill in the form
3. Create new account

---

## 🎯 Expected Login Flow

### Step-by-Step:

1. **Visit Login Page**
   ```
   http://localhost:3005/ar/login
   ```

2. **Enter Credentials**
   ```
   Email: demo@saudilegal.com
   Password: password123
   ```

3. **Click Sign In**
   - Frontend sends POST to `/api/auth/login`
   - Backend validates credentials
   - Backend returns token + user data

4. **Redirect to Dashboard**
   ```
   http://localhost:3005/ar/dashboard
   ```

5. **Dashboard Loads**
   - Shows statistics
   - Navigation menu visible
   - Can access all features

---

## 🔐 Backend Login Process

When you login, the backend:

1. ✅ Receives email and password
2. ✅ Looks up user in MongoDB
3. ✅ Compares password (bcrypt)
4. ✅ Generates JWT token (valid 7 days)
5. ✅ Returns token + user info
6. ✅ Frontend stores token
7. ✅ Frontend redirects to dashboard

---

## 📝 Login Logs (What You Should See)

In the **backend terminal**, you should see:
```
🔐 Login attempt: demo@saudilegal.com
✅ User found: demo@saudilegal.com
🔑 Comparing passwords...
🔑 Password valid: true
```

If you see:
```
❌ User not found: demo@saudilegal.com
```
Then the database needs to be reinitialized.

---

## 🔧 If User Not Found

### Solution: Restart Backend

The backend creates the demo user on startup. If it's not found:

1. **Stop backend** (Ctrl+C in backend window)

2. **Restart backend**:
   ```powershell
   cd C:\Users\User\Desktop\saudi-legal-ai-v2\server
   node db-server.js
   ```

3. **Look for this message**:
   ```
   ✅ Default user created (email: demo@saudilegal.com, password: password123)
   ```

4. **Try login again**

---

## 🎯 Quick Test

### Test Login via API:

```powershell
$body = @{
    email = "demo@saudilegal.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -ContentType "application/json" -Body $body
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "...",
      "name": "Demo User",
      "email": "demo@saudilegal.com",
      "role": "admin"
    }
  },
  "message": "Login successful"
}
```

---

## ✅ REMEMBER

**Correct Email**: `demo@saudilegal.com` (no hyphen!)

**Password**: `password123`

**After Login**: Should go to `/ar/dashboard` or `/en/dashboard`

---

**Try it now with the correct email!** 🎯

