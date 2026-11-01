const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas or local MongoDB instance
 * Gracefully handles reconnects and logs connection events
 */
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sss_ecommerce';
    
    const conn = await mongoose.connect(mongoURI, {
      autoIndex: true, // Build indexes automatically in dev
    });

    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting reconnection...');
    });

    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    // Don't kill process immediately in dev so app can still respond to health checks
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
