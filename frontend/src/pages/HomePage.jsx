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
    <div>

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION — Dark Purple Gradient (Reference Image Style)
      ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden min-h-[100svh] flex flex-col justify-between"
        style={{
          background: 'radial-gradient(ellipse at 60% 0%, #2d1057 0%, #1a0b2e 40%, #0f172a 100%)',
        }}
      >
        {/* Grid overlay texture */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(110,231,183,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(110,231,183,0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Glow blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />
        <div className="absolute bottom-20 left-0 w-72 h-72 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6EE7B7, transparent 70%)' }} />

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full px-6 pt-16 pb-10 text-center sm:text-left">

          {/* Badge */}
          <span className="inline-block self-center sm:self-start mb-6 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full border"
            style={{ borderColor: 'rgba(110,231,183,0.4)', color: '#6EE7B7', background: 'rgba(110,231,183,0.08)' }}>
            ✦ Summer 2026 Collection — Live Now
          </span>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight mb-6">
            Shop premium products that{' '}
            <span className="font-serif italic" style={{ color: '#6EE7B7' }}>elevate</span>{' '}
            your style.
          </h1>

          {/* Subtext */}
          <p className="text-sm sm:text-base leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Discover meticulously crafted garments designed to bring out your individuality.
            Fast delivery · Secure Razorpay checkout · Gmail-verified accounts.
          </p>

          {/* Tags row */}
          <p className="text-xs font-semibold mb-8 tracking-wide" style={{ color: '#6EE7B7' }}>
            Streetwear · Luxury · Minimalist · Cargo · Accessories
          </p>

          {/* CTAs — stacked like reference image */}
          <div className="flex flex-col items-center sm:items-start gap-4 w-full max-w-xs mx-auto sm:mx-0">
            <Link
              to="/shop"
              className="w-full text-center font-black text-sm uppercase tracking-widest px-8 py-4 rounded-xl shadow-xl transition active:scale-95 hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #F5B041, #FFC107)', color: '#000' }}
            >
              Shop Now →
            </Link>
            <Link
              to="/new-arrivals"
              className="w-full text-center font-bold text-sm text-white px-8 py-4 rounded-xl transition hover:bg-white/10 active:scale-95"
              style={{ border: '1.5px solid rgba(255,255,255,0.25)' }}
            >
              View New Arrivals →
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12 pt-8"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {[
              { num: '200+', label: 'Brands' },
              { num: '2,000+', label: 'Products' },
              { num: '30K+', label: 'Happy Customers' },
            ].map((s) => (
              <div key={s.label} className="text-center sm:text-left">
                <p className="text-xl sm:text-3xl font-black text-white">{s.num}</p>
                <p className="text-[10px] sm:text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Social Icons — bottom row like reference */}
        <div className="relative z-10 flex justify-center gap-4 pb-8 pt-4">
          {[
            { icon: '📸', label: 'Instagram', href: '#' },
            { icon: '▶️', label: 'YouTube', href: '#' },
            { icon: 'in', label: 'LinkedIn', href: '#', text: true },
            { icon: '✕', label: 'X (Twitter)', href: '#' },
            { icon: '☰', label: 'More', href: '#' },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm transition hover:scale-110 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              {s.text ? <span className="text-xs font-black">{s.icon}</span> : s.icon}
            </a>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          BRAND TICKER — Moving left-to-right
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-8 overflow-hidden select-none border-y"
        style={{ background: 'linear-gradient(90deg, #1a0b2e, #0f172a, #1a0b2e)', borderColor: 'rgba(110,231,183,0.15)' }}>
        <div className="animate-marquee-ltr flex items-center space-x-12 whitespace-nowrap">
          {['VERSACE', 'ZARA', 'GUCCI', 'PRADA', 'Calvin Klein', 'NIKE', "LEVI'S", 'ADIDAS', 'PUMA', 'BALENCIAGA', 'OFF-WHITE', 'Supreme', 'H&M',
            'VERSACE', 'ZARA', 'GUCCI', 'PRADA', 'Calvin Klein', 'NIKE', "LEVI'S", 'ADIDAS', 'PUMA', 'BALENCIAGA', 'OFF-WHITE', 'Supreme', 'H&M',
          ].map((brand, i) => (
            i % 2 === 0
              ? <span key={i} className="text-lg sm:text-2xl font-black tracking-widest uppercase text-white/80">{brand}</span>
              : <span key={i} className="text-sm" style={{ color: '#6EE7B7' }}>✦</span>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          NEW ARRIVALS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20" style={{ background: '#0f172a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <span className="inline-block text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider"
                style={{ background: 'rgba(110,231,183,0.12)', color: '#6EE7B7', border: '1px solid rgba(110,231,183,0.3)' }}>
                ✨ Just Dropped
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">NEW ARRIVALS</h2>
              <p className="text-xs sm:text-sm mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>The freshest styles added this week</p>
            </div>
            <Link to="/new-arrivals"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition hover:brightness-110"
              style={{ background: 'linear-gradient(135deg,#F5B041,#FFC107)', color: '#000' }}>
              View All <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl aspect-square" style={{ background: 'rgba(255,255,255,0.07)' }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {newArrivals.slice(0, 10).map((product) => (
                <ProductCard key={product._id} product={product} dark />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TOP SELLING
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, #1a0b2e 0%, #0f172a 70%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <span className="inline-block text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider"
                style={{ background: 'rgba(245,176,65,0.15)', color: '#FFC107', border: '1px solid rgba(245,176,65,0.3)' }}>
                🔥 Trending Now
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">TOP SELLING</h2>
              <p className="text-xs sm:text-sm mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Customer favorites loved across India</p>
            </div>
            <Link to="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white border transition hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.25)' }}>
              Explore All <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl aspect-square" style={{ background: 'rgba(255,255,255,0.07)' }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {featuredProducts.slice(0, 10).map((product) => (
                <ProductCard key={product._id} product={product} dark />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          BROWSE BY CATEGORY
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20" style={{ background: '#0f172a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-wider"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}>
              Categories
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">BROWSE BY STYLE</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { to: '/shop?category=T-Shirts', label: 'Casual', img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800' },
              { to: '/shop?category=Shirts', label: 'Formal', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800' },
              { to: '/shop?category=Jackets', label: 'Party & Outerwear', img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800' },
            ].map((cat) => (
              <Link key={cat.to} to={cat.to}
                className="group relative h-72 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                <img src={cat.img} alt={cat.label} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,11,46,0.9) 0%, transparent 60%)' }} />
                <span className="absolute bottom-6 left-6 text-xl font-black text-white px-4 py-2 rounded-xl backdrop-blur-md"
                  style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20"
        style={{ background: 'radial-gradient(ellipse at 70% 100%, #1a0b2e, #0f172a)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-wider"
              style={{ background: 'rgba(245,176,65,0.12)', color: '#FFC107', border: '1px solid rgba(245,176,65,0.25)' }}>
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">OUR HAPPY CUSTOMERS</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah M.', review: '"Blown away by the quality! The heavyweight tees feel ultra-luxury and the fit is impeccable."' },
              { name: 'Alex K.', review: '"SHOP.CO has completely elevated my streetwear wardrobe. The range is unmatched across India."' },
              { name: 'James L.', review: '"Razorpay checkout was seamless and my order arrived in 48 hours. Five stars all the way!"' },
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl space-y-4 transition hover:scale-[1.01]"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex" style={{ color: '#FFC107' }}>
                  {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-4 h-4" filled />)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{item.name}</span>
                  <span className="p-0.5 rounded-full" style={{ background: 'rgba(110,231,183,0.2)' }}>
                    <CheckIcon className="w-3.5 h-3.5" style={{ color: '#6EE7B7' }} />
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{item.review}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          BOTTOM CTA BANNER
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 text-center px-4"
        style={{ background: 'linear-gradient(135deg, #1a0b2e 0%, #2d1057 50%, #0f172a 100%)' }}>
        <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 uppercase tracking-tight">
          Ready to <span className="font-serif italic" style={{ color: '#6EE7B7' }}>elevate</span> your wardrobe?
        </h2>
        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Join 30,000+ happy customers. Free delivery on orders above ₹999.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-sm mx-auto sm:max-w-none">
          <Link to="/shop"
            className="font-black text-sm uppercase tracking-widest px-10 py-4 rounded-xl shadow-xl transition hover:brightness-110 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#F5B041,#FFC107)', color: '#000' }}>
            Shop All Products →
          </Link>
          <Link to="/register"
            className="font-bold text-sm text-white px-10 py-4 rounded-xl transition hover:bg-white/10 active:scale-95"
            style={{ border: '1.5px solid rgba(255,255,255,0.3)' }}>
            Create Free Account
          </Link>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
