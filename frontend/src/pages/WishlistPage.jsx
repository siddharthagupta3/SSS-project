import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { HeartIcon, ShoppingBagIcon, TrashIcon, StarIcon } from '../components/common/Icons';

const WishlistPage = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product, 1, product.sizes?.[0] || 'M', product.colors?.[0] || 'Standard');
    toggleWishlist(product);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900">
            My Wishlist ({wishlist.length})
          </h1>
          <p className="text-xs text-neutral-500 mt-1">Products you have saved for later</p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-3xl p-16 text-center my-8">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <HeartIcon className="w-8 h-8" filled={false} />
          </div>
          <h2 className="text-xl font-bold text-neutral-800">Your wishlist is empty</h2>
          <p className="text-xs text-neutral-500 mt-1.5 max-w-sm mx-auto">
            Explore more and shortlist some items you love by tapping the heart icon on any product!
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-block bg-black text-white px-8 py-3 rounded-full text-xs font-semibold hover:bg-neutral-800 transition"
          >
            Start Exploring
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => {
            const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
            const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

            return (
              <div
                key={product._id}
                className="group relative flex flex-col rounded-2xl bg-white border border-neutral-200 p-3 shadow-xs hover:shadow-md transition"
              >
                {/* Image */}
                <Link to={`/product/${product._id}`} className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
                  <img
                    src={product.images?.[0]}
                    alt={product.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist(product);
                    }}
                    className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-md text-red-500 hover:scale-110 active:scale-90 transition"
                    title="Remove from Wishlist"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </Link>

                <div className="mt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      {product.brand}
                    </span>
                    <Link to={`/product/${product._id}`} className="mt-0.5 block">
                      <h3 className="text-sm font-semibold text-neutral-900 line-clamp-1 group-hover:underline">
                        {product.title}
                      </h3>
                    </Link>

                    <div className="mt-1 flex items-center gap-1 text-xs">
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                        {product.rating?.toFixed(1) || '4.5'} ★
                      </span>
                    </div>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-base font-bold text-neutral-900">
                        ₹{effectivePrice?.toLocaleString('en-IN')}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-neutral-400 line-through">
                          ₹{product.price?.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleMoveToCart(product)}
                    className="mt-4 w-full bg-black text-white text-xs font-semibold py-2.5 rounded-full hover:bg-neutral-800 transition flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBagIcon className="w-3.5 h-3.5" />
                    <span>Move to Cart</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
