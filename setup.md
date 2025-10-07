# 🚀 Saudi Legal AI v2.0 - Setup Guide

## ✅ What's New in v2.0

### 🧹 **Clean Architecture**
- **No Duplicates**: Removed all duplicate services and files
- **TypeScript**: Full type safety throughout the application
- **Modular Design**: Clean separation of concerns
- **Error Handling**: Comprehensive error boundaries and logging

### 🔒 **Security First**
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive validation on all inputs
- **CORS Configuration**: Proper cross-origin setup

### 🎨 **Modern UI/UX**
- **Material-UI v5**: Latest design system
- **Error Boundaries**: Graceful error handling
- **Loading States**: Better user experience
- **Responsive Design**: Works on all devices

### 🧪 **Quality Assurance**
- **TypeScript**: Compile-time error checking
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting
- **Testing Ready**: Jest configuration included

---

## 🛠️ Quick Start

### 1. **Prerequisites**
```bash
# Required software
Node.js >= 20.0.0
MongoDB >= 7.0.0
npm >= 9.0.0
```

### 2. **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd saudi-legal-ai-v2

# Install all dependencies
npm run install:all

# Copy environment file
cp env.example .env

# Edit .env with your configuration
nano .env
```

### 3. **Environment Setup**
```bash
# Required environment variables
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/saudi-legal-ai-v2
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
```

### 4. **Database Setup**
```bash
# Start MongoDB
mongod

# Setup database (in another terminal)
npm run db:setup
```

### 5. **Start Development**
```bash
# Start both client and server
npm run dev

# Or start individually
npm run server:dev  # Server only
npm run client:dev  # Client only
```

### 6. **Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

---

## 📁 Project Structure

```
saudi-legal-ai-v2/
├── 📁 client/                 # React Frontend
│   ├── 📁 src/
│   │   ├── 📁 components/     # Reusable UI components
│   │   ├── 📁 pages/         # Page components
│   │   ├── 📁 hooks/         # Custom React hooks
│   │   ├── 📁 services/      # API services
│   │   ├── 📁 store/         # Redux store
│   │   ├── 📁 types/         # TypeScript types
│   │   └── 📁 utils/         # Utility functions
│   └── 📄 package.json
├── 📁 server/                 # Node.js Backend
│   ├── 📁 src/
│   │   ├── 📁 controllers/   # Route controllers
│   │   ├── 📁 services/      # Business logic
│   │   ├── 📁 models/        # Database models
│   │   ├── 📁 routes/        # API routes
│   │   ├── 📁 middleware/    # Express middleware
│   │   └── 📁 utils/         # Utility functions
│   └── 📄 package.json
├── 📁 shared/                 # Shared code
│   ├── 📁 types/             # Shared TypeScript types
│   └── 📁 constants/         # Shared constants
└── 📄 package.json           # Root package.json
```

---

## 🔧 Available Scripts

### **Root Level**
```bash
npm run dev              # Start both client and server
npm run build            # Build both client and server
npm run test             # Run all tests
npm run lint             # Lint all code
npm run type-check       # TypeScript type checking
npm run clean            # Clean all node_modules
```

### **Client Only**
```bash
cd client
npm start                # Start development server
npm run build            # Build for production
npm test                 # Run tests
npm run lint             # Lint code
```

### **Server Only**
```bash
cd server
npm run dev              # Start with nodemon
npm run build            # Build TypeScript
npm start                # Start production server
npm test                 # Run tests
npm run db:setup         # Setup database
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:e2e         # End-to-end tests only

# Run with coverage
npm run test:coverage
```

---

## 🚀 Deployment

### **Development**
```bash
npm run dev
```

### **Production**
```bash
# Build everything
npm run build

# Start production server
npm start
```

### **Docker** (Coming Soon)
```bash
# Build Docker image
docker build -t saudi-legal-ai-v2 .

# Run container
docker run -p 3000:3000 -p 5000:5000 saudi-legal-ai-v2
```

---

## 🔍 Key Features Implemented

### ✅ **Core Features**
- User authentication and authorization
- Case management system
- Client management
- Document handling
- AI legal consultation
- Analytics dashboard

### ✅ **Technical Features**
- TypeScript throughout
- Error boundaries
- Rate limiting
- Input validation
- Logging system
- Database models

### ✅ **Security Features**
- JWT authentication
- Password hashing
- CORS protection
- Rate limiting
- Input sanitization

---

## 🐛 Troubleshooting

### **Common Issues**

1. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   npx kill-port 3000
   
   # Kill process on port 5000
   npx kill-port 5000
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Check if MongoDB is running
   mongosh
   
   # Start MongoDB service
   sudo systemctl start mongod
   ```

3. **TypeScript Errors**
   ```bash
   # Check TypeScript configuration
   npm run type-check
   
   # Reinstall types
   npm install @types/node @types/react
   ```

4. **Dependency Issues**
   ```bash
   # Clean install
   npm run clean
   npm run install:all
   ```

---

## 📚 Next Steps

1. **Add More Features**
   - Document analysis
   - Calendar integration
   - Email notifications
   - Advanced analytics

2. **Improve AI**
   - Better legal knowledge base
   - More accurate predictions
   - Multi-language support

3. **Enhance Security**
   - Two-factor authentication
   - Audit logging
   - Data encryption

4. **Scale Up**
   - Database optimization
   - Caching layer
   - Load balancing

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details.

---

**🎉 Congratulations! You now have a clean, modern, and scalable Saudi Legal AI system!**
