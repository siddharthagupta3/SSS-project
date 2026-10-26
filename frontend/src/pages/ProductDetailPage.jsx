import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import {
  StarIcon,
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
  ShieldCheckIcon,
  TruckIcon,
} from '../components/common/Icons';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/products/${id}`);
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

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || product.stock === 0) return;
    setAdding(true);
    try {
      await addToCart(product, quantity, selectedSize, selectedColor);
      setToastMessage('Item successfully added to cart!');
      setTimeout(() => setToastMessage(''), 3000);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-black text-white text-sm px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <ShoppingBagIcon className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
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
          <div className="flex-1 aspect-4/5 rounded-3xl overflow-hidden bg-neutral-100 shadow-md">
            <img
              src={selectedImage || product.images?.[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Details Area */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              {product.brand} • {product.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 mt-1">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4" filled={i < Math.floor(product.rating || 4.5)} />
                ))}
              </div>
              <span className="font-bold text-neutral-800">{product.rating?.toFixed(1) || '4.5'}</span>
              <span className="text-neutral-400">({product.numReviews || 0} reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-black text-neutral-900">
              ₹{effectivePrice.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xl text-neutral-400 line-through">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
                  -{discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-neutral-600 leading-relaxed border-t border-b border-neutral-200 py-4">
            {product.description}
          </p>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Select Color</span>
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

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Choose Size</span>
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
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
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

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-neutral-200 text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <TruckIcon className="w-5 h-5 text-neutral-800" />
              <span>Free Delivery on orders above ₹999</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-neutral-800" />
              <span>100% Original & Razorpay Verified</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProductDetailPage;
