const express = require('express');
const router = express.Router();

const {
  getProducts,
  getFeaturedProducts,
  getProductCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
} = require('../controllers/productController');

const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Public catalog routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getProductCategories);
router.get('/:id', getProductById);

// Customer review route
router.post('/:id/reviews', verifyToken, createProductReview);

// Admin-only management routes
router.post('/', verifyToken, requireAdmin, createProduct);
router.put('/:id', verifyToken, requireAdmin, updateProduct);
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

module.exports = router;
