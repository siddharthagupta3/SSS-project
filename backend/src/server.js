const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to Database
const connectDB = require('./config/db');
connectDB();

// Import error middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security Middlewares
app.use(helmet());

// CORS Configuration
const configuredOrigins = [
  process.env.CLIENT_URL,
  process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []),
]
  .map((origin) => origin?.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) =>
  !origin ||
  configuredOrigins.includes(origin) ||
  origin.startsWith('http://localhost:') ||
  origin.startsWith('http://127.0.0.1:') ||
  origin.startsWith('https://localhost:') ||
  origin.startsWith('https://127.0.0.1:') ||
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin) ||
  /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman) or matching origin
      // Also allow all localhost ports for development
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked request from origin: ${origin}`));
      }
    },
    credentials: true,
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Base / Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SSS E-Commerce API is running smoothly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root Welcome Route
app.get('/', (req, res) => {
  res.send('<h1>SSS E-Commerce API is Live</h1><p>Visit /api/health for system status.</p>');
});

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Error Handling Middlewares (must be registered after all routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 SSS E-Commerce Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app;
