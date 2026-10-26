import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
} from '../components/common/Icons';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, cartSubtotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'SHOP10') {
      const discount = Math.round(cartSubtotal * 0.1);
      setPromoDiscount(discount);
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Try "SHOP10"');
      setPromoDiscount(0);
      setPromoApplied(false);
    }
  };

  const shippingFee = cartSubtotal > 999 || cartSubtotal === 0 ? 0 : 99;
  const tax = Math.round(cartSubtotal * 0.05);
  const total = Math.max(0, cartSubtotal - promoDiscount + shippingFee + tax);

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout', { state: { promoDiscount, promoCode: promoApplied ? 'SHOP10' : '' } });
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400">
          <ShoppingBagIcon className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight text-neutral-900">Your Cart is Empty</h2>
        <p className="text-sm text-neutral-500 mt-2 max-w-sm mx-auto">
          Looks like you haven't added anything to your cart yet. Explore our latest drops!
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-block bg-black text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-neutral-800 transition"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 mb-8">
        YOUR CART
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-neutral-200 rounded-3xl p-6 bg-white space-y-6">
            {cartItems.map((item) => {
              const product = item.product || {};
              const title = product.title || item.title || 'Product';
              const image = product.images?.[0] || item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800';
              const price = item.price || product.discountPrice || product.price || 0;

              return (
                <div
                  key={item._id}
                  className="flex gap-4 sm:gap-6 pb-6 border-b border-neutral-100 last:border-b-0 last:pb-0"
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl overflow-hidden bg-neutral-100 shrink-0">
                    <img src={image} alt={title} className="w-full h-full object-cover" />
                  </div>

                  {/* Info & Adjuster */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          to={`/product/${product._id || item.product}`}
                          className="font-bold text-sm sm:text-base text-neutral-900 hover:underline line-clamp-1"
                        >
                          {title}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove item"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-1 flex gap-3 text-xs text-neutral-500">
                        {item.size && <span>Size: <strong className="text-neutral-800">{item.size}</strong></span>}
                        {item.color && <span>Color: <strong className="text-neutral-800">{item.color}</strong></span>}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <span className="font-extrabold text-base sm:text-lg text-neutral-900">
                        ₹{(price * item.quantity).toLocaleString('en-IN')}
                      </span>

                      {/* Quantity counter */}
                      <div className="flex items-center gap-3 bg-neutral-100 rounded-full px-3 py-1 text-xs">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="text-neutral-600 hover:text-black disabled:opacity-40"
                        >
                          <MinusIcon className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="text-neutral-600 hover:text-black"
                        >
                          <PlusIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border border-neutral-200 rounded-3xl p-6 bg-white space-y-6 sticky top-24">
            <h2 className="text-xl font-bold text-neutral-900">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-bold text-neutral-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>

              {promoApplied && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Promo Discount (10%)</span>
                  <span>-₹{promoDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600">
                <span>Delivery Fee</span>
                <span className="font-bold text-neutral-900">
                  {shippingFee === 0 ? <span className="text-emerald-600">FREE</span> : `₹${shippingFee}`}
                </span>
              </div>

              <div className="flex justify-between text-neutral-600">
                <span>GST (5%)</span>
                <span className="font-bold text-neutral-900">₹{tax.toLocaleString('en-IN')}</span>
              </div>

              <div className="border-t border-neutral-200 pt-3 flex justify-between text-base font-black text-neutral-900">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-neutral-100 text-xs font-semibold px-4 py-2.5 rounded-full outline-none uppercase focus:ring-1 focus:ring-black"
                />
                <button
                  type="submit"
                  className="bg-black text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-neutral-800"
                >
                  Apply
                </button>
              </div>
              {promoError && <p className="text-xs text-red-500">{promoError}</p>}
              {promoApplied && <p className="text-xs text-emerald-600">Promo "SHOP10" applied successfully!</p>}
            </form>

            {/* Checkout Button */}
            <button
              onClick={handleCheckoutClick}
              className="w-full bg-black text-white py-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 hover:bg-neutral-800 transition active:scale-95 shadow-lg"
            >
              <span>Go to Checkout</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CartPage;
