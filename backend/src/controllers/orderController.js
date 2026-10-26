const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const getRazorpayInstance = require('../config/razorpay');

/**
 * @desc    Create Razorpay Order & initiate pending Order in database
 * @route   POST /api/orders/create-razorpay-order
 * @access  Private
 */
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items provided');
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      res.status(400);
      throw new Error('Complete shipping address is required');
    }

    // Verify prices & stock directly from DB to prevent client-side price tampering
    let itemsPrice = 0;
    const verifiedOrderItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.title}`);
      }

      if (product.stock < item.quantity) {
        res.status(400);
        throw new Error(`Not enough stock for ${product.title}. Available: ${product.stock}`);
      }

      const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
      itemsPrice += effectivePrice * item.quantity;

      verifiedOrderItems.push({
        title: product.title,
        quantity: item.quantity,
        image: product.images[0],
        price: effectivePrice,
        size: item.size || 'M',
        color: item.color || 'Standard',
        product: product._id,
      });
    }

    // Calculate free shipping over ₹999, otherwise ₹99 delivery charge
    const shippingPrice = itemsPrice > 999 ? 0 : 99;
    const taxPrice = Math.round(itemsPrice * 0.05); // 5% GST
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // Create Razorpay Order
    let razorpayOrderId = `test_order_${Date.now()}`;
    const isMock = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('placeholder');

    if (!isMock) {
      try {
        const razorpay = getRazorpayInstance();
        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(totalPrice * 100), // amount in paise
          currency: 'INR',
          receipt: `rcpt_${Date.now().toString().slice(-10)}`,
        });
        razorpayOrderId = razorpayOrder.id;
      } catch (err) {
        console.error('Razorpay SDK Order creation failed, falling back to sandbox mode:', err.message);
      }
    }

    // Create pending Order in database
    const order = await Order.create({
      user: req.user._id,
      orderItems: verifiedOrderItems,
      shippingAddress,
      paymentMethod: 'Razorpay',
      paymentResult: {
        razorpay_order_id: razorpayOrderId,
        status: 'Pending',
      },
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: false,
      orderStatus: 'Processing',
    });

    res.status(201).json({
      success: true,
      data: {
        order,
        razorpayOrderId,
        amount: Math.round(totalPrice * 100),
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Razorpay payment signature & mark order paid
 * @route   POST /api/orders/verify-payment
 * @access  Private
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const isMock = !secret || secret.includes('placeholder');

    let isValid = false;

    if (isMock) {
      // In development / demo mode when keys are placeholders, accept the simulated signature
      isValid = true;
    } else {
      // Production HMAC SHA-256 signature verification
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body.toString())
        .digest('hex');

      isValid = expectedSignature === razorpay_signature;
    }

    if (isValid) {
      // Mark order as paid
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id || `pay_${Date.now()}`,
        razorpay_signature: razorpay_signature || 'verified_signature',
        status: 'Success',
      };

      await order.save();

      // Decrement product stock
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }

      // Clear user's active cart
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

      res.status(200).json({
        success: true,
        message: 'Payment verified and order confirmed successfully',
        data: order,
      });
    } else {
      res.status(400);
      throw new Error('Payment signature verification failed. Fraudulent attempt detected.');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged in user's order history
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order details by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Ensure only order owner or admin can view order
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Access forbidden. You do not own this order.');
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders across system
 * @route   GET /api/orders
 * @access  Private/Admin
 */
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status (Processing -> Shipped -> Delivered -> Cancelled)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.orderStatus = orderStatus;
    if (orderStatus === 'Delivered') {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${orderStatus}`,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
