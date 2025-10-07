const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import models
const User = require('../dist/models/User').default;
const LawFirm = require('../dist/models/LawFirm').default;

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/saudi-legal-ai-v2');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await LawFirm.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create sample law firm
    const lawFirm = new LawFirm({
      name: 'مكتب المحاماة السعودي',
      licenseNumber: 'LF-2024-001',
      address: 'الرياض، المملكة العربية السعودية',
      phone: '+966501234567',
      email: 'info@saudi-law.com',
      subscriptionPlan: 'professional',
      isActive: true,
    });

    await lawFirm.save();
    console.log('✅ Created sample law firm');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 12);

    const adminUser = new User({
      name: 'أحمد محمد',
      email: 'admin@saudi-law.com',
      password: hashedPassword,
      role: 'admin',
      lawFirmId: lawFirm._id,
      isActive: true,
    });

    const lawyerUser = new User({
      name: 'فاطمة أحمد',
      email: 'lawyer@saudi-law.com',
      password: hashedPassword,
      role: 'lawyer',
      lawFirmId: lawFirm._id,
      isActive: true,
    });

    await adminUser.save();
    await lawyerUser.save();
    console.log('✅ Created sample users');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nSample accounts:');
    console.log('Admin: admin@saudi-law.com / password123');
    console.log('Lawyer: lawyer@saudi-law.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
