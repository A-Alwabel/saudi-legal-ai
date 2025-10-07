# 🔧 **Fix MongoDB Authentication Error**

## **Quick Fix Steps:**

### **Option 1: Reset Your MongoDB Password**
1. Go to MongoDB Atlas: https://cloud.mongodb.com/
2. Click **"Database Access"** in left sidebar
3. Find user `aalwabel`
4. Click **"Edit"** button
5. Click **"Password"** → **"Edit Password"**
6. Set new password (NO special characters like @ # $ % &)
   - Example: `Pass123456`
7. Click **"Update User"**

### **Option 2: Create New Database User**
1. Go to **"Database Access"**
2. Click **"Add New Database User"**
3. Username: `admin`
4. Password: `Admin123456` (or your choice - NO special chars)
5. Database User Privileges: **"Atlas Admin"**
6. Click **"Add User"**

### **Option 3: Use Connection String with Password**
If your password has special characters, URL-encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`

Example:
- Password: `Bi@123#` 
- Encoded: `Bi%40123%23`
- Connection: `mongodb+srv://aalwabel:Bi%40123%23@cluster0...`

---

## **After Fixing Password:**

Update `server/db-server.js` line 15:
```javascript
const MONGODB_URI = 'mongodb+srv://aalwabel:YourNewPassword@cluster0.qih14yv.mongodb.net/saudi-legal-ai?retryWrites=true&w=majority&appName=Cluster0';
```

Then test:
```bash
cd server
node db-server.js
```

You should see:
```
✅ Connected to MongoDB Atlas!
```
