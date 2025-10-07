# 🚀 DEPLOYMENT GUIDE - Saudi Legal AI v2
**Last Updated:** October 1, 2025  
**Version:** 2.0.0  
**Status:** Production Ready

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### **Required:**
- [x] Frontend builds successfully
- [x] Backend server runs without errors
- [x] MongoDB Atlas connected
- [x] Authentication working
- [x] AI endpoints operational
- [x] All critical APIs tested
- [ ] Environment variables configured
- [ ] Security review completed
- [ ] Performance testing done
- [ ] Documentation updated

---

## 🛠️ **LOCAL TESTING**

### **Step 1: Start the System**
```bash
# Option 1: Use startup script
scripts\start-production.bat

# Option 2: Manual start
# Terminal 1 - Backend
cd server
node db-server.js

# Terminal 2 - Frontend
cd client-nextjs
npm run dev
```

### **Step 2: Test All Features**
```powershell
# Run comprehensive test
powershell -ExecutionPolicy Bypass -File scripts\test-all-features.ps1
```

### **Step 3: Verify Build**
```bash
cd client-nextjs
npm run build
```

---

## 🌐 **PRODUCTION DEPLOYMENT**

### **Option 1: Deploy to Vercel (Frontend) + Railway (Backend)**

#### **Frontend - Vercel:**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
cd client-nextjs
vercel --prod

# 4. Set environment variables in Vercel dashboard:
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
```

#### **Backend - Railway:**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Initialize project
cd server
railway init

# 4. Deploy
railway up

# 5. Set environment variables:
MONGODB_URI=mongodb+srv://aalwabel:RvdRFdgsd7GSQBcA@cluster0.qih14yv.mongodb.net/saudi-legal-ai
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=production
PORT=5000
```

---

### **Option 2: Deploy to AWS (Full Stack)**

#### **Frontend - AWS Amplify:**
```bash
# 1. Install Amplify CLI
npm install -g @aws-amplify/cli

# 2. Configure Amplify
amplify configure

# 3. Initialize app
cd client-nextjs
amplify init

# 4. Add hosting
amplify add hosting

# 5. Deploy
amplify publish
```

#### **Backend - AWS Elastic Beanstalk:**
```bash
# 1. Install EB CLI
pip install awsebcli

# 2. Initialize EB
cd server
eb init

# 3. Create environment
eb create production-env

# 4. Set environment variables
eb setenv MONGODB_URI=your-connection-string JWT_SECRET=your-secret

# 5. Deploy
eb deploy
```

---

### **Option 3: Deploy to DigitalOcean (Full Stack)**

#### **Setup Droplet:**
```bash
# 1. Create Ubuntu 22.04 droplet (2GB RAM minimum)
# 2. SSH into droplet
ssh root@your-droplet-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install PM2
npm install -g pm2

# 5. Clone repository
git clone https://github.com/your-repo/saudi-legal-ai-v2.git
cd saudi-legal-ai-v2

# 6. Install dependencies
npm install
cd client-nextjs && npm install && cd ..
cd server && npm install && cd ..

# 7. Build frontend
cd client-nextjs
npm run build
cd ..

# 8. Setup PM2
pm2 start server/db-server.js --name backend
pm2 start "npm run start" --name frontend
pm2 startup
pm2 save

# 9. Setup Nginx
sudo apt install nginx
sudo nano /etc/nginx/sites-available/saudi-legal-ai

# Add Nginx config (see below)
```

#### **Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```

---

## 🔐 **ENVIRONMENT VARIABLES**

### **Backend (.env):**
```bash
# Database
MONGODB_URI=mongodb+srv://aalwabel:RvdRFdgsd7GSQBcA@cluster0.qih14yv.mongodb.net/saudi-legal-ai?retryWrites=true&w=majority

# Authentication
JWT_SECRET=change-this-to-a-random-64-character-string-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### **Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_APP_NAME=Saudi Legal AI
NEXT_PUBLIC_APP_VERSION=2.0.0
```

---

## 🔒 **SECURITY HARDENING**

### **1. Change Default Credentials:**
```javascript
// server/db-server.js
// Change these values:
const DEFAULT_EMAIL = 'admin@yourdomain.com'; // Change this
const DEFAULT_PASSWORD = 'YourSecurePassword123!'; // Change this
const JWT_SECRET = process.env.JWT_SECRET || 'change-in-production'; // Use env var
```

