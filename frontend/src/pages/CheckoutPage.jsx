import React, { useEffect, useState } from 'react';
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
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  useEffect(() => {
    api.get('/users/profile')
      .then((res) => {
        const data = res.data.data;
        const addressList = data.addresses || [];
        setSavedAddresses(addressList);
        const defaultAddress = addressList.find((item) => item.isDefault) || addressList[0];
        if (defaultAddress) {
          setAddress({
            fullName: defaultAddress.fullName || '',
            phone: defaultAddress.phone || '',
            houseNumber: defaultAddress.houseNumber || '',
            street: defaultAddress.street || '',
            landmark: defaultAddress.landmark || '',
            city: defaultAddress.city || '',
            state: defaultAddress.state || 'Maharashtra',
            postalCode: defaultAddress.postalCode || '',
            addressType: defaultAddress.addressType || 'Home',
            country: 'India',
          });
        }
      })
      .catch(() => {});
  }, []);

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
        api.post('/users/addresses', { ...address, isDefault: true })
          .catch((e) => console.warn('Could not save address to profile:', e.response?.data?.message || e.message));
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
      const res = await api.post('/orders/create-razorpay-order', {
        orderItems,
        shippingAddress: fullShippingAddress,
        promoDiscount,
      });

      if (!res.data.success) {
        throw new Error(res.data.message || 'Could not initiate order');
      }

      const { order, razorpayOrderId, amount, currency, keyId } = res.data.data;

      // 3. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || keyId.includes('placeholder')) {
        setPendingPayment({ order, razorpayOrderId });
        setLoading(false);
        return;
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
            const verifyRes = await api.post('/orders/verify-payment', {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/15 gap-2 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-white/40">Step 2 of 2</span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mt-0.5">
            Shipping & Payment
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
          <ShieldCheckIcon className="w-4 h-4" />
          <span>SSL 256-Bit Encrypted & Razorpay Protected</span>
        </div>
      </div>

      {/* Flipkart-Style Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-xs font-semibold text-white/80">
        <div className="border border-white/15 rounded-2xl p-3 flex items-center gap-2.5">
          <ShieldCheckIcon className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>100% Safe & Secure Payment</span>
        </div>
        <div className="border border-white/15 rounded-2xl p-3 flex items-center gap-2.5">
          <TruckIcon className="w-5 h-5 text-blue-600 shrink-0" />
          <span>Tracked Express Courier Delivery</span>
        </div>
        <div className="border border-white/15 rounded-2xl p-3 flex items-center gap-2.5">
          <CheckIcon className="w-5 h-5 text-purple-600 shrink-0" />
          <span>7-Day Replacement Guarantee</span>
        </div>
      </div>

      {errorMessage && (
        <div className="border border-red-500/40 text-red-400 text-sm p-4 rounded-xl mb-6 font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleRazorpayPayment} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {savedAddresses.length > 0 && (
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-white/80 mb-2">Use a saved address</label>
            <select
              className="w-full text-sm text-white placeholder-white/40 px-4 py-2.5 rounded-xl"
              defaultValue=""
              onChange={(e) => {
                const selected = savedAddresses.find((item) => item._id === e.target.value);
                if (selected) setAddress({
                  fullName: selected.fullName,
                  phone: selected.phone,
                  houseNumber: selected.houseNumber,
                  street: selected.street,
                  landmark: selected.landmark || '',
                  city: selected.city,
                  state: selected.state,
                  postalCode: selected.postalCode,
                  addressType: selected.addressType || 'Home',
                  country: 'India',
                });
              }}
            >
              <option value="" disabled>Select saved address</option>
              {savedAddresses.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.fullName} — {item.houseNumber}, {item.city} {item.postalCode}{item.isDefault ? ' (Default)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Full Indian Shipping Address Form */}
        <div className="lg:col-span-2 space-y-6 border border-white/10 p-6 sm:p-8 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Delivery Address Details</h2>
              <p className="text-xs text-white/50">Orders are fulfilled via BlueDart, Delhivery & India Post</p>
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
                      : 'bg-white/8 text-white/60 hover:bg-white/8'
                  }`}
                >
                  {type === 'Home' ? '🏠 Home' : '🏢 Work'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">Recipient Full Name *</label>
              <input
                type="text"
                name="fullName"
                required
                value={address.fullName}
                onChange={handleInputChange}
                className="w-full text-sm text-white placeholder-white/40 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
                placeholder="Rohan Sharma"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">10-Digit Mobile Number *</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-xs font-bold text-white/50 bg-white/8 rounded-l-xl border-r border-white/20">
                  +91
                </span>
                <input
                  type="tel"
                  name="phone"
                  required
                  maxLength="10"
                  value={address.phone}
                  onChange={handleInputChange}
                  className="w-full text-sm text-white placeholder-white/40 px-4 py-2.5 rounded-r-xl outline-none focus:ring-2 focus:ring-black font-mono"
                  placeholder="9876543210"
                />
              </div>
            </div>
          </div>

          {/* Flat / House Number */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1">
              Flat, House No., Building, Apartment *
            </label>
            <input
              type="text"
              name="houseNumber"
              required
              value={address.houseNumber}
              onChange={handleInputChange}
              className="w-full text-sm text-white placeholder-white/40 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g. Flat 402, Tower B, Galaxy Heights"
            />
          </div>

          {/* Street / Colony */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1">
              Area, Street, Sector, Village *
            </label>
            <input
              type="text"
              name="street"
              required
              value={address.street}
              onChange={handleInputChange}
              className="w-full text-sm text-white placeholder-white/40 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g. 100 Feet Road, 12th Main, Indiranagar"
            />
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1">
              Landmark (Optional)
            </label>
            <input
              type="text"
              name="landmark"
              value={address.landmark}
              onChange={handleInputChange}
              className="w-full text-sm text-white placeholder-white/40 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g. Near Metro Station / Opposite Axis Bank"
            />
          </div>

          {/* PIN Code, City, State */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">6-Digit PIN Code *</label>
              <input
                type="text"
                name="postalCode"
                required
                maxLength="6"
                value={address.postalCode}
                onChange={handleInputChange}
                className="w-full text-sm text-white placeholder-white/40 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black font-mono font-bold"
                placeholder="560001"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">Town / City *</label>
              <input
                type="text"
                name="city"
                required
                value={address.city}
                onChange={handleInputChange}
                className="w-full text-sm text-white placeholder-white/40 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
                placeholder="Bengaluru"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">State *</label>
              <select
                name="state"
                value={address.state}
                onChange={handleInputChange}
                className="w-full text-sm text-white placeholder-white/40 px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
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
          <label className="flex items-center gap-2 text-xs font-semibold text-white/80 cursor-pointer pt-2">
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
          <div className="border border-white/10 p-6 rounded-3xl space-y-6 sticky top-24 shadow-xs">
            <h2 className="text-lg font-bold text-white border-b pb-3">Payment Summary</h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-white/60">
                <span>Items Subtotal ({cartItems.length} items)</span>
                <span className="font-semibold text-white">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promo Discount (SHOP10)</span>
                  <span>-₹{promoDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-white/60">
                <span>Express Delivery</span>
                <span>
                  {shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>GST (5%)</span>
                <span className="font-semibold text-white">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-base font-black text-white">
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

            <div className="space-y-2 text-[11px] text-white/50 pt-2 border-t">
              <div className="flex items-center gap-1.5 text-white/80 font-semibold">
                <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>HMAC SHA-256 Server Signature Verification</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/80 font-semibold">
                <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supports UPI, Cards, NetBanking & Wallets</span>
              </div>
            </div>
          </div>
        </div>

      </form>

      {pendingPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setPendingPayment(null)}>
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-transparent shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Razorpay Secure Checkout</p>
                <h2 className="mt-1 text-lg font-black">₹{total.toLocaleString('en-IN')}</h2>
              </div>
              <button type="button" onClick={() => setPendingPayment(null)} className="h-10 w-10 rounded-full border border-white/15 text-xl">×</button>
            </div>
            <div className="p-5">
              <p className="mb-3 text-xs font-bold text-white/50">Choose payment method</p>
              <div className="grid grid-cols-3 gap-2">
                {['UPI', 'Card', 'Netbanking'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`rounded-2xl border px-2 py-3 text-xs font-black ${
                      paymentMethod === method ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-white/15 text-white/60'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
              {paymentMethod === 'UPI' && (
                <input required placeholder="yourname@upi" className="mt-4 w-full rounded-xl bg-white/8 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
              )}
              {paymentMethod === 'Card' && (
                <input required inputMode="numeric" maxLength="16" placeholder="Card number" className="mt-4 w-full rounded-xl bg-white/8 px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-600" />
              )}
              {paymentMethod === 'Netbanking' && (
                <select className="mt-4 w-full rounded-xl bg-white/8 px-4 py-3 text-sm"><option>SBI</option><option>HDFC Bank</option><option>ICICI Bank</option></select>
              )}
              <button
                type="button"
                onClick={async () => {
                  try {
                    setLoading(true);
                    const verifyRes = await api.post('/orders/verify-payment', {
                      orderId: pendingPayment.order._id,
                      razorpay_order_id: pendingPayment.razorpayOrderId,
                      razorpay_payment_id: `pay_test_${Date.now()}`,
                      razorpay_signature: 'test_signature_verified',
                    });
                    if (verifyRes.data.success) {
                      await clearCart();
                      setPendingPayment(null);
                      navigate(`/order-success/${pendingPayment.order._id}`);
                    }
                  } catch (err) {
                    setErrorMessage(err.response?.data?.message || 'Payment could not be completed.');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="mt-5 w-full rounded-full bg-blue-600 py-3.5 text-sm font-black text-white hover:bg-blue-700"
              >
                Pay ₹{total.toLocaleString('en-IN')}
              </button>
              <p className="mt-3 text-center text-[10px] text-white/40">Test checkout UI — configure live Razorpay keys for real payments.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
