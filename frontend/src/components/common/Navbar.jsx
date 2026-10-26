import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  SearchIcon,
  ShoppingBagIcon,
  UserIcon,
  MenuIcon,
  CloseIcon,
  CheckIcon,
} from './Icons';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(keyword.trim())}`);
      setKeyword('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      {/* Moving Announcement Ticker (Left to Right continuous marquee) */}
      <div className="bg-black text-white text-xs py-2 overflow-hidden border-b border-neutral-900 select-none">
        <div className="animate-marquee-ltr flex items-center space-x-12 whitespace-nowrap">
          <span className="flex items-center gap-2">
            <span className="text-amber-400">⚡</span>
            <span>SIGN UP AND GET 20% OFF YOUR FIRST ORDER • USE CODE: <strong className="underline tracking-wider">SHOP10</strong></span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-emerald-400">📦</span>
            <span>FREE DELIVERY ALL OVER INDIA ON ORDERS ABOVE ₹999</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-blue-400">🔒</span>
            <span>100% SECURE CHECKOUT WITH RAZORPAY & INSTANT GMAIL VERIFICATION</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-purple-400">✨</span>
            <span>NEW STREETWEAR & LUXURY DROP 2026 LIVE NOW</span>
          </span>

          {/* Duplicated for seamless infinite loop */}
          <span className="flex items-center gap-2">
            <span className="text-amber-400">⚡</span>
            <span>SIGN UP AND GET 20% OFF YOUR FIRST ORDER • USE CODE: <strong className="underline tracking-wider">SHOP10</strong></span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-emerald-400">📦</span>
            <span>FREE DELIVERY ALL OVER INDIA ON ORDERS ABOVE ₹999</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-blue-400">🔒</span>
            <span>100% SECURE CHECKOUT WITH RAZORPAY & INSTANT GMAIL VERIFICATION</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-purple-400">✨</span>
            <span>NEW STREETWEAR & LUXURY DROP 2026 LIVE NOW</span>
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Mobile Menu Button & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-700 hover:text-black focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
            <Link to="/" className="text-2xl sm:text-3xl font-black tracking-tighter text-black uppercase">
              SHOP.CO
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-neutral-700">
            <Link to="/shop" className="hover:text-black transition">Shop</Link>
            <Link to="/shop?category=T-Shirts" className="hover:text-black transition">T-Shirts</Link>
            <Link to="/shop?category=Shirts" className="hover:text-black transition">Shirts</Link>
            <Link to="/shop?category=Jeans" className="hover:text-black transition">Jeans</Link>
            <Link to="/shop?category=Cargo Pants" className="hover:text-black transition">Cargo Pants</Link>
            <Link to="/shop?category=Jackets" className="hover:text-black transition">Jackets</Link>
            <Link to="/shop?category=Watches" className="hover:text-black transition">Watches</Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search for products, brands, cargo..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-neutral-100 text-sm rounded-full py-2.5 pl-10 pr-4 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button type="submit" className="absolute left-3.5 top-3 text-neutral-400 hover:text-black">
              <SearchIcon className="w-4 h-4" />
            </button>
          </form>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            
            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 text-neutral-800 hover:text-black transition">
              <ShoppingBagIcon className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-black text-white text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-neutral-100 transition"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {user?.isEmailVerified && (
                      <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5" title="Verified Gmail Account">
                        <CheckIcon className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-neutral-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{user?.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                      <div className="mt-1.5">
                        {user?.isEmailVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckIcon className="w-3 h-3" />
                            <span>Gmail Verified</span>
                          </span>
                        ) : (
                          <Link
                            to="/verify-email"
                            onClick={() => setUserDropdownOpen(false)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full hover:underline"
                          >
                            <span>⚠️ Verify Gmail (Enter OTP)</span>
                          </Link>
                        )}
                      </div>
                    </div>

                    <Link
                      to="/my-orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      My Orders
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-emerald-700 font-medium hover:bg-neutral-50"
                      >
                        ⚡ Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-800 transition"
              >
                <UserIcon className="w-4 h-4" />
                <span>Log In</span>
              </Link>
            )}

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-4 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-neutral-100 text-sm rounded-full py-2.5 pl-10 pr-4"
            />
            <button type="submit" className="absolute left-3.5 top-3 text-neutral-400">
              <SearchIcon className="w-4 h-4" />
            </button>
          </form>

          <nav className="flex flex-col space-y-3 font-medium text-neutral-700">
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="hover:text-black">All Shop</Link>
            <Link to="/shop?category=T-Shirts" onClick={() => setMobileMenuOpen(false)} className="hover:text-black">T-Shirts</Link>
            <Link to="/shop?category=Shirts" onClick={() => setMobileMenuOpen(false)} className="hover:text-black">Shirts</Link>
            <Link to="/shop?category=Jeans" onClick={() => setMobileMenuOpen(false)} className="hover:text-black">Jeans</Link>
            <Link to="/shop?category=Cargo Pants" onClick={() => setMobileMenuOpen(false)} className="hover:text-black">Cargo Pants</Link>
            <Link to="/shop?category=Jackets" onClick={() => setMobileMenuOpen(false)} className="hover:text-black">Jackets</Link>
            <Link to="/shop?category=Watches" onClick={() => setMobileMenuOpen(false)} className="hover:text-black">Watches</Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-emerald-700 font-semibold">
                Admin Panel
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
