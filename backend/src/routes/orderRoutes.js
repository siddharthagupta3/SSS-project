const express = require('express');
const router = express.Router();

const {
  createRazorpayOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// User authenticated endpoints
router.post('/create-razorpay-order', verifyToken, createRazorpayOrder);
router.post('/verify-payment', verifyToken, verifyPayment);
router.get('/my-orders', verifyToken, getMyOrders);
router.get('/:id', verifyToken, getOrderById);

// Admin-only endpoints
router.get('/', verifyToken, requireAdmin, getAllOrders);
router.put('/:id/status', verifyToken, requireAdmin, updateOrderStatus);

module.exports = router;
