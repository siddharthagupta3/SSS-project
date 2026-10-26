const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  googleAuth,
  sendVerificationOTP,
  verifyEmailOTP,
  getUserProfile,
  updateUserProfile,
  toggleWishlist,
  getWishlist,
} = require('../controllers/authController');

const { verifyToken } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes with rate limiting
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);

// Google Sign-In / Signup
router.post('/google', authLimiter, googleAuth);

// Gmail OTP Verification
router.post('/send-otp', authLimiter, sendVerificationOTP);
router.post('/verify-otp', authLimiter, verifyEmailOTP);

// Protected routes (require JWT)
router.route('/profile')
  .get(verifyToken, getUserProfile)
  .put(verifyToken, updateUserProfile);

// Wishlist routes
router.route('/wishlist')
  .get(verifyToken, getWishlist);

router.route('/wishlist/:productId')
  .post(verifyToken, toggleWishlist);

module.exports = router;
