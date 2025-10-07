# 🚀 Getting Started with Saudi Legal AI v2.0

## Quick Start Guide

### Prerequisites
- Node.js 20.x or higher
- MongoDB 7.x
- npm 9.x or higher

### 1. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd saudi-legal-ai-v2

# Install all dependencies
npm run install:all
```

### 2. Environment Setup

```bash
# Copy environment file
cp env.example .env

# Edit .env with your configuration
nano .env
```

Required environment variables:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/saudi-legal-ai-v2
JWT_SECRET=your-super-secret-jwt-key-change-in-production
OPENAI_API_KEY=your-openai-api-key
```

### 3. Database Setup

```bash
# Start MongoDB (if not running)
mongod

# Setup database and create indexes
npm run db:setup

# Seed with sample data (optional)
npm run db:seed
```

### 4. Start Development

```bash
# Start both client and server
npm run dev

# Or start individually
npm run server:dev  # Server only (port 5000)
npm run client:dev  # Client only (port 3000)
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## Sample Accounts

After running `npm run db:seed`:

- **Admin**: admin@saudi-law.com / password123
- **Lawyer**: lawyer@saudi-law.com / password123

## Project Structure

```
saudi-legal-ai-v2/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # Redux store
│   │   └── styles/        # Global styles
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── middleware/    # Express middleware
├── shared/                 # Shared code
│   └── types/             # TypeScript types
└── scripts/               # Database scripts
```

## Available Scripts

### Root Level
```bash
npm run dev              # Start both client and server
npm run build            # Build both client and server
npm run test             # Run all tests
npm run lint             # Lint all code
npm run type-check       # TypeScript type checking
npm run clean            # Clean all node_modules
```

### Client Only
```bash
cd client
npm start                # Start development server
npm run build            # Build for production
npm test                 # Run tests
npm run lint             # Lint code
```

### Server Only
```bash
cd server
npm run dev              # Start with nodemon
npm run build            # Build TypeScript
npm start                # Start production server
npm run db:setup         # Setup database
npm run db:seed          # Seed database
```

## Features Implemented

### ✅ Core Features
- User authentication and authorization
- AI legal consultation with OpenAI integration
- Dashboard with analytics
- Case management system
- Client management
- Document handling
- Multi-language support (Arabic/English)

### ✅ Technical Features
- TypeScript throughout
- Error boundaries and logging
- Rate limiting and security
- Input validation
- Responsive design
- Real-time updates with Socket.IO

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### AI Services
- `POST /api/v1/ai/consultation` - Get AI legal consultation
- `POST /api/v1/ai/analyze-document` - Analyze document
- `GET /api/v1/ai/suggestions` - Get case suggestions

### Cases
- `GET /api/v1/cases` - Get all cases
- `POST /api/v1/cases` - Create new case
- `GET /api/v1/cases/:id` - Get case by ID
- `PUT /api/v1/cases/:id` - Update case
- `DELETE /api/v1/cases/:id` - Delete case

### Clients
- `GET /api/v1/clients` - Get all clients
- `POST /api/v1/clients` - Create new client
- `GET /api/v1/clients/:id` - Get client by ID
- `PUT /api/v1/clients/:id` - Update client
- `DELETE /api/v1/clients/:id` - Delete client

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   npx kill-port 3000  # Kill process on port 3000
   npx kill-port 5000  # Kill process on port 5000
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
   npm run type-check
   ```

4. **Dependency Issues**
   ```bash
   npm run clean
   npm run install:all
   ```

## Next Steps

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

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting section

---

**🎉 Congratulations! You now have a fully functional Saudi Legal AI system!**
