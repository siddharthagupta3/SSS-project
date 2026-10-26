import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/products/ProductCard';
import { ArrowRightIcon, StarIcon, CheckIcon } from '../components/common/Icons';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.get('/api/products/featured');
        if (res.data.success) {
          setFeaturedProducts(res.data.data.featured || []);
          setNewArrivals(res.data.data.newArrivals || []);
        }
      } catch (err) {
        console.warn('Could not load featured products:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="bg-neutral-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pt-16 md:pb-24 grid md:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-neutral-900 leading-none">
              FIND CLOTHES THAT MATCHES YOUR STYLE
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 max-w-lg leading-relaxed">
              Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.
            </p>
            <div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-neutral-800 transition active:scale-95 shadow-md"
              >
                <span>Shop Now</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-neutral-200">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">200+</h3>
                <p className="text-xs text-neutral-500">International Brands</p>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">2,000+</h3>
                <p className="text-xs text-neutral-500">High-Quality Products</p>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">30,000+</h3>
                <p className="text-xs text-neutral-500">Happy Customers</p>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative flex justify-center">
            <div className="w-full max-w-md aspect-4/5 rounded-3xl overflow-hidden shadow-2xl relative">
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80"
                alt="Fashion models"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white bg-black/60 backdrop-blur-md p-4 rounded-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Exclusive Drop</span>
                <p className="text-sm font-semibold">Streetwear & Minimalist Essentials 2026 Collection</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Brand Strip */}
      <section className="bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-around items-center gap-8 text-white font-black text-xl sm:text-2xl tracking-widest uppercase opacity-80">
          <span>VERSACE</span>
          <span>ZARA</span>
          <span>GUCCI</span>
          <span>PRADA</span>
          <span>Calvin Klein</span>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900">
            NEW ARRIVALS
          </h2>
          <p className="text-sm text-neutral-500">The freshest styles added to our store this week</p>
        </div>

        {loading ? (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-neutral-200 aspect-square rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/shop"
            className="inline-block border border-neutral-300 text-neutral-800 px-8 py-3 rounded-full text-sm font-semibold hover:bg-neutral-100 transition"
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* Top Selling / Featured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-neutral-200 pt-16">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900">
            TOP SELLING
          </h2>
          <p className="text-sm text-neutral-500">Our customer favorites loved across the country</p>
        </div>

        {loading ? (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-neutral-200 aspect-square rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/shop"
            className="inline-block border border-neutral-300 text-neutral-800 px-8 py-3 rounded-full text-sm font-semibold hover:bg-neutral-100 transition"
          >
            Explore Catalog
          </Link>
        </div>
      </section>

      {/* Browse by Dress Style */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-100 rounded-3xl p-8 sm:p-12">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-center text-neutral-900 mb-8">
            BROWSE BY DRESS STYLE
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Link
              to="/shop?category=T-Shirts"
              className="group relative h-64 rounded-2xl overflow-hidden bg-white shadow-xs hover:shadow-md transition"
            >
              <img
                src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"
                alt="Casual"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <span className="absolute top-6 left-6 text-2xl font-black text-neutral-900 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-lg">
                Casual
              </span>
            </Link>

            <Link
              to="/shop?category=Shirts"
              className="group relative h-64 rounded-2xl overflow-hidden bg-white shadow-xs hover:shadow-md transition"
            >
              <img
                src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800"
                alt="Formal"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <span className="absolute top-6 left-6 text-2xl font-black text-neutral-900 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-lg">
                Formal
              </span>
            </Link>

            <Link
              to="/shop?category=Jackets"
              className="group relative h-64 rounded-2xl overflow-hidden bg-white shadow-xs hover:shadow-md transition"
            >
              <img
                src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800"
                alt="Party"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <span className="absolute top-6 left-6 text-2xl font-black text-neutral-900 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-lg">
                Party & Outerwear
              </span>
            </Link>

          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 mb-8">
          OUR HAPPY CUSTOMERS
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
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
            <div key={idx} className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-xs space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4" filled={true} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900">{item.name}</span>
                <span className="bg-emerald-100 text-emerald-800 p-0.5 rounded-full">
                  <CheckIcon className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">{item.review}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
