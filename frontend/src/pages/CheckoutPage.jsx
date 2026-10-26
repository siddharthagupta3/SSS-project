import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheckIcon } from '../components/common/Icons';

// Helper to load Razorpay external checkout script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CheckoutPage = () => {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const promoDiscount = location.state?.promoDiscount || 0;
  const shippingFee = cartSubtotal > 999 ? 0 : 99;
  const tax = Math.round(cartSubtotal * 0.05);
  const total = Math.max(0, cartSubtotal - promoDiscount + shippingFee + tax);

  const [address, setAddress] = useState({
    fullName: user?.address?.fullName || user?.name || '',
    phone: user?.address?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || 'India',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleRazorpayPayment = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!address.fullName || !address.phone || !address.street || !address.city || !address.postalCode) {
      setErrorMessage('Please fill in all shipping details before proceeding.');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty. Add products first.');
      return;
    }

    setLoading(true);

    try {
      // 1. Prepare items payload
      const orderItems = cartItems.map((item) => ({
        product: item.product?._id || item.product,
        title: item.product?.title || item.title || 'Product',
        quantity: item.quantity,
        size: item.size || 'M',
        color: item.color || 'Standard',
      }));

      // 2. Call backend to create pending order and Razorpay order
      const res = await api.post('/api/orders/create-razorpay-order', {
        orderItems,
        shippingAddress: address,
      });

      if (!res.data.success) {
        throw new Error(res.data.message || 'Could not initiate order');
      }

      const { order, razorpayOrderId, amount, currency, keyId } = res.data.data;

      // 3. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || keyId.includes('placeholder')) {
        // Fallback simulation mode for testing when test key or script is restricted
        console.log('Simulating payment verification in sandbox mode...');
        const verifyRes = await api.post('/api/orders/verify-payment', {
          orderId: order._id,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_signature: 'test_signature_verified',
        });

        if (verifyRes.data.success) {
          await clearCart();
          navigate(`/order-success/${order._id}`);
          return;
        }
      }

      // 4. Open Razorpay Checkout modal
      const options = {
        key: keyId,
        amount: amount,
        currency: currency || 'INR',
        name: 'SHOP.CO',
        description: `Order #${order._id.slice(-6).toUpperCase()}`,
        order_id: razorpayOrderId,
        prefill: {
          name: address.fullName,
          email: user?.email || '',
          contact: address.phone,
        },
        theme: {
          color: '#000000',
        },
        handler: async (response) => {
          try {
            // Verify HMAC SHA-256 signature on backend
            const verifyRes = await api.post('/api/orders/verify-payment', {
              orderId: order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              await clearCart();
              navigate(`/order-success/${order._id}`);
            }
          } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Payment signature verification failed.');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', (response) => {
        setErrorMessage(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      razorpayInstance.open();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Payment failed to initialize');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 mb-8">
        CHECKOUT & PAYMENT
      </h1>

      {/* Razorpay Test Mode Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
        <span className="text-xl">💳</span>
        <div className="text-xs text-amber-900">
          <p className="font-bold">Razorpay Test Mode Active</p>
          <p className="mt-0.5 text-amber-700">
            This checkout uses Razorpay Test Mode. No real money will be charged. You can use test cards, UPI, or simulation.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl mb-6 font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleRazorpayPayment} className="grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Shipping Address Inputs */}
        <div className="md:col-span-2 space-y-6 bg-white border border-neutral-200 p-6 sm:p-8 rounded-3xl">
          <h2 className="text-lg font-bold text-neutral-900 border-b pb-3">Delivery Address</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="fullName"
                required
                value={address.fullName}
                onChange={handleInputChange}
                className="w-full bg-neutral-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
                placeholder="Rohan Sharma"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                required
                value={address.phone}
                onChange={handleInputChange}
                className="w-full bg-neutral-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
                placeholder="9876543210"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Street Address *</label>
            <input
              type="text"
              name="street"
              required
              value={address.street}
              onChange={handleInputChange}
              className="w-full bg-neutral-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
              placeholder="Flat 302, Green Valley Apartments, MG Road"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">City *</label>
              <input
                type="text"
                name="city"
                required
                value={address.city}
                onChange={handleInputChange}
                className="w-full bg-neutral-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
                placeholder="Bengaluru"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">State *</label>
              <input
                type="text"
                name="state"
                required
                value={address.state}
                onChange={handleInputChange}
                className="w-full bg-neutral-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
                placeholder="Karnataka"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">PIN / Postal Code *</label>
              <input
                type="text"
                name="postalCode"
                required
                value={address.postalCode}
                onChange={handleInputChange}
                className="w-full bg-neutral-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
                placeholder="560001"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Country</label>
            <input
              type="text"
              name="country"
              readOnly
              value={address.country}
              className="w-full bg-neutral-100 text-sm px-4 py-2.5 rounded-xl outline-none text-neutral-500"
            />
          </div>
        </div>

        {/* Order Review & Razorpay Pay Button */}
        <div className="md:col-span-1">
          <div className="bg-white border border-neutral-200 p-6 rounded-3xl space-y-6 sticky top-24">
            <h2 className="text-lg font-bold text-neutral-900 border-b pb-3">Payment Summary</h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Items Subtotal</span>
                <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Promo Discount</span>
                  <span>-₹{promoDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Delivery</span>
                <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>GST (5%)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-base font-black text-neutral-900">
                <span>Total Due</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-full font-bold text-sm hover:bg-neutral-800 transition active:scale-95 disabled:opacity-50 shadow-xl flex items-center justify-center gap-2"
            >
              <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
              <span>{loading ? 'Processing...' : `Pay ₹${total.toLocaleString('en-IN')} with Razorpay`}</span>
            </button>

            <p className="text-[11px] text-neutral-400 text-center leading-tight">
              By clicking "Pay", you authorize Razorpay to process the payment signature verification securely.
            </p>
          </div>
        </div>

      </form>
    </div>
  );
};

export default CheckoutPage;