### **2. Enable HTTPS:**
```bash
# Using Let's Encrypt (Free SSL)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### **3. Set Proper CORS:**
```javascript
// server/db-server.js
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'https://yourdomain.com',
  credentials: true
};
app.use(cors(corsOptions));
```

### **4. Enable Rate Limiting:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### **5. MongoDB Security:**
- ✅ Enable IP Whitelist in Atlas
- ✅ Use strong password
- ✅ Enable encryption at rest
- ✅ Regular backups
- ✅ Monitor access logs

---

## 📊 **MONITORING & MAINTENANCE**

### **1. Setup Monitoring:**
```bash
# Install PM2 monitoring
pm2 install pm2-logrotate

# Setup log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### **2. Health Checks:**
```bash
# Create health check endpoint (already exists)
curl https://api.yourdomain.com/api/health

# Setup uptime monitoring (UptimeRobot, Pingdom, etc.)
```

### **3. Database Backups:**
```bash
# MongoDB Atlas has automatic backups
# Additional manual backup:
mongodump --uri="your-connection-string" --out=/backup/$(date +%Y%m%d)
```

### **4. Log Management:**
```bash
# View logs
pm2 logs

# Save logs
pm2 logs --json > logs.json

# Clear logs
pm2 flush
```

---

## 🚀 **DEPLOYMENT COMMANDS**

### **Quick Deploy:**
```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install
cd client-nextjs && npm install && cd ..

# 3. Build frontend
cd client-nextjs && npm run build && cd ..

# 4. Restart services
pm2 restart all

# 5. Verify
pm2 status
curl https://api.yourdomain.com/api/health
```

### **Zero-Downtime Deploy:**
```bash
# 1. Start new instance
pm2 start server/db-server.js --name backend-new

# 2. Wait for health check
sleep 5

# 3. Stop old instance
pm2 stop backend

# 4. Rename new instance
pm2 delete backend
pm2 restart backend-new --name backend

# 5. Save configuration
pm2 save
```

---

## 🧪 **POST-DEPLOYMENT TESTING**

### **1. Smoke Tests:**
```bash
# Health check
curl https://yourdomain.com/api/health

# Authentication
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@saudilegal.com","password":"password123"}'

# AI endpoint
curl -X POST https://yourdomain.com/api/v1/ai/consultation \
  -H "Content-Type: application/json" \
  -d '{"query":"Test question","context":{}}'
```

### **2. Load Testing:**
```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test endpoint
ab -n 1000 -c 10 https://yourdomain.com/api/health

# Results should show:
# - < 200ms average response time
# - 0% failed requests
```

### **3. Security Scan:**
```bash
# Install OWASP ZAP or use online tools
# Scan for common vulnerabilities
# Fix any critical/high severity issues
```

---

## 📝 **ROLLBACK PROCEDURE**

### **If Something Goes Wrong:**
```bash
# 1. Stop current deployment
pm2 stop all

# 2. Checkout previous version
git checkout previous-stable-tag

# 3. Rebuild
npm install
cd client-nextjs && npm install && npm run build && cd ..

# 4. Restart
pm2 restart all

# 5. Verify
curl https://yourdomain.com/api/health
```

---

## 📞 **SUPPORT & TROUBLESHOOTING**

### **Common Issues:**

#### **Issue: Frontend won't connect to backend**
```bash
# Check CORS settings
# Verify NEXT_PUBLIC_API_URL
# Check firewall rules
# Verify backend is running
```

#### **Issue: Database connection fails**
```bash
# Check MongoDB Atlas IP whitelist
# Verify connection string
# Check network connectivity
# Review MongoDB Atlas status
```

#### **Issue: High CPU/Memory usage**
```bash
# Check PM2 metrics
pm2 monit

# Optimize database queries
# Enable caching
# Scale horizontally
```

---

## 🎯 **SUCCESS CRITERIA**

### **Deployment is successful when:**
- ✅ All health checks pass
- ✅ Users can login successfully
- ✅ All CRUD operations work
- ✅ AI consultation responds
- ✅ No critical errors in logs
- ✅ Response times < 500ms
- ✅ Uptime > 99.9%

---

## 📅 **MAINTENANCE SCHEDULE**

### **Daily:**
- Check error logs
- Monitor uptime
- Review performance metrics

### **Weekly:**
- Update dependencies
- Review security patches
- Backup verification

### **Monthly:**
- Full system audit
- Performance optimization
- Feature updates

---

**🎉 System is now ready for production deployment!**

**Need help?** Contact support or review documentation at `/docs`

---

*Last updated: October 1, 2025*
