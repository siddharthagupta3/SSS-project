const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * @desc    Get current logged in user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'title price discountPrice images stock brand category',
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add item to cart or increment quantity
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, size = 'M', color = 'Standard' } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      res.status(400);
      throw new Error(`Only ${product.stock} units available in stock`);
    }

    const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [
          {
            product: productId,
            quantity: Number(quantity),
            size,
            color,
            price: effectivePrice,
          },
        ],
      });
    } else {
      // Check if product with same size and color already in cart
      const existingItemIndex = cart.items.findIndex(
        (item) =>
          item.product.toString() === productId &&
          item.size === size &&
          item.color === color
      );

      if (existingItemIndex > -1) {
        const newQuantity = cart.items[existingItemIndex].quantity + Number(quantity);
        if (product.stock < newQuantity) {
          res.status(400);
          throw new Error(`Cannot add more than ${product.stock} units to cart`);
        }
        cart.items[existingItemIndex].quantity = newQuantity;
        cart.items[existingItemIndex].price = effectivePrice;
      } else {
        cart.items.push({
          product: productId,
          quantity: Number(quantity),
          size,
          color,
          price: effectivePrice,
        });
      }
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'title price discountPrice images stock brand category',
    });

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:itemId
 * @access  Private
 */
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (!quantity || quantity < 1) {
      res.status(400);
      throw new Error('Quantity must be at least 1');
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }

    const item = cart.items.id(itemId);
    if (!item) {
      res.status(404);
      throw new Error('Item not found in cart');
    }

    const product = await Product.findById(item.product);
    if (product && product.stock < quantity) {
      res.status(400);
      throw new Error(`Only ${product.stock} units available in stock`);
    }

    item.quantity = Number(quantity);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'title price discountPrice images stock brand category',
    });

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove an item from cart
 * @route   DELETE /api/cart/:itemId
 * @access  Private
 */
const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'title price discountPrice images stock brand category',
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
