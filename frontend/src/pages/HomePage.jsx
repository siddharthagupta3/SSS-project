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
    } catch { return []; }
  });
  const [loading, setLoading] = useState(() => newArrivals.length === 0);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [newRes, topRes] = await Promise.all([
          api.get('/products/new-arrivals', { params: { limit: 12 } }),
          api.get('/products/top-selling?limit=10'),
        ]);
        if (newRes.data.success) {
          const products = (newRes.data.data || []).map(p => ({
            ...p,
            images: (p.images || []).filter(Boolean).map(i => i.replace(/^http:\/\//i, 'https://')),
          }));
          setNewArrivals(products);
          sessionStorage.setItem('new_arrivals_cache', JSON.stringify({ products, expiresAt: Date.now() + 10000 }));
        }
        if (topRes.data.success) setFeaturedProducts(topRes.data.data || []);
      } catch (err) { console.warn('Home fetch error:', err.message); }
      finally { setLoading(false); }
    };
    fetchHomeData();
  }, []);

  return (
    <div>

      {/* ══════════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: '100svh', background: 'radial-gradient(ellipse at 20% 0%, #1a0b2e 0%, #0d1f1a 55%, #0f2e2a 100%)' }}
      >
        {/* ── Grid overlay ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(110,231,183,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(110,231,183,0.07) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        {/* ── Glow blobs ── */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(110,231,183,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 left-0 w-72 h-72 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(110,231,183,0.08) 0%, transparent 70%)' }} />

        {/* ── HERO LAYOUT: Text left | Image right ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 grid md:grid-cols-2 gap-8 items-center min-h-screen py-20">

          {/* LEFT — Text content */}
          <div className="flex flex-col items-start space-y-7">

            {/* Badge pill */}
            <span
              className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full"
              style={{
                color: '#6EE7B7',
                border: '1.5px solid rgba(110,231,183,0.45)',
                background: 'rgba(110,231,183,0.07)',
              }}
            >
              ✦ SUMMER 2026 COLLECTION — LIVE NOW
            </span>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
              Shop premium products that{' '}
              <em
                className="not-italic"
                style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontStyle: 'italic',
                  color: '#6EE7B7',
                  fontWeight: 700,
                }}
              >
                elevate
              </em>{' '}
              your style.
            </h1>

            {/* Sub text */}
            <p className="text-sm sm:text-base leading-relaxed max-w-md" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Discover meticulously crafted garments designed to bring out your individuality.
              Fast delivery · Secure Razorpay checkout · Gmail-verified accounts.
            </p>

            {/* Category tags */}
            <p className="text-xs font-semibold tracking-wide" style={{ color: '#6EE7B7' }}>
              Streetwear · Luxury · Minimalist · Cargo · Accessories
            </p>

            {/* CTA Buttons — stacked */}
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <Link
                to="/shop"
                className="w-full text-center font-black text-sm uppercase tracking-widest py-4 px-8 rounded-xl shadow-2xl transition hover:brightness-110 active:scale-95"
                style={{ background: 'linear-gradient(135deg,#F5B041,#FFC107)', color: '#000' }}
              >
                Shop Now →
              </Link>
              <Link
                to="/new-arrivals"
                className="w-full text-center font-semibold text-sm text-white py-4 px-8 rounded-xl transition hover:bg-white/10 active:scale-95"
                style={{ border: '1.5px solid rgba(255,255,255,0.28)' }}
              >
                View New Arrivals →
              </Link>
            </div>

            {/* Stats row */}
            <div
              className="grid grid-cols-3 gap-6 pt-8 w-full"
              style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
            >
              {[
                { num: '200+', label: 'Brands' },
                { num: '2,000+', label: 'Products' },
                { num: '30K+', label: 'Happy Customers' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl sm:text-3xl font-black text-white">{s.num}</p>
                  <p className="text-[10px] sm:text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Hero fashion image */}
          <div className="hidden md:flex justify-center items-center relative">
            {/* Glow behind image */}
            <div className="absolute inset-0 rounded-3xl blur-3xl"
              style={{ background: 'radial-gradient(ellipse, rgba(110,231,183,0.18) 0%, transparent 70%)' }} />
            <div className="relative w-full max-w-sm lg:max-w-md">
              {/* Decorative ring */}
              <div className="absolute -inset-3 rounded-3xl"
                style={{ border: '1px solid rgba(110,231,183,0.2)', borderRadius: '1.75rem' }} />
              <img
                src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&auto=format&fit=crop&q=85"
                alt="Premium fashion model"
                className="relative w-full rounded-3xl object-cover shadow-2xl"
                style={{ aspectRatio: '3/4', objectPosition: 'center top' }}
              />
              {/* Overlay badge on image */}
              <div
                className="absolute bottom-6 left-6 right-6 backdrop-blur-md p-4 rounded-2xl"
                style={{ background: 'rgba(10,10,20,0.75)', border: '1px solid rgba(110,231,183,0.2)' }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#6EE7B7' }}>
                  🔥 Exclusive Drop
                </span>
                <p className="text-sm font-semibold text-white mt-1">
                  Streetwear &amp; Minimalist Essentials — 2026
                </p>
              </div>
            </div>
          </div>

          {/* Mobile image — below text */}
          <div className="md:hidden relative">
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=700&auto=format&fit=crop&q=80"
              alt="Premium fashion model"
              className="w-full rounded-2xl object-cover shadow-xl"
              style={{ maxHeight: 320, objectPosition: 'center top' }}
            />
            <div className="absolute inset-0 rounded-2xl"
              style={{ background: 'linear-gradient(to top, rgba(10,5,20,0.6), transparent 50%)' }} />
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          BRAND TICKER
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="py-7 overflow-hidden select-none border-y"
        style={{ background: 'linear-gradient(90deg,#0d1f1a,#1a0b2e,#0d1f1a)', borderColor: 'rgba(110,231,183,0.12)' }}
      >
        <div className="animate-marquee-ltr flex items-center space-x-10 whitespace-nowrap">
          {['VERSACE','ZARA','GUCCI','PRADA','Calvin Klein','NIKE',"LEVI'S",'ADIDAS','PUMA','BALENCIAGA','OFF-WHITE','Supreme','H&M',
            'VERSACE','ZARA','GUCCI','PRADA','Calvin Klein','NIKE',"LEVI'S",'ADIDAS','PUMA','BALENCIAGA','OFF-WHITE','Supreme','H&M',
          ].map((brand, i) =>
            i % 2 === 0
              ? <span key={i} className="text-base sm:text-xl font-black tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.75)' }}>{brand}</span>
              : <span key={i} className="text-xs" style={{ color: '#6EE7B7' }}>✦</span>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          NEW ARRIVALS
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20" style={{ background: '#0f172a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <span className="inline-block text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider"
                style={{ background: 'rgba(110,231,183,0.1)', color: '#6EE7B7', border: '1px solid rgba(110,231,183,0.3)' }}>
                ✨ Just Dropped
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">NEW ARRIVALS</h2>
              <p className="text-xs sm:text-sm mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>The freshest styles added this week</p>
            </div>
            <Link to="/new-arrivals"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition hover:brightness-110 active:scale-95 shrink-0"
              style={{ background: 'linear-gradient(135deg,#F5B041,#FFC107)', color: '#000' }}>
              View All <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl aspect-square" style={{ background: 'rgba(255,255,255,0.06)' }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {newArrivals.slice(0, 10).map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TOP SELLING
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, #1a0b2e 0%, #0d1f1a 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <span className="inline-block text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider"
                style={{ background: 'rgba(245,176,65,0.12)', color: '#FFC107', border: '1px solid rgba(245,176,65,0.3)' }}>
                🔥 Trending Now
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">TOP SELLING</h2>
              <p className="text-xs sm:text-sm mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>Customer favorites loved across India</p>
            </div>
            <Link to="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white border transition hover:bg-white/10 active:scale-95 shrink-0"
              style={{ borderColor: 'rgba(255,255,255,0.25)' }}>
              Explore All <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl aspect-square" style={{ background: 'rgba(255,255,255,0.06)' }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {featuredProducts.slice(0, 10).map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          BROWSE BY STYLE
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20" style={{ background: '#0f172a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-wider"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.15)' }}>
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
                className="group relative h-64 sm:h-72 rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                <img src={cat.img} alt={cat.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,5,25,0.85) 0%, transparent 55%)' }} />
                <span className="absolute bottom-5 left-5 text-xl font-black text-white px-4 py-2 rounded-xl backdrop-blur-sm"
                  style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20"
        style={{ background: 'radial-gradient(ellipse at 70% 100%, #1a0b2e, #0d1f1a)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-wider"
              style={{ background: 'rgba(245,176,65,0.1)', color: '#FFC107', border: '1px solid rgba(245,176,65,0.25)' }}>
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">OUR HAPPY CUSTOMERS</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah M.', review: '"Blown away by the quality! The heavyweight tees feel ultra-luxury and the fit is impeccable."' },
              { name: 'Alex K.', review: '"SHOP.CO completely elevated my streetwear wardrobe. The range is unmatched across India."' },
              { name: 'James L.', review: '"Razorpay checkout was seamless and my order arrived in 48 hours. Five stars all the way!"' },
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl space-y-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
                <div className="flex" style={{ color: '#FFC107' }}>
                  {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-4 h-4" filled />)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{item.name}</span>
                  <span className="p-0.5 rounded-full" style={{ background: 'rgba(110,231,183,0.18)' }}>
                    <CheckIcon className="w-3.5 h-3.5" style={{ color: '#6EE7B7' }} />
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.review}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          BOTTOM CTA BANNER
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="py-20 text-center px-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#1a0b2e 0%,#0f2e2a 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(110,231,183,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(110,231,183,0.05) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 uppercase tracking-tight leading-tight">
            Ready to{' '}
            <em style={{ fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', color: '#6EE7B7', fontWeight: 700 }}>
              elevate
            </em>{' '}
            your wardrobe?
          </h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
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
              style={{ border: '1.5px solid rgba(255,255,255,0.28)' }}>
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
