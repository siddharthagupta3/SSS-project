const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Force use local MongoDB for development
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/sss_ecommerce';
console.log('📡 Using local MongoDB: mongodb://127.0.0.1:27017/sss_ecommerce');

const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const sampleProducts = require('../data/sampleProducts.json');

const seedData = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing collections...');
    await User.deleteMany();
    await Product.deleteMany();
    await Cart.deleteMany();
    await Order.deleteMany();

    console.log('👤 Seeding default users...');
    // Create Admin User
    const adminUser = await User.create({
      name: 'Admin Manager',
      email: 'admin@example.com',
      password: 'Admin@123password',
      role: 'admin',
      address: {
        fullName: 'Admin Headquarter',
        phone: '9876543210',
        houseNumber: 'A-101',
        street: '123 E-Commerce Boulevard',
        landmark: 'Near Metro Station',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        addressType: 'Work',
        country: 'India',
      },
    });

    // Create Demo Customer User
    const customerUser = await User.create({
      name: 'Rohan Sharma',
      email: 'user@example.com',
      password: 'User@123password',
      role: 'user',
      address: {
        fullName: 'Rohan Sharma',
        phone: '9812345678',
        houseNumber: 'B-205',
        street: '45 Green Park Avenue',
        landmark: 'Near Central Park',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        addressType: 'Home',
        country: 'India',
      },
    });

    console.log(`✅ Created Admin user: ${adminUser.email}`);
    console.log(`✅ Created Demo Customer user: ${customerUser.email}`);

    console.log('🛍️ Seeding products catalog...');
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Successfully seeded ${createdProducts.length} products!`);

    console.log('\n=========================================');
    console.log('🎉 Database Seeding Completed Successfully');
    console.log('Credentials for Testing:');
    console.log('  Admin User: admin@example.com');
    console.log('  Customer:   user@example.com');
    console.log('  (Default password: User@123password)');
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
