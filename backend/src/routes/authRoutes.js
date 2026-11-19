const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  googleAuth,
  sendVerificationOTP,
  verifyEmailOTP,
  getUserProfile,
  updateUserProfile,
  toggleWishlist,
  getWishlist,
  updateAdminProfile,
  changeAdminPassword,
  uploadAdminProfilePhoto,
  getAdminUsers,
  updateAdminUserRole,
  applySeller,
} = require('../controllers/authController');

const { verifyToken, requireAdmin, optionalVerifyToken } = require('../middleware/authMiddleware');
const { adminLimiter } = require('../middleware/rateLimiter');
const { upload } = require('../middleware/uploadMiddleware');
const { adminLoginLimiter } = require('../middleware/rateLimiter');
const {
  adminLoginStepOne,
  resendAdminEmailOtp,
  verifyAdminEmailOtp,
  setupAdminTotp,
  verifyAdminTotpSetup,
  verifyAdminTotp,
  resetAdminTotpRequest,
  resetAdminTotpVerify,
} = require('../controllers/adminAuthController');

// Public routes with rate limiting
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/admin/login', adminLoginLimiter, adminLoginStepOne);
router.post('/admin/email-otp/resend', adminLoginLimiter, resendAdminEmailOtp);
router.post('/admin/email-otp/verify', adminLoginLimiter, verifyAdminEmailOtp);
router.post('/admin/totp/setup', adminLoginLimiter, setupAdminTotp);
router.post('/admin/totp/setup/verify', adminLoginLimiter, verifyAdminTotpSetup);
router.post('/admin/totp/verify', adminLoginLimiter, verifyAdminTotp);
router.post('/admin/totp/reset/request', verifyToken, requireAdmin, adminLimiter, resetAdminTotpRequest);
router.post('/admin/totp/reset/verify', verifyToken, requireAdmin, adminLimiter, resetAdminTotpVerify);

// Google Sign-In / Signup
router.post('/google', googleAuth);

// Gmail OTP Verification
router.post('/send-otp', sendVerificationOTP);
router.post('/verify-otp', verifyEmailOTP);

// Protected routes (require JWT)
router.route('/profile')
  .get(verifyToken, getUserProfile)
  .put(verifyToken, updateUserProfile);

// Wishlist routes
router.route('/wishlist')
  .get(verifyToken, getWishlist);

router.route('/wishlist/:productId')
  .post(verifyToken, toggleWishlist);

router.put('/admin/profile', verifyToken, requireAdmin, adminLimiter, updateAdminProfile);
router.put('/admin/password', verifyToken, requireAdmin, adminLimiter, changeAdminPassword);
router.post('/admin/profile-photo', verifyToken, requireAdmin, adminLimiter, upload.single('photo'), uploadAdminProfilePhoto);
router.post('/seller/apply', optionalVerifyToken, upload.single('logo'), applySeller);
router.get('/admin/users', verifyToken, requireAdmin, adminLimiter, getAdminUsers);
router.put('/admin/users/:id/role', verifyToken, requireAdmin, adminLimiter, updateAdminUserRole);

module.exports = router;
