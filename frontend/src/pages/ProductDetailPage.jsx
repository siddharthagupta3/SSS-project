import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import {
  StarIcon,
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
  ShieldCheckIcon,
  TruckIcon,
  HeartIcon,
  TagIcon,
  CheckIcon,
} from '../components/common/Icons';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Flipkart PIN Code Delivery Checker State
  const [pincode, setPincode] = useState('560001');
  const [pincodeChecked, setPincodeChecked] = useState(true);
  const [deliveryDate, setDeliveryDate] = useState('');

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    // Calculate delivery date 3 days from now
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setDeliveryDate(d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }));
  }, []);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${id}`);
      if (res.data.success && res.data.data) {
        const item = res.data.data;
        setProduct(item);
        setSelectedImage(item.images?.[0] || '');
        setSelectedSize(item.sizes?.[0] || 'M');
        setSelectedColor(item.colors?.[0] || 'Black');
      }
    } catch (err) {
      console.error('Failed to load product details:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (/^[1-9][0-9]{5}$/.test(pincode)) {
      setPincodeChecked(true);
    } else {
      alert('Please enter a valid 6-digit Indian PIN Code.');
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stock === 0) return;
    setAdding(true);
    try {
      await addToCart(product, quantity, selectedSize, selectedColor);
      setToastMessage('Added to cart!');
      setTimeout(() => setToastMessage(''), 2500);
    } catch (err) {
      alert(err.message || 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Please write your review comment.');
      return;
    }
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const res = await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      if (res.data.success) {
        setReviewComment('');
        setToastMessage('Review submitted successfully!');
        fetchProduct();
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Could not submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <button
          onClick={() => navigate('/shop')}
          className="mt-4 bg-black text-white px-6 py-2 rounded-full text-sm font-semibold"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const isFav = isInWishlist(product._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-black text-white text-sm px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <ShoppingBagIcon className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Images Area */}
        <div className="flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[500px]">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-24 rounded-xl overflow-hidden border-2 shrink-0 ${
                    selectedImage === img ? 'border-black' : 'border-neutral-200'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Hero Image */}
          <div className="relative flex-1 aspect-4/5 rounded-3xl overflow-hidden bg-neutral-100 shadow-md">
            <img
              src={selectedImage || product.images?.[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />

            {/* Wishlist Button (Flipkart Style) */}
            <button
              onClick={() => toggleWishlist(product)}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs p-3 rounded-full shadow-md text-neutral-700 hover:text-red-500 hover:scale-110 active:scale-95 transition"
              title={isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <HeartIcon className={`w-5 h-5 ${isFav ? 'text-red-500 fill-current' : ''}`} filled={isFav} />
            </button>
          </div>
        </div>

        {/* Product Details Area */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                {product.brand} • {product.category}
              </span>
              {/* Flipkart Assured Style Badge */}
              <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded italic">
                <span>✦ SHOP.CO ASSURED</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="mt-2.5 flex items-center gap-2 text-sm text-neutral-600">
              <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                <span>{product.rating?.toFixed(1) || '4.5'}</span>
                <StarIcon className="w-3 h-3" filled={true} />
              </span>
              <span className="text-xs font-semibold text-neutral-500">
                {product.numReviews || 0} Ratings & Reviews
              </span>
            </div>
          </div>

          {/* Pricing (Flipkart Style) */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-neutral-900">
              ₹{effectivePrice.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <>
                <span className="text-base text-neutral-400 line-through">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-emerald-700 text-sm font-bold">
                  {discountPercent}% off
                </span>
              </>
            )}
          </div>

          {/* Flipkart Style Available Offers Accordion */}
          <div className="border border-neutral-200 rounded-2xl p-4 bg-neutral-50/60 space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
              <TagIcon className="w-4 h-4 text-emerald-600" />
              <span>Available Offers & Discounts</span>
            </h3>
            <ul className="space-y-2 text-xs text-neutral-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">🏷️ Bank Offer:</span>
                <span>10% Instant Discount on HDFC & ICICI Bank Credit Cards on min spend of ₹1,499.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">🏷️ Promo Code:</span>
                <span>Apply coupon <strong className="underline text-black">SHOP10</strong> at checkout for flat 10% discount.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">🏷️ Partner Offer:</span>
                <span>Sign up with Google and get free express shipping on all orders.</span>
              </li>
            </ul>
          </div>

          {/* Flipkart Style Delivery PIN Code Checker */}
          <div className="border-t border-b border-neutral-200 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                <TruckIcon className="w-4 h-4 text-neutral-900" />
                <span>Delivery & Services</span>
              </span>
            </div>

            <form onSubmit={handleCheckPincode} className="flex gap-2 max-w-sm">
              <input
                type="text"
                maxLength="6"
                placeholder="Enter Delivery PIN Code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="flex-1 bg-neutral-100 text-xs font-mono font-semibold px-4 py-2 rounded-xl outline-none focus:ring-1 focus:ring-black"
              />
              <button
                type="submit"
                className="bg-black text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-neutral-800"
              >
                Check
              </button>
            </form>

            {pincodeChecked && (
              <div className="space-y-1.5 text-xs text-neutral-700">
                <p className="font-semibold text-neutral-900">
                  Delivery by <strong className="text-emerald-700">{deliveryDate}</strong> |{' '}
                  <span className="text-emerald-700">FREE</span> <span className="line-through text-neutral-400">₹40</span>
                </p>
                <div className="flex flex-wrap gap-4 text-neutral-500 pt-1">
                  <span>💵 Cash on Delivery / UPI</span>
                  <span>🔄 7 Days Replacement Policy</span>
                  <span>🛡️ 100% Original Guarantee</span>
                </div>
              </div>
            )}
          </div>

          {/* Color & Size Selectors */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Color</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${
                      selectedColor === c
                        ? 'bg-black text-white border-black'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Size</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-12 h-10 rounded-xl text-xs font-bold border flex items-center justify-center ${
                      selectedSize === s
                        ? 'bg-black text-white border-black'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA */}
          <div className="pt-2 flex flex-col sm:flex-row gap-4">
            <div className="flex items-center justify-between border border-neutral-300 rounded-full px-4 py-2 w-32 shrink-0">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="text-neutral-500 hover:text-black"
                disabled={quantity <= 1}
              >
                <MinusIcon className="w-4 h-4" />
              </button>
              <span className="font-bold text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="text-neutral-500 hover:text-black"
                disabled={quantity >= product.stock}
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="flex-1 bg-black text-white py-3.5 px-6 rounded-full font-semibold text-sm hover:bg-neutral-800 transition active:scale-95 disabled:opacity-50"
            >
              {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {product.stock > 0 && (
              <button
                onClick={handleBuyNow}
                className="bg-emerald-600 text-white py-3.5 px-6 rounded-full font-semibold text-sm hover:bg-emerald-700 transition active:scale-95"
              >
                Buy Now
              </button>
            )}
          </div>

          <p className="text-sm text-neutral-600 leading-relaxed pt-2">
            {product.description}
          </p>

        </div>

      </div>

      {/* Customer Ratings & Reviews (Flipkart Style Section) */}
      <section className="mt-16 border-t border-neutral-200 pt-10">
        <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900 mb-6">
          Ratings & Customer Reviews
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Left: Overall rating summary & progress bars */}
          <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-200 h-fit space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-neutral-900">{product.rating?.toFixed(1) || '4.8'}</span>
              <span className="text-neutral-400 text-sm">/ 5</span>
              <div className="flex text-amber-400 ml-2">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4" filled={i < Math.round(product.rating || 5)} />
                ))}
              </div>
            </div>
            <p className="text-xs text-neutral-500">{product.numReviews || 0} verified customers</p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 font-bold">5★</span>
                <div className="flex-1 bg-neutral-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[78%]" />
                </div>
                <span className="w-8 text-neutral-500 text-right">78%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 font-bold">4★</span>
                <div className="flex-1 bg-neutral-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[16%]" />
                </div>
                <span className="w-8 text-neutral-500 text-right">16%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 font-bold">3★</span>
                <div className="flex-1 bg-neutral-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-[4%]" />
                </div>
                <span className="w-8 text-neutral-500 text-right">4%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 font-bold">2★</span>
                <div className="flex-1 bg-neutral-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-400 h-full w-[1%]" />
                </div>
                <span className="w-8 text-neutral-500 text-right">1%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 font-bold">1★</span>
                <div className="flex-1 bg-neutral-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full w-[1%]" />
                </div>
                <span className="w-8 text-neutral-500 text-right">1%</span>
              </div>
            </div>

            {/* Write a review form toggle */}
            <form onSubmit={handleReviewSubmit} className="pt-4 border-t border-neutral-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">Review This Product</h4>
              
              {reviewError && <p className="text-xs text-red-600">{reviewError}</p>}

              <div className="flex gap-1 text-neutral-300">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none"
                  >
                    <StarIcon
                      className={`w-5 h-5 ${star <= reviewRating ? 'text-amber-400' : 'text-neutral-300'}`}
                      filled={star <= reviewRating}
                    />
                  </button>
                ))}
              </div>

              <textarea
                rows="2"
                required
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience (fabric, fit, comfort)..."
                className="w-full text-xs bg-white border border-neutral-300 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-black"
              />

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="w-full bg-black text-white py-2 rounded-full text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50"
              >
                {reviewSubmitting ? 'Posting...' : 'Submit Review'}
              </button>
            </form>
          </div>

          {/* Right: Reviews List */}
          <div className="md:col-span-2 space-y-4">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev, idx) => (
                <div key={idx} className="border border-neutral-200 rounded-2xl p-5 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                        <span>{rev.rating}</span>
                        <StarIcon className="w-3 h-3" filled={true} />
                      </span>
                      <span className="font-bold text-sm text-neutral-900">{rev.name}</span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                        <CheckIcon className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Verified Buyer</span>
                      </span>
                    </div>
                    <span className="text-xs text-neutral-400">
                      {new Date(rev.createdAt || Date.now()).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            ) : (
              <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center text-xs text-neutral-500">
                <p className="font-bold text-sm text-neutral-800">No reviews yet for this product</p>
                <p className="mt-1">Be the first to review this product and help other shoppers!</p>
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;
