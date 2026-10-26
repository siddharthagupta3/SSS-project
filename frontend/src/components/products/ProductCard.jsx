import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, ShoppingBagIcon } from '../common/Icons';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.sizes?.[0] || 'M', product.colors?.[0] || 'Standard');
  };

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white border border-neutral-100 p-3 shadow-xs hover:shadow-lg transition-all duration-300">
      {/* Image container */}
      <Link to={`/product/${product._id}`} className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'}
          alt={product.title}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
            -{discountPercent}%
          </span>
        )}

        {/* Stock Warning */}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute bottom-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Only {product.stock} left
          </span>
        )}

        {/* Out of Stock */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center font-bold text-xs uppercase tracking-wider text-red-600">
            Out of Stock
          </div>
        )}

        {/* Quick Add Button */}
        {product.stock > 0 && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-2 right-2 bg-black text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110 active:scale-95"
            title="Quick Add to Cart"
          >
            <ShoppingBagIcon className="w-4 h-4" />
          </button>
        )}
      </Link>

      {/* Product Details */}
      <div className="mt-3 flex flex-1 flex-col">
        <span className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
          {product.category} • {product.brand}
        </span>

        <Link to={`/product/${product._id}`} className="mt-1">
          <h3 className="text-sm font-semibold text-neutral-900 line-clamp-1 group-hover:text-neutral-600 transition">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-1.5 flex items-center gap-1 text-xs text-neutral-500">
          <div className="flex text-amber-400">
            <StarIcon className="w-3.5 h-3.5" filled={true} />
          </div>
          <span className="font-semibold text-neutral-800">{product.rating?.toFixed(1) || '4.5'}</span>
          <span className="text-neutral-400">({product.numReviews || 0})</span>
        </div>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-neutral-900">
            ₹{effectivePrice.toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <span className="text-xs text-neutral-400 line-through">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
