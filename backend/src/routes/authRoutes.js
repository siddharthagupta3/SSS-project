const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  sendVerificationOTP,
  verifyEmailOTP,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/authController');

const { verifyToken } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes with rate limiting
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);

// Gmail OTP Verification
router.post('/send-otp', authLimiter, sendVerificationOTP);
router.post('/verify-otp', authLimiter, verifyEmailOTP);

// Protected routes (require JWT)
router.route('/profile')
  .get(verifyToken, getUserProfile)
  .put(verifyToken, updateUserProfile);

module.exports = router;
