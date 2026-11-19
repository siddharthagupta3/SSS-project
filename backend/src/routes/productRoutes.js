const express = require('express');
const router = express.Router();

const {
  getProducts,
  getFeaturedProducts,
  getNewArrivals,
  getTopSelling,
  getProductCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteAllDemoProducts,
  createProductReview,
} = require('../controllers/productController');

const { verifyToken, requireAdmin, requireSeller } = require('../middleware/authMiddleware');
const { adminLimiter } = require('../middleware/rateLimiter');
const { upload, uploadToCloudinary } = require('../middleware/uploadMiddleware');

// Public catalog routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/top-selling', getTopSelling);
router.get('/categories', getProductCategories);
router.get('/:id', getProductById);

// Customer review route
router.post('/:id/reviews', verifyToken, createProductReview);

// Admin-only management routes
router.post('/', verifyToken, requireSeller, adminLimiter, createProduct);
router.post('/upload', verifyToken, requireSeller, adminLimiter, upload.array('images', 5), async (req, res, next) => {
  try {
    const uploads = await Promise.all((req.files || []).map((file) => uploadToCloudinary(file)));
    res.status(200).json({
      success: true,
      data: uploads.filter(Boolean).map((item) => item.secure_url),
    });
  } catch (error) {
    next(error);
  }
});
router.delete('/demo/all', verifyToken, requireAdmin, adminLimiter, deleteAllDemoProducts);
router.put('/:id', verifyToken, requireSeller, adminLimiter, updateProduct);
router.delete('/:id', verifyToken, requireSeller, adminLimiter, deleteProduct);

module.exports = router;
