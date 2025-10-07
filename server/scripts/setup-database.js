const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/saudi-legal-ai-v2');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better performance
    console.log('🔧 Creating database indexes...');
    
    // User indexes
    await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.db.collection('users').createIndex({ lawFirmId: 1 });
    
    // Case indexes
    await mongoose.connection.db.collection('cases').createIndex({ lawFirmId: 1 });
    await mongoose.connection.db.collection('cases').createIndex({ clientId: 1 });
    await mongoose.connection.db.collection('cases').createIndex({ assignedLawyerId: 1 });
    await mongoose.connection.db.collection('cases').createIndex({ status: 1 });
    await mongoose.connection.db.collection('cases').createIndex({ caseType: 1 });
    
    // Client indexes
    await mongoose.connection.db.collection('clients').createIndex({ lawFirmId: 1 });
    await mongoose.connection.db.collection('clients').createIndex({ email: 1 });
    
    // Document indexes
    await mongoose.connection.db.collection('documents').createIndex({ lawFirmId: 1 });
    await mongoose.connection.db.collection('documents').createIndex({ caseId: 1 });
    await mongoose.connection.db.collection('documents').createIndex({ clientId: 1 });
    
    console.log('✅ Database indexes created successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

connectDB();
