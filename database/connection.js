const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment from backend/.env if available
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sss_ecommerce';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`📡 Database Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
