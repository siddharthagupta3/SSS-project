const path = require('path');
// Add backend/node_modules to lookup paths so mongoose, bcryptjs and dotenv can be required from root or database
module.paths.push(path.join(__dirname, '../backend/node_modules'));

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment from backend/.env
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const connectDB = require('./connection');
const User = require('../backend/src/models/User');
const Product = require('../backend/src/models/Product');
const Cart = require('../backend/src/models/Cart');
const Order = require('../backend/src/models/Order');

const sampleProducts = require('./sampleProducts.json');

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
        street: '123 E-Commerce Boulevard',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
        phone: '9876543210',
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
        street: '45 Green Park Avenue',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India',
        phone: '9812345678',
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
    console.log('  Admin User: admin@example.com  | Password: Admin@123password');
    console.log('  Customer:   user@example.com   | Password: User@123password');
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
