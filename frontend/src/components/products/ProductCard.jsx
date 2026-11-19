import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, ShoppingBagIcon, HeartIcon } from '../common/Icons';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const isFav = isInWishlist(product._id);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/product/${product._id}` } } });
      return;
    }
    addToCart(product, 1, product.sizes?.[0] || 'M', product.colors?.[0] || 'Standard');
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      localStorage.setItem('sss_pending_buy', JSON.stringify({
        productId: product._id,
        quantity: 1,
        size: product.sizes?.[0] || 'M',
        color: product.colors?.[0] || 'Standard',
      }));
      navigate('/login', { state: { from: { pathname: `/product/${product._id}` } } });
      return;
    }
    addToCart(product, 1, product.sizes?.[0] || 'M', product.colors?.[0] || 'Standard')
      .then(() => navigate('/cart'))
      .catch((err) => window.alert(err.message || 'Could not start checkout'));
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/product/${product._id}` } } });
      return;
    }
    toggleWishlist(product);
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/favicon.svg';
  };
  const rawImages = [
    ...(Array.isArray(product.images) ? product.images : []),
    product.image,
  ].filter((image) => typeof image === 'string' && image.trim());
  const rawImage = rawImages[0] || '';
  const imageUrl = rawImage
    ? rawImage.trim().replace(/^http:\/\//i, 'https://')
    : '/favicon.svg';

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white border border-neutral-200 p-3 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Image container */}
      <Link to={`/product/${product._id}`} className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-neutral-100">
        <img
          src={imageUrl}
          alt={product.title}
          className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={handleImageError}
        />

        {/* New Arrival Badge */}
        {product.isNewArrival && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-amber-500 text-black text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider">
            New
          </span>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <span className={`absolute top-2 ${product.isNewArrival ? 'top-10' : 'left-2'} bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md`}>
            {discountPercent}% OFF
          </span>
        )}

        {/* Wishlist Button (Flipkart Style) */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-lg text-neutral-600 hover:text-red-500 hover:scale-110 active:scale-90 transition z-10 border border-neutral-100"
          title={isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <HeartIcon className={`w-4.5 h-4.5 ${isFav ? 'text-red-500 fill-current' : ''}`} filled={isFav} />
        </button>

        {/* Stock Warning */}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute bottom-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
            Only {product.stock} left
          </span>
        )}

        {/* Out of Stock */}
        {product.stock === 0 && (
          <span className="absolute bottom-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md uppercase tracking-wide">
            Out of Stock
          </span>
        )}

        {/* Quick Add Button */}
        {product.stock > 0 && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-2 right-2 bg-black text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110 active:scale-95 z-10"
            title="Quick Add to Cart"
          >
            <ShoppingBagIcon className="w-4.5 h-4.5" />
          </button>
        )}
      </Link>

      {/* Product Details */}
      <div className="mt-3 flex flex-1 flex-col">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            {product.brand}
          </span>
          <span className="text-[10px] font-black text-blue-600 italic">
            ✦ ASSURED
          </span>
        </div>

        <Link to={`/product/${product._id}`} className="mt-1">
          <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2 group-hover:text-neutral-600 transition">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-0.5 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded shadow-sm">
            <span>{product.rating?.toFixed(1) || '4.5'}</span>
            <StarIcon className="w-2.5 h-2.5" filled={true} />
          </span>
          <span className="text-neutral-400">({product.numReviews || 0})</span>
        </div>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-neutral-900">
            ₹{effectivePrice.toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <span className="text-xs text-neutral-400 line-through">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        {product.stock > 0 ? (
          <button
            type="button"
            onClick={handleBuyNow}
            className="mt-3 w-full rounded-full bg-emerald-600 py-2.5 text-xs font-black text-white hover:bg-emerald-700 active:scale-[0.98]"
          >
            Buy Now
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="mt-3 w-full rounded-full bg-neutral-200 py-2.5 text-xs font-black text-neutral-500"
          >
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
