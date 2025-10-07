# 🏛️ Saudi Legal AI Assistant v2.0
## نظام الذكاء الاصطناعي للمحاماة السعودي - النسخة المحسنة

<div align="center">

⚠️ **DEVELOPMENT STATUS: 25-30% COMPLETE** ⚠️

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-In%20Development-yellow.svg)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)
![React](https://img.shields.io/badge/React-18.x-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Not%20Connected-red.svg)

**نظام شامل لإدارة مكاتب المحاماة مدعوم بتقنيات الذكاء الاصطناعي المتطورة**  
**(Currently in development - NOT production ready)**

</div>

---

## 🚧 **IMPORTANT NOTICE - اشعار مهم**

**This project is under active development and is NOT ready for production use.**

### Current Status:
- ✅ **Frontend UI** - 70% complete (35+ pages created)
- ⚠️ **Backend API** - 10% (mock server only)  
- ❌ **Database** - Not connected (auth error)
- ❌ **AI System** - Not implemented
- ❌ **Authentication** - Mock only (no real JWT)

### What's Working:
- ✅ Frontend pages and navigation
- ✅ Arabic/English translations
- ✅ Mock API responses
- ✅ UI components and forms

### What's NOT Working:
- ❌ Real data persistence
- ❌ User authentication
- ❌ AI features
- ❌ File uploads
- ❌ Real-time updates
- ❌ Production security

---

## 🎯 نظرة عامة

نظام الذكاء الاصطناعي للمحاماة السعودي v2.0 هو نظام قيد التطوير يهدف إلى:

- 🚧 **كود نظيف ومنظم** - جاري العمل عليه
- 🚧 **أمان متقدم** - لم يتم تنفيذه بعد
- 🚧 **أداء محسن** - يحتاج تحسينات
- ✅ **واجهة مستخدم حديثة** - تم إنجاز معظمها
- ❌ **اختبارات شاملة** - لم تبدأ بعد

---

## ✨ الميزات الرئيسية

### 🤖 المساعد القانوني الذكي
- استشارات قانونية فورية باللغة العربية
- تحليل المستندات القانونية
- البحث في قاعدة بيانات القوانين السعودية
- تنبؤ بنتائج القضايا
- صياغة العقود والمذكرات

### 📋 إدارة القضايا
- تتبع شامل لجميع مراحل القضية
- جدولة ذكية للمواعيد والجلسات
- تقارير تفصيلية وتحليلات
- تكامل مع الأنظمة الحكومية

### 👥 إدارة العملاء
- ملفات شاملة للعملاء
- تاريخ القضايا والتفاعلات
- إدارة المالية والفواتير
- بوابة عملاء متقدمة

### 📄 إدارة المستندات
- تخزين آمن ومشفر
- استخراج البيانات من الملفات
- تصنيف تلقائي للمستندات
- تحكم في الوصول والصلاحيات

---

## 🛠️ التقنيات المستخدمة

### Frontend
- **React 18** - مكتبة واجهات المستخدم
- **TypeScript** - كتابة آمنة للكود
- **Material-UI v5** - مكونات واجهة المستخدم
- **Redux Toolkit** - إدارة الحالة
- **React Query** - إدارة البيانات
- **i18next** - الترجمة والدولية

### Backend
- **Node.js 20** - منصة التشغيل
- **Express.js** - إطار عمل الخادم
- **TypeScript** - كتابة آمنة للكود
- **MongoDB** - قاعدة البيانات
- **Mongoose** - أداة النمذجة
- **JWT** - المصادقة

### الذكاء الاصطناعي
- **OpenAI GPT-4** - النموذج اللغوي
- **LangChain** - إطار عمل الذكاء الاصطناعي
- **Vector Embeddings** - البحث الدلالي
- **PDF Processing** - معالجة المستندات

---

## 🔧 Current Issues & How to Fix

### MongoDB Connection Error
```
❌ MongoDB connection error: MongoServerError: bad auth : authentication failed
```

**To fix:**
1. Go to MongoDB Atlas: https://cloud.mongodb.com/
2. Navigate to Database Access
3. Reset password for user `aalwabel` (use simple password without special chars)
4. Update `server/db-server.js` line 15 with new password
5. Run: `cd server && node db-server.js`

### TypeScript Backend Compilation Errors
```
❌ 390+ TypeScript errors in server/src/
```

**Current workaround:** Using `mock-server.js` instead of TypeScript backend

---

## 🚀 البدء السريع / Quick Start

### المتطلبات / Requirements
- Node.js 20.x أو أحدث
- MongoDB Atlas account (free tier)
- npm أو yarn

### التثبيت / Installation
```bash
# استنساخ المشروع
git clone https://github.com/your-username/saudi-legal-ai-v2.git
cd saudi-legal-ai-v2

# تثبيت التبعيات
npm install

# Currently using mock server (no .env needed yet)

# Option 1: Run with Mock Server (Currently Working)
# Terminal 1:
cd server
node mock-server.js

# Terminal 2:
cd client-nextjs
npm run dev

# Option 2: Run with Database (After fixing MongoDB password)
# Terminal 1:
cd server
node db-server.js  # Requires MongoDB Atlas connection fix

# Terminal 2:
cd client-nextjs
npm run dev

# Option 3: Use batch files (Windows)
start-mock-server.bat    # For mock server
start-with-database.bat   # For database (needs fix)
```

### الوصول للنظام / System Access
- **الواجهة الأمامية / Frontend**: http://localhost:3005
- **API الخادم / Backend**: http://localhost:5000
- **Login**: Any email/password (mock accepts all)
- **قاعدة البيانات**: mongodb://localhost:27017

---

## 📁 بنية المشروع

```
saudi-legal-ai-v2/
├── 📁 client/                 # تطبيق React
│   ├── 📁 src/
│   │   ├── 📁 components/     # المكونات
│   │   ├── 📁 pages/         # الصفحات
│   │   ├── 📁 hooks/         # Custom Hooks
│   │   ├── 📁 services/      # خدمات API
│   │   ├── 📁 store/         # إدارة الحالة
│   │   ├── 📁 types/         # TypeScript Types
│   │   └── 📁 utils/         # الأدوات المساعدة
│   └── 📄 package.json
├── 📁 server/                 # خادم Node.js
│   ├── 📁 src/
│   │   ├── 📁 controllers/   # تحكم API
│   │   ├── 📁 services/      # خدمات الأعمال
│   │   ├── 📁 models/        # نماذج البيانات
│   │   ├── 📁 routes/        # مسارات API
│   │   ├── 📁 middleware/    # وسطاء Express
│   │   ├── 📁 utils/         # الأدوات المساعدة
│   │   └── 📁 types/         # TypeScript Types
│   └── 📄 package.json
├── 📁 shared/                 # كود مشترك
│   ├── 📁 types/             # أنواع مشتركة
│   └── 📁 constants/         # ثوابت مشتركة
├── 📁 docs/                   # التوثيق
├── 📁 tests/                  # الاختبارات
└── 📄 package.json           # إدارة المشروع
```

---

## 🧪 الاختبارات

```bash
# تشغيل جميع الاختبارات
npm test

# اختبارات الوحدة
npm run test:unit

# اختبارات التكامل
npm run test:integration

# اختبارات E2E
npm run test:e2e

# تقرير التغطية
npm run test:coverage
```

---

## 🔐 الأمان

- تشفير شامل للبيانات الحساسة
- مصادقة متعددة العوامل
- عزل كامل للبيانات بين المكاتب
- تسجيل شامل للأنشطة
- نسخ احتياطي منتظمة

---

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

---

## 🤝 المساهمة

نرحب بالمساهمات! راجع [دليل المساهمة](CONTRIBUTING.md) للتفاصيل.

---

<div align="center">

**مصنوع بـ ❤️ في المملكة العربية السعودية**

*لخدمة العدالة وتطوير القطاع القانوني*

</div>
