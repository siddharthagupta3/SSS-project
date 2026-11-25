import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/products/ProductCard';
import { ArrowRightIcon, StarIcon, CheckIcon } from '../components/common/Icons';

// ── Color tokens ──────────────────────────────────────────────────────────────
const PINK  = '#F9A8D4';   // light pink
const PURP  = '#C084FC';   // light purple
const PINK2 = '#EC4899';   // deeper pink (borders/text emphasis)
// ─────────────────────────────────────────────────────────────────────────────

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
    const fetch = async () => {
      try {
        const [nR, tR] = await Promise.all([
          api.get('/products/new-arrivals', { params: { limit: 12 } }),
          api.get('/products/top-selling?limit=10'),
        ]);
        if (nR.data.success) {
          const p = (nR.data.data || []).map(x => ({
            ...x, images: (x.images || []).filter(Boolean).map(i => i.replace(/^http:\/\//i, 'https://')),
          }));
          setNewArrivals(p);
          sessionStorage.setItem('new_arrivals_cache', JSON.stringify({ products: p, expiresAt: Date.now() + 10000 }));
        }
        if (tR.data.success) setFeaturedProducts(tR.data.data || []);
      } catch (e) { console.warn(e.message); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <div>

      {/* ══════════════════════════════════════════════════════════════
          HERO — fits in ONE screen on laptop (100dvh)
          Layout: text left | image right
          Colors: deep purple → dark plum gradient, pink+purple accents
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          height: '100dvh',
          minHeight: 580,
          background: 'linear-gradient(to bottom, #2d1057 0%, #1a0b2e 40%, #0d2318 75%, #0f2e2a 100%)',
        }}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(192,132,252,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(192,132,252,0.08) 1px,transparent 1px)',
          backgroundSize: '44px 44px',
        }} />

        {/* Glow blobs */}
        <div className="absolute top-0 left-1/3 w-[500px] h-56 pointer-events-none"
          style={{ background: `radial-gradient(ellipse,rgba(249,168,212,0.14) 0%,transparent 70%)` }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 pointer-events-none"
          style={{ background: `radial-gradient(circle,rgba(192,132,252,0.18) 0%,transparent 70%)` }} />

        {/* Content grid — LAPTOP: 2 cols, MOBILE: 1 col stacked */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12
                        grid md:grid-cols-2 gap-4 md:gap-6 items-center
                        pt-4 pb-4 md:h-full overflow-y-auto md:overflow-visible">

          {/* LEFT — text */}
          <div className="flex flex-col gap-4 md:gap-5">

            {/* Badge */}
            <span className="self-start text-[10px] sm:text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full"
              style={{ color: PINK, border: `1.5px solid rgba(249,168,212,0.45)`, background: 'rgba(249,168,212,0.07)' }}>
              ✦ SUMMER 2026 COLLECTION — LIVE NOW
            </span>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-[1.1] tracking-tight">
              Shop premium products that{' '}
              <em style={{ fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', color: PINK, fontWeight: 700 }}>
                elevate
              </em>{' '}
              your style.
            </h1>

            {/* Sub */}
            <p className="text-xs sm:text-sm leading-relaxed max-w-md" style={{ color: 'rgba(255,255,255,0.58)' }}>
              Discover meticulously crafted garments designed to bring out your individuality.
              Fast delivery · Secure Razorpay checkout · Gmail-verified accounts.
            </p>

            {/* Category tags */}
            <p className="text-xs font-semibold tracking-wide" style={{ color: PURP }}>
              Streetwear · Luxury · Minimalist · Cargo · Accessories
            </p>

            {/* CTAs */}
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Link to="/shop"
                className="text-center font-black text-sm uppercase tracking-widest py-3.5 px-8 rounded-xl shadow-xl transition hover:brightness-110 active:scale-95"
                style={{ background: 'linear-gradient(135deg,#F5B041,#FFC107)', color: '#000' }}>
                Shop Now →
              </Link>
              <Link to="/new-arrivals"
                className="text-center font-semibold text-sm text-white py-3.5 px-8 rounded-xl transition hover:bg-white/10 active:scale-95"
                style={{ border: '1.5px solid rgba(255,255,255,0.28)' }}>
                View New Arrivals →
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {[['200+','Brands'],['2,000+','Products'],['30K+','Customers']].map(([n,l]) => (
                <div key={l}>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black text-white">{n}</p>
                  <p className="text-[9px] sm:text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* MOBILE — fashion image (phone only, below text) */}
          <div className="md:hidden relative w-full mt-2 mb-1">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=90"
              alt="Premium fashion model"
              className="w-full rounded-2xl object-cover shadow-2xl"
              style={{ height: 350, objectPosition: 'center 20%' }}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop&q=90';
              }}
            />
            <div className="absolute inset-0 rounded-2xl"
              style={{ background: 'linear-gradient(to bottom, rgba(45,16,87,0.35) 0%, rgba(13,35,24,0.65) 100%)' }} />
            <div className="absolute bottom-3 left-3 right-3 backdrop-blur-sm p-2.5 rounded-xl"
              style={{ background: 'rgba(10,5,20,0.72)', border: '1px solid rgba(249,168,212,0.2)' }}>
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#F9A8D4' }}>🔥 Exclusive Drop</span>
              <p className="text-xs font-semibold text-white mt-0.5">Streetwear & Minimalist Essentials — 2026</p>
            </div>
          </div>

          {/* RIGHT — fashion image (desktop/tablet only) */}
          <div className="hidden md:flex justify-center items-center relative">
            <div className="absolute inset-0 rounded-3xl blur-3xl pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at top,rgba(192,132,252,0.3) 0%,rgba(13,35,24,0.3) 100%)' }} />
            <div className="relative w-full max-w-xs lg:max-w-sm xl:max-w-md">
              <div className="absolute -inset-3 rounded-3xl pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(192,132,252,0.4) 0%, rgba(13,35,24,0.4) 100%)',
                  filter: 'blur(20px)',
                  opacity: 0.6
                }} />
              <div className="absolute -inset-2 rounded-3xl pointer-events-none"
                style={{ border: '1px solid rgba(249,168,212,0.2)' }} />
              <img
                src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop&q=80"
                alt="Premium fashion model"
                className="relative w-full rounded-3xl object-cover shadow-2xl"
                style={{
                  aspectRatio: '3/4',
                  maxHeight: 'calc(100dvh - 180px)',
                  objectPosition: 'center top',
                  boxShadow: '0 0 40px rgba(192,132,252,0.3), 0 0 80px rgba(13,35,24,0.2)'
                }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80';
                }}
              />
              {/* Overlay badge */}
              <div className="absolute bottom-5 left-5 right-5 backdrop-blur-md p-3 rounded-2xl"
                style={{ background: 'rgba(10,5,20,0.75)', border: '1px solid rgba(249,168,212,0.2)' }}>
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: PINK }}>🔥 Exclusive Drop</span>
                <p className="text-xs font-semibold text-white mt-0.5">Streetwear &amp; Minimalist Essentials — 2026</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          BRAND TICKER
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-6 overflow-hidden select-none border-y"
        style={{ background: 'linear-gradient(90deg,#1a0b2e,#2d0a3e,#1a0b2e)', borderColor: 'rgba(192,132,252,0.15)' }}>
        <div className="animate-marquee-ltr flex items-center space-x-10 whitespace-nowrap">
          {['VERSACE','ZARA','GUCCI','PRADA','Calvin Klein','NIKE',"LEVI'S",'ADIDAS','PUMA','BALENCIAGA','OFF-WHITE','Supreme','H&M',
            'VERSACE','ZARA','GUCCI','PRADA','Calvin Klein','NIKE',"LEVI'S",'ADIDAS','PUMA','BALENCIAGA','OFF-WHITE','Supreme','H&M',
          ].map((b, i) =>
            i % 2 === 0
              ? <span key={i} className="text-base sm:text-xl font-black tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.75)' }}>{b}</span>
              : <span key={i} className="text-xs" style={{ color: PURP }}>✦</span>
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
                style={{ background: 'rgba(249,168,212,0.1)', color: PINK, border: `1px solid rgba(249,168,212,0.3)` }}>
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
              {[...Array(10)].map((_, i) => <div key={i} className="animate-pulse rounded-2xl aspect-square" style={{ background: 'rgba(255,255,255,0.06)' }} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {newArrivals.slice(0,10).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TOP SELLING
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20"
        style={{ background: 'radial-gradient(ellipse at 30% 50%,#2d1057 0%,#1a0b2e 100%)' }}>
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
              {[...Array(10)].map((_, i) => <div key={i} className="animate-pulse rounded-2xl aspect-square" style={{ background: 'rgba(255,255,255,0.06)' }} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {featuredProducts.slice(0,10).map(p => <ProductCard key={p._id} product={p} />)}
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
              style={{ background: 'rgba(192,132,252,0.1)', color: PURP, border: '1px solid rgba(192,132,252,0.25)' }}>
              Categories
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">BROWSE BY STYLE</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { to:'/shop?category=T-Shirts', label:'Casual', img:'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800' },
              { to:'/shop?category=Shirts',   label:'Formal', img:'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800' },
              { to:'/shop?category=Jackets',  label:'Party & Outerwear', img:'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800' },
            ].map(cat => (
              <Link key={cat.to} to={cat.to}
                className="group relative h-64 sm:h-72 rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                <img src={cat.img} alt={cat.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(26,11,46,0.88) 0%,transparent 55%)' }} />
                <span className="absolute bottom-5 left-5 text-xl font-black text-white px-4 py-2 rounded-xl backdrop-blur-sm"
                  style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(249,168,212,0.2)' }}>
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
        style={{ background: 'radial-gradient(ellipse at 70% 100%,#2d1057,#1a0b2e)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-wider"
              style={{ background: 'rgba(249,168,212,0.1)', color: PINK, border: `1px solid rgba(249,168,212,0.25)` }}>
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">OUR HAPPY CUSTOMERS</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name:'Sarah M.', review:'"Blown away by the quality! The heavyweight tees feel ultra-luxury and the fit is impeccable."' },
              { name:'Alex K.',  review:'"SHOP.CO completely elevated my streetwear wardrobe. The range is unmatched across India."' },
              { name:'James L.', review:'"Razorpay checkout was seamless and my order arrived in 48 hours. Five stars all the way!"' },
            ].map((item,idx) => (
              <div key={idx} className="p-6 rounded-2xl space-y-4"
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(192,132,252,0.15)' }}>
                <div className="flex" style={{ color:'#FFC107' }}>
                  {[...Array(5)].map((_,i) => <StarIcon key={i} className="w-4 h-4" filled />)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{item.name}</span>
                  <span className="p-0.5 rounded-full" style={{ background:'rgba(249,168,212,0.18)' }}>
                    <CheckIcon className="w-3.5 h-3.5" style={{ color:PINK }} />
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color:'rgba(255,255,255,0.6)' }}>{item.review}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 text-center px-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#2d1057 0%,#1a0b2e 50%,#2d0a3e 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(192,132,252,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(192,132,252,0.06) 1px,transparent 1px)',
          backgroundSize: '44px 44px',
        }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 uppercase tracking-tight leading-tight">
            Ready to{' '}
            <em style={{ fontFamily:'"Playfair Display",Georgia,serif', fontStyle:'italic', color:PINK, fontWeight:700 }}>elevate</em>{' '}
            your wardrobe?
          </h2>
          <p className="text-sm mb-8" style={{ color:'rgba(255,255,255,0.55)' }}>
            Join 30,000+ happy customers. Free delivery on orders above ₹999.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-sm mx-auto sm:max-w-none">
            <Link to="/shop"
              className="font-black text-sm uppercase tracking-widest px-10 py-4 rounded-xl shadow-xl transition hover:brightness-110 active:scale-95"
              style={{ background:'linear-gradient(135deg,#F5B041,#FFC107)', color:'#000' }}>
              Shop All Products →
            </Link>
            <Link to="/register"
              className="font-bold text-sm text-white px-10 py-4 rounded-xl transition hover:bg-white/10 active:scale-95"
              style={{ border:'1.5px solid rgba(249,168,212,0.3)' }}>
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
