import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/products/ProductCard';
import { ArrowRightIcon, StarIcon, CheckIcon } from '../components/common/Icons';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState(() => {
    try {
      const cached = JSON.parse(sessionStorage.getItem('new_arrivals_cache') || 'null');
      return cached?.expiresAt > Date.now() ? cached.products : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => newArrivals.length === 0);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [newArrivalsRes, topSellingRes] = await Promise.all([
          api.get('/products/new-arrivals', { params: { limit: 12 } }),
          api.get('/products/top-selling?limit=10'),
        ]);

        if (newArrivalsRes.data.success) {
          const nextProducts = newArrivalsRes.data.data || [];
          nextProducts.forEach((product) => {
            if (Array.isArray(product.images)) {
              product.images = product.images
                .filter((image) => typeof image === 'string' && image.trim())
                .map((image) => image.trim().replace(/^http:\/\//i, 'https://'));
            }
          });
          setNewArrivals(nextProducts);
          sessionStorage.setItem('new_arrivals_cache', JSON.stringify({
            products: nextProducts,
            expiresAt: Date.now() + 10 * 1000,
          }));
        }
        if (topSellingRes.data.success) {
          setFeaturedProducts(topSellingRes.data.data || []);
        }
      } catch (err) {
        console.warn('Could not load home products:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-neutral-50 via-white to-neutral-100 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-32 grid md:grid-cols-2 gap-12 items-center">

          <div className="space-y-8">
            <div>
              <span className="inline-block bg-black text-white text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-wider">
                Summer 2026 Collection
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-neutral-900 leading-tight">
                FIND CLOTHES THAT MATCHES YOUR STYLE
              </h1>
            </div>
            <p className="text-sm sm:text-base text-neutral-600 max-w-lg leading-relaxed">
              Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/new-arrivals"
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-neutral-800 transition active:scale-95 shadow-xl"
              >
                <span>Shop Now</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link
                to="/shop?category=New"
                className="inline-flex items-center gap-2 bg-white text-black border-2 border-black px-8 py-4 rounded-full font-semibold text-sm hover:bg-neutral-100 transition active:scale-95"
              >
                <span>New Arrivals</span>
              </Link>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-8 pt-8 border-t border-neutral-200">
              <div>
                <h3 className="text-xl sm:text-4xl font-extrabold text-neutral-900 leading-tight whitespace-nowrap">200+</h3>
                <p className="text-[10px] sm:text-xs text-neutral-500 mt-1 leading-tight">International Brands</p>
              </div>
              <div>
                <h3 className="text-xl sm:text-4xl font-extrabold text-neutral-900 leading-tight whitespace-nowrap">2,000+</h3>
                <p className="text-[10px] sm:text-xs text-neutral-500 mt-1 leading-tight">High-Quality Products</p>
              </div>
              <div>
                <h3 className="text-xl sm:text-4xl font-extrabold text-neutral-900 leading-tight whitespace-nowrap">30,000+</h3>
                <p className="text-[10px] sm:text-xs text-neutral-500 mt-1 leading-tight">Happy Customers</p>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative flex justify-center">
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-200 to-amber-400 rounded-3xl blur-2xl opacity-30" />
              <div className="relative w-full max-w-md aspect-4/5 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80"
                  alt="Fashion models"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white bg-black/70 backdrop-blur-md p-5 rounded-2xl border border-white/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Exclusive Drop</span>
                  <p className="text-sm font-semibold mt-1">Streetwear & Minimalist Essentials 2026 Collection</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Brand Strip - Left to Right Moving Animated Ticker */}
      <section className="bg-gradient-to-r from-black via-neutral-900 to-black py-8 overflow-hidden select-none border-y border-neutral-800 shadow-xl">
        <div className="animate-marquee-ltr flex items-center space-x-12 sm:space-x-16 text-white font-black text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-widest uppercase opacity-90 whitespace-nowrap">
          <span>VERSACE</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>ZARA</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>GUCCI</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>PRADA</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>Calvin Klein</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>NIKE</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>LEVI'S</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>ADIDAS</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>PUMA</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>BALENCIAGA</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>OFF-WHITE</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>Supreme</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>H&M</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>

          {/* Duplicate for seamless infinite loop */}
          <span>VERSACE</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>ZARA</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>GUCCI</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>PRADA</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>Calvin Klein</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>NIKE</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>LEVI'S</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>ADIDAS</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>PUMA</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>BALENCIAGA</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>OFF-WHITE</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>Supreme</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
          <span>H&M</span>
          <span className="text-amber-400 text-sm sm:text-base">✦</span>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="bg-gradient-to-br from-neutral-50 via-white to-neutral-100 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <span className="inline-block bg-amber-100 text-amber-800 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full mb-2 sm:mb-3 uppercase tracking-wider">
                ✨ Just Dropped
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-neutral-900">
                NEW ARRIVALS
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 sm:mt-2">The freshest styles added to our store this week</p>
            </div>
            <Link
              to="/new-arrivals"
              className="inline-flex items-center gap-2 bg-black text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition shadow-lg"
            >
              <span>View All</span>
              <ArrowRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse bg-neutral-200 aspect-square rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {newArrivals.slice(0, 10).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Selling / Featured */}
      <section className="bg-gradient-to-br from-black via-neutral-900 to-black py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <span className="inline-block bg-amber-500 text-black text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full mb-2 sm:mb-3 uppercase tracking-wider">
                🔥 Trending Now
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white">
                TOP SELLING
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 sm:mt-2">Our customer favorites loved across the country</p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-white text-black px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold hover:bg-neutral-200 transition shadow-lg"
            >
              <span>Explore Catalog</span>
              <ArrowRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse bg-neutral-800 aspect-square rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {featuredProducts.slice(0, 10).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Browse by Dress Style */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-neutral-50 to-white rounded-3xl p-8 sm:p-12 shadow-xl border border-neutral-200">
          <div className="text-center mb-10">
            <span className="inline-block bg-neutral-900 text-white text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-wider">
              Categories
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900">
              BROWSE BY DRESS STYLE
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            <Link
              to="/shop?category=T-Shirts"
              className="group relative h-72 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <img
                src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"
                alt="Casual"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <span className="absolute bottom-6 left-6 text-2xl font-black text-white bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                Casual
              </span>
            </Link>

            <Link
              to="/shop?category=Shirts"
              className="group relative h-72 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <img
                src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800"
                alt="Formal"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <span className="absolute bottom-6 left-6 text-2xl font-black text-white bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                Formal
              </span>
            </Link>

            <Link
              to="/shop?category=Jackets"
              className="group relative h-72 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <img
                src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800"
                alt="Party"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <span className="absolute bottom-6 left-6 text-2xl font-black text-white bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                Party & Outerwear
              </span>
            </Link>

          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="bg-gradient-to-br from-neutral-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-wider">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900">
              OUR HAPPY CUSTOMERS
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah M.',
                review:
                  '"I\'m blown away by the quality and craftsmanship of the heavyweight tees. The fit is impeccable and the fabric feels ultra luxury!"',
              },
              {
                name: 'Alex K.',
                review:
                  '"Finding clothes that fit my streetwear aesthetic used to be a hassle. SHOP.CO has completely elevated my wardrobe in one click."',
              },
              {
                name: 'James L.',
                review:
                  '"The checkout with Razorpay was seamless and my order arrived within 48 hours. Five stars across the board for customer service."',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-neutral-200 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 space-y-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5" filled={true} />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-neutral-900 text-lg">{item.name}</span>
                  <span className="bg-emerald-100 text-emerald-800 p-1 rounded-full">
                    <CheckIcon className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed">{item.review}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
