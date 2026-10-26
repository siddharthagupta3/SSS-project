const Product = require('../models/Product');

/**
 * @desc    Fetch all products with search, category filter, price filter, sorting & pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;

    // Build filter query
    const filter = {};

    // Keyword search on title, brand, description
    if (req.query.keyword && req.query.keyword.trim() !== '') {
      filter.$or = [
        { title: { $regex: req.query.keyword.trim(), $options: 'i' } },
        { brand: { $regex: req.query.keyword.trim(), $options: 'i' } },
        { description: { $regex: req.query.keyword.trim(), $options: 'i' } },
      ];
    }

    // Category filter
    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // Default newest first
    if (req.query.sort === 'price-low') {
      sortOptions = { price: 1 };
    } else if (req.query.sort === 'price-high') {
      sortOptions = { price: -1 };
    } else if (req.query.sort === 'rating') {
      sortOptions = { rating: -1 };
    } else if (req.query.sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    }

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortOptions)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.status(200).json({
      success: true,
      data: {
        products,
        page,
        pages: Math.ceil(count / pageSize) || 1,
        totalProducts: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured products & new arrivals for homepage
 * @route   GET /api/products/featured
 * @access  Public
 */
const getFeaturedProducts = async (req, res, next) => {
  try {
    const featured = await Product.find({ isFeatured: true }).limit(8);
    const newArrivals = await Product.find({ isNewArrival: true }).limit(8);

    res.status(200).json({
      success: true,
      data: {
        featured,
        newArrivals,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all distinct product categories
 * @route   GET /api/products/categories
 * @access  Public
 */
const getProductCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.status(200).json({
        success: true,
        data: product,
      });
    } else {
      res.status(404);
      throw new Error('Product not found with the requested ID');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      discountPrice,
      category,
      brand,
      stock,
      images,
      sizes,
      colors,
      isFeatured,
      isNewArrival,
    } = req.body;

    if (!title || !description || !price || !category || !images || images.length === 0) {
      res.status(400);
      throw new Error('Please fill all required fields: title, description, price, category, images');
    }

    const product = new Product({
      title,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      category,
      brand: brand || 'SHOP.CO',
      stock: stock !== undefined ? Number(stock) : 10,
      images: Array.isArray(images) ? images : [images],
      sizes: sizes && sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
      colors: colors && colors.length > 0 ? colors : ['Black', 'White'],
      isFeatured: Boolean(isFeatured),
      isNewArrival: Boolean(isNewArrival),
    });

    const createdProduct = await product.save();
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: createdProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    product.title = req.body.title || product.title;
    product.description = req.body.description || product.description;
    product.price = req.body.price !== undefined ? Number(req.body.price) : product.price;
    product.discountPrice = req.body.discountPrice !== undefined ? Number(req.body.discountPrice) : product.discountPrice;
    product.category = req.body.category || product.category;
    product.brand = req.body.brand || product.brand;
    product.stock = req.body.stock !== undefined ? Number(req.body.stock) : product.stock;
    if (req.body.images && req.body.images.length > 0) {
      product.images = req.body.images;
    }
    if (req.body.sizes) product.sizes = req.body.sizes;
    if (req.body.colors) product.colors = req.body.colors;
    if (req.body.isFeatured !== undefined) product.isFeatured = req.body.isFeatured;
    if (req.body.isNewArrival !== undefined) product.isNewArrival = req.body.isNewArrival;

    const updatedProduct = await product.save();
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
