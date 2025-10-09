const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://aalwabel:RvdRFdgsd7GSQBcA@cluster0.qih14yv.mongodb.net/saudi-legal-ai?retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('📡 Ready State:', mongoose.connection.readyState);
    
    // List collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📂 Collections in database:');
    console.log('='.repeat(50));
    
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  ${collection.name}: ${count} documents`);
    }
    
    console.log('='.repeat(50));
    console.log('\n✅ MongoDB Connection Test PASSED!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MongoDB Connection Test FAILED!');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testConnection();

