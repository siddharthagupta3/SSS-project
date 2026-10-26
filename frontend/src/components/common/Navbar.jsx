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
      {/* Top Banner */}
      <div className="bg-black text-white text-xs py-2 text-center font-medium px-4">
        Sign up and get 20% off your first order. Use code <span className="underline font-bold">SHOP10</span>
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
            <Link to="/shop?category=Jeans" className="hover:text-black transition">Jeans</Link>
            <Link to="/shop?category=Jackets" className="hover:text-black transition">Jackets</Link>
            <Link to="/shop?category=Shoes" className="hover:text-black transition">Shoes</Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search for products, brands..."
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
                  <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{user?.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
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
            <Link to="/shop?category=Jeans" onClick={() => setMobileMenuOpen(false)} className="hover:text-black">Jeans</Link>
            <Link to="/shop?category=Jackets" onClick={() => setMobileMenuOpen(false)} className="hover:text-black">Jackets</Link>
            <Link to="/shop?category=Shoes" onClick={() => setMobileMenuOpen(false)} className="hover:text-black">Shoes</Link>
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
