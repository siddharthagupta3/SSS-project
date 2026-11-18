const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const sampleProducts = require('../data/sampleProducts.json');
const additionalDummyProducts = require('../data/additionalDummyProducts.json');

const seedData = async () => {
  try {
    await connectDB();

    console.log('🛡️ Keeping existing orders, carts and real/admin products intact...');

    console.log('👤 Seeding default users...');
    // Create Admin User
    let adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      adminUser = await User.create({
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
    }

    // Create Demo Customer User
    let customerUser = await User.findOne({ email: 'user@example.com' });
    if (!customerUser) {
      customerUser = await User.create({
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
    }

    console.log(`✅ Created Admin user: ${adminUser.email}`);
    console.log(`✅ Created Demo Customer user: ${customerUser.email}`);

    console.log('🛍️ Seeding products catalog...');
    // Add isDummy and source to all seed products
    const productsWithFlags = [...sampleProducts, ...additionalDummyProducts].map(p => ({
      ...p,
      isDummy: true,
      source: 'seed',
    }));
    let createdProducts = 0;
    for (const product of productsWithFlags) {
      const result = await Product.updateOne(
        {
          title: product.title,
          $or: [
            { source: 'seed' },
            { source: 'admin', isDummy: true },
            { source: { $exists: false }, isDummy: true },
          ],
        },
        { $set: product },
        { upsert: true, runValidators: true }
      );
      if (result.upsertedCount) createdProducts += 1;
    }
    console.log(`✅ Successfully seeded ${createdProducts} new dummy products; existing seed products preserved.`);

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
