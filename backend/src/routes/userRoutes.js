const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/authMiddleware');
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
router.post('/addresses', verifyToken, addAddress);
router.put('/addresses/:addressId', verifyToken, updateAddress);
router.delete('/addresses/:addressId', verifyToken, deleteAddress);
router.put('/addresses/:addressId/default', verifyToken, setDefaultAddress);
router.post('/avatar', verifyToken, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', verifyToken, removeAvatar);
router.put('/password', verifyToken, changePassword);

module.exports = router;
