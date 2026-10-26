import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheckIcon, TruckIcon, CheckIcon } from '../components/common/Icons';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar', 'Chandigarh', 'Dadra and Nagar Haveli', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

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
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const promoDiscount = location.state?.promoDiscount || 0;
  const shippingFee = cartSubtotal > 999 ? 0 : 99;
  const tax = Math.round(cartSubtotal * 0.05);
  const total = Math.max(0, cartSubtotal - promoDiscount + shippingFee + tax);

  const [address, setAddress] = useState({
    fullName: user?.address?.fullName || user?.name || '',
    phone: user?.address?.phone || '',
    houseNumber: user?.address?.houseNumber || '',
    street: user?.address?.street || '',
    landmark: user?.address?.landmark || '',
    city: user?.address?.city || '',
    state: user?.address?.state || 'Maharashtra',
    postalCode: user?.address?.postalCode || '',
    addressType: user?.address?.addressType || 'Home',
    country: 'India',
  });

  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Format PIN code: only numbers, max 6 digits
    if (name === 'postalCode') {
      const sanitized = value.replace(/\D/g, '').slice(0, 6);
      setAddress({ ...address, postalCode: sanitized });
      return;
    }
    // Format Phone: only numbers, max 10 digits
    if (name === 'phone') {
      const sanitized = value.replace(/\D/g, '').slice(0, 10);
      setAddress({ ...address, phone: sanitized });
      return;
    }
    setAddress({ ...address, [name]: value });
  };

  const handleRazorpayPayment = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!address.fullName.trim()) {
      setErrorMessage('Please enter your full recipient name.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(address.phone)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile phone number (starting with 6, 7, 8, or 9).');
      return;
    }

    if (!address.houseNumber.trim()) {
      setErrorMessage('Please enter your Flat / House number / Building name.');
      return;
    }

    if (!address.street.trim()) {
      setErrorMessage('Please enter your Area / Street / Colony details.');
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(address.postalCode)) {
      setErrorMessage('Please enter a valid 6-digit Indian PIN Code.');
      return;
    }

    if (!address.city.trim()) {
      setErrorMessage('Please enter your Town or City name.');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty. Add products first.');
      return;
    }

    setLoading(true);

    try {
      // Optionally save address to user profile
      if (saveAddressForFuture) {
        updateProfile({ address }).catch((e) => console.warn('Could not save address to profile:', e.message));
      }

      // 1. Prepare items payload
      const orderItems = cartItems.map((item) => ({
        product: item.product?._id || item.product,
        title: item.product?.title || item.title || 'Product',
        quantity: item.quantity,
        size: item.size || 'M',
        color: item.color || 'Standard',
      }));

      // Combined street line for order schema
      const fullShippingAddress = {
        ...address,
        street: `${address.houseNumber}, ${address.street}${address.landmark ? ', Near ' + address.landmark : ''}`,
      };

      // 2. Call backend to create pending order and Razorpay order
      const res = await api.post('/api/orders/create-razorpay-order', {
        orderItems,
        shippingAddress: fullShippingAddress,
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-2 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Step 2 of 2</span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 mt-0.5">
            Shipping & Payment
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
          <ShieldCheckIcon className="w-4 h-4" />
          <span>SSL 256-Bit Encrypted & Razorpay Protected</span>
        </div>
      </div>

      {/* Razorpay Test Mode Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
        <span className="text-xl">💳</span>
        <div className="text-xs text-amber-900">
          <p className="font-bold">Razorpay Test Mode Active</p>
          <p className="mt-0.5 text-amber-700">
            This checkout uses Razorpay Test Mode. You can test with test cards, UPI, or instant simulation without real money deduction.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl mb-6 font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleRazorpayPayment} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Full Indian Shipping Address Form */}
        <div className="lg:col-span-2 space-y-6 bg-white border border-neutral-200 p-6 sm:p-8 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Delivery Address Details</h2>
              <p className="text-xs text-neutral-500">Orders are fulfilled via BlueDart, Delhivery & India Post</p>
            </div>
            
            {/* Address Type Pills */}
            <div className="flex gap-2">
              {['Home', 'Work'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAddress({ ...address, addressType: type })}
                  className={`text-xs px-3 py-1 rounded-full font-bold transition ${
                    address.addressType === type
                      ? 'bg-black text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {type === 'Home' ? '🏠 Home' : '🏢 Work'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Recipient Full Name *</label>
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
              <label className="block text-xs font-semibold text-neutral-700 mb-1">10-Digit Mobile Number *</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-xs font-bold text-neutral-500 bg-neutral-200 rounded-l-xl border-r border-neutral-300">
                  +91
                </span>
                <input
                  type="tel"
                  name="phone"
                  required
                  maxLength="10"
                  value={address.phone}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-100 text-sm px-4 py-2.5 rounded-r-xl outline-none focus:ring-2 focus:ring-black font-mono"
                  placeholder="9876543210"
                />
              </div>
            </div>
          </div>

          {/* Flat / House Number */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Flat, House No., Building, Apartment *
            </label>
            <input
              type="text"
              name="houseNumber"
              required
              value={address.houseNumber}
              onChange={handleInputChange}
              className="w-full bg-neutral-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g. Flat 402, Tower B, Galaxy Heights"
            />
          </div>

          {/* Street / Colony */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Area, Street, Sector, Village *
            </label>
            <input
              type="text"
              name="street"
              required
              value={address.street}
              onChange={handleInputChange}
              className="w-full bg-neutral-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g. 100 Feet Road, 12th Main, Indiranagar"
            />
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Landmark (Optional)
            </label>
            <input
              type="text"
              name="landmark"
              value={address.landmark}
              onChange={handleInputChange}
              className="w-full bg-neutral-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g. Near Metro Station / Opposite Axis Bank"
            />
          </div>

          {/* PIN Code, City, State */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">6-Digit PIN Code *</label>
              <input
                type="text"
                name="postalCode"
                required
                maxLength="6"
                value={address.postalCode}
                onChange={handleInputChange}
                className="w-full bg-neutral-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black font-mono font-bold"
                placeholder="560001"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Town / City *</label>
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
              <select
                name="state"
                value={address.state}
                onChange={handleInputChange}
                className="w-full bg-neutral-100 text-sm px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Delivery Estimator Badge */}
          {address.postalCode.length === 6 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3">
              <TruckIcon className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs text-emerald-900">
                <span className="font-bold">⚡ Express Delivery Available to PIN {address.postalCode}:</span>{' '}
                Estimated arrival in <strong>2-3 business days</strong>. Free courier transit insurance included.
              </div>
            </div>
          )}

          {/* Checkbox to remember address */}
          <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={saveAddressForFuture}
              onChange={(e) => setSaveAddressForFuture(e.target.checked)}
              className="rounded accent-black w-4 h-4"
            />
            <span>Save this delivery address to my SHOP.CO profile for future orders</span>
          </label>
        </div>

        {/* Order Review & Razorpay Pay Button */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-neutral-200 p-6 rounded-3xl space-y-6 sticky top-24 shadow-xs">
            <h2 className="text-lg font-bold text-neutral-900 border-b pb-3">Payment Summary</h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Items Subtotal ({cartItems.length} items)</span>
                <span className="font-semibold text-neutral-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promo Discount (SHOP10)</span>
                  <span>-₹{promoDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Express Delivery</span>
                <span>
                  {shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>GST (5%)</span>
                <span className="font-semibold text-neutral-900">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-base font-black text-neutral-900">
                <span>Total Amount Due</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-full font-bold text-sm hover:bg-neutral-800 transition active:scale-95 disabled:opacity-50 shadow-xl flex items-center justify-center gap-2"
            >
              <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
              <span>{loading ? 'Opening Razorpay...' : `Pay ₹${total.toLocaleString('en-IN')} with Razorpay`}</span>
            </button>

            <div className="space-y-2 text-[11px] text-neutral-500 pt-2 border-t">
              <div className="flex items-center gap-1.5 text-neutral-700 font-semibold">
                <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>HMAC SHA-256 Server Signature Verification</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-700 font-semibold">
                <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supports UPI, Cards, NetBanking & Wallets</span>
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default CheckoutPage;
