const express = require('express');
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');

const { verifyToken } = require('../middleware/authMiddleware');

// All cart endpoints require user authentication
router.use(verifyToken);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/:itemId')
  .put(updateCartItem)
  .delete(removeCartItem);

module.exports = router;
