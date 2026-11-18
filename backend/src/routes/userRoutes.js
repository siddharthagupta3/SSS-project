const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { upload } = require('../middleware/uploadMiddleware');
const {
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  uploadAvatar,
  removeAvatar,
  changePassword,
} = require('../controllers/userController');

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.post('/addresses', verifyToken, authLimiter, addAddress);
router.put('/addresses/:addressId', verifyToken, authLimiter, updateAddress);
router.delete('/addresses/:addressId', verifyToken, authLimiter, deleteAddress);
router.put('/addresses/:addressId/default', verifyToken, authLimiter, setDefaultAddress);
router.post('/avatar', verifyToken, authLimiter, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', verifyToken, authLimiter, removeAvatar);
router.put('/password', verifyToken, authLimiter, changePassword);

module.exports = router;
