import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  SearchIcon,
  ShoppingBagIcon,
  UserIcon,
  MenuIcon,
  CloseIcon,
  CheckIcon,
  HeartIcon,
} from './Icons';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [keyword, setKeyword] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

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
      <div className="bg-black text-white text-xs py-2 overflow-hidden border-b border-neutral-900 select-none hidden sm:block">
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

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-1 sm:gap-4">
          
          {/* Mobile Menu Button & Brand */}
          <div className="flex min-w-0 items-center justify-start gap-2 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-800 shadow-sm hover:border-black hover:bg-neutral-50 active:scale-95 transition"
              aria-label="Toggle Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
            <Link
              to="/"
              className="flex h-9 items-center text-xl sm:text-3xl font-black leading-none tracking-tighter text-black uppercase"
            >
              SHOP.CO
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-neutral-700">
            <Link to="/new-arrivals" className="hover:text-black transition">New Arrivals</Link>
            <Link to="/watches" className="hover:text-black transition">Videos</Link>
            <Link to="/developer" className="hover:text-black transition">Developer</Link>
            {isAdmin && (
              <Link to="/admin" className="hover:text-black transition text-emerald-700 font-bold">Admin</Link>
            )}
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
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            
            {/* Wishlist Icon */}
            <Link to="/wishlist" className="relative flex h-9 w-9 items-center justify-center sm:h-auto sm:w-auto sm:p-2 text-neutral-800 hover:text-red-500 transition" title="Wishlist">
              <HeartIcon className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileSearchOpen((open) => !open)}
              className="md:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-800 hover:bg-neutral-100 transition"
              aria-label="Open search"
              aria-expanded={mobileSearchOpen}
            >
              <SearchIcon className="h-5 w-5" />
            </button>

            {/* Cart Icon */}
            <Link to="/cart" className="relative flex h-9 w-9 items-center justify-center sm:h-auto sm:w-auto sm:p-2 text-neutral-800 hover:text-black transition" title="Shopping Bag">
              <ShoppingBagIcon className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <Link
                  to={isAdmin ? '/admin/profile' : '/profile'}
                  className="md:hidden flex h-9 w-9 items-center justify-center rounded-full transition"
                  aria-label="Open profile"
                >
                  {user?.avatar || user?.profilePhoto ? (
                    <img
                      src={user.avatar || user.profilePhoto}
                      alt={user.name || 'Profile'}
                      className="h-9 w-9 rounded-full object-cover ring-1 ring-neutral-200"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </Link>

                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="hidden items-center gap-2 rounded-full p-1.5 hover:bg-neutral-100 transition md:flex"
                  aria-label="Open account menu"
                >
                  {user?.avatar || user?.profilePhoto ? (
                    <img
                      src={user.avatar || user.profilePhoto}
                      alt={user.name || 'Profile'}
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-neutral-200"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
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
                      to={isAdmin ? '/admin/profile' : '/profile'}
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/my-orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      Orders
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      My Wishlist ({wishlistCount})
                    </Link>

                    {isAdmin && (
                      <>
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-emerald-700 font-medium hover:bg-neutral-50"
                        >
                          ⚡ Admin Dashboard
                        </Link>
                        <Link
                          to="/admin/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                        >
                          Admin Profile
                        </Link>
                      </>
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
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black p-0 text-white sm:w-auto sm:px-4 text-sm font-medium hover:bg-neutral-800 transition"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Log In</span>
              </Link>
            )}

          </div>
        </div>
        {mobileSearchOpen && (
          <form
            onSubmit={handleSearchSubmit}
            className="sm:hidden absolute left-4 right-4 top-[64px] z-[55] rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl"
          >
            <div className="relative">
              <input
                type="search"
                autoFocus
                placeholder="Search products..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-100 py-3 pl-11 pr-4 text-sm text-neutral-900 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
              />
              <button type="submit" className="absolute left-4 top-3.5 text-neutral-500" aria-label="Search">
                <SearchIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[82%] max-w-sm bg-white shadow-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black tracking-tighter">
                SHOP.CO
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="h-10 w-10 rounded-xl border border-neutral-200 flex items-center justify-center"
                aria-label="Close menu"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-5 flex flex-col gap-2">
              {[
                ['/new-arrivals', 'New Arrivals'],
                ['/watches', 'Videos'],
                ['/developer', 'Developer'],
              ].map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-2xl border border-neutral-100 px-4 py-3.5 text-sm font-bold text-neutral-800 hover:border-black hover:bg-neutral-50"
                >
                  {label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 rounded-2xl bg-emerald-50 px-4 py-3.5 text-sm font-bold text-emerald-700"
                >
                  Admin
                </Link>
              )}
            </nav>
            <div className="mt-auto border-t border-neutral-100 pt-4">
              <Link
                to={isAuthenticated ? (isAdmin ? '/admin/profile' : '/profile') : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="mb-2 flex items-center justify-between rounded-xl px-3 py-3 text-sm font-black uppercase tracking-wide text-neutral-900 hover:bg-neutral-100"
              >
                <span>Settings</span>
                <span aria-hidden="true">›</span>
              </Link>
              {isAuthenticated ? (
                <div className="space-y-1">
                  <Link
                    to={isAdmin ? '/admin/profile' : '/profile'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center rounded-xl px-3 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
                  >
                    Profile & Account
                  </Link>
                  <Link
                    to="/my-orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center rounded-xl px-3 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center rounded-xl px-3 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
                  >
                    Wishlist
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-xl px-3 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-xl bg-black px-4 py-3 text-sm font-bold text-white"
                >
                  Login
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
};

export default Navbar;
