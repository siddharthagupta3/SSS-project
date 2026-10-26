import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserIcon } from '../components/common/Icons';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 shadow-lg space-y-6">
        
        <div className="text-center">
          <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-3">
            <UserIcon className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">
            Welcome Back
          </h1>
          <p className="text-xs text-neutral-500 mt-1">Log in to manage orders, wishlist, and profile</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* 1-Click Demo Fill for Easy Testing & Interviews */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3.5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block text-center">
            ⚡ Quick Test Fill (1-Click)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('user@example.com', 'User@123password')}
              className="bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs py-1.5 px-2 rounded-lg font-medium transition"
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@example.com', 'Admin@123password')}
              className="bg-neutral-900 hover:bg-black text-white text-xs py-1.5 px-2 rounded-lg font-medium transition"
            >
              Demo Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3.5 rounded-full font-bold text-sm hover:bg-neutral-800 transition active:scale-95 disabled:opacity-50 shadow-md"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-black hover:underline">
            Register now
          </Link>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
