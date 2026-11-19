import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserIcon } from '../components/common/Icons';
import { loadGoogleIdentityServices } from '../utils/googleAuth';

const LoginPage = () => {
  const [email, setEmail] = useState(() => localStorage.getItem('sss_remember_email') || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const googleButtonRef = useRef(null);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryRedirect = new URLSearchParams(location.search).get('redirect');
  const from = location.state?.from?.pathname || queryRedirect || '/';
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [googleReady, setGoogleReady] = useState(false);

  const initializeGoogle = () => {
    if (!googleClientId) return;
    setGoogleReady(false);
    setError('');
    loadGoogleIdentityServices()
      .then((googleIdentity) => {
        if (!googleButtonRef.current) return;
        googleButtonRef.current.replaceChildren();
        googleIdentity.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (!response?.credential) {
              setError('Google authentication failed');
              return;
            }
            setGoogleLoading(true);
            setError('');
            try {
              const user = await loginWithGoogle({ credential: response.credential });
              navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
            } catch (err) {
              setError(err.response?.data?.message || 'Google authentication failed');
            } finally {
              setGoogleLoading(false);
            }
          },
        });
        googleIdentity.renderButton(googleButtonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: Math.min(320, googleButtonRef.current.clientWidth || 320),
        });
        setGoogleReady(true);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    initializeGoogle();
  }, [googleClientId, from, loginWithGoogle, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (rememberMe) localStorage.setItem('sss_remember_email', email.trim().toLowerCase());
      else localStorage.removeItem('sss_remember_email');
      if (loggedInUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.requiresVerification) {
        navigate('/verify-email', { state: { email: email.trim().toLowerCase(), purpose: 'register' } });
        return;
      }
      setError(err.response?.data?.message || err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        
        <div className="text-center">
          <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <UserIcon className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">
            Welcome to SHOP.CO
          </h1>
          <p className="text-xs text-neutral-500 mt-1">Sign in to your verified account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="w-full">
          <div className="flex min-h-[44px] w-full justify-center overflow-hidden" ref={googleButtonRef} />
          {!googleClientId && <p className="text-center text-xs text-red-600">Google Sign-In is not configured.</p>}
          {googleClientId && !googleReady && !googleLoading && (
            <button
              type="button"
              onClick={initializeGoogle}
              className="mt-2 w-full rounded-full border border-neutral-300 py-2.5 text-sm font-bold text-neutral-800 hover:bg-neutral-50"
            >
              Retry Google Sign-In
            </button>
          )}
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-200 w-full" />
          <span className="bg-white px-3 text-xs uppercase font-bold text-neutral-400 absolute">
            or continue with email
          </span>
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
              placeholder="name@example.com"
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

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs font-semibold text-neutral-600 hover:text-black">
              Forgot password?
            </Link>
          </div>

          <label className="flex items-center gap-2 text-xs text-neutral-600">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            Remember me
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3.5 rounded-full font-bold text-sm hover:bg-neutral-800 transition active:scale-95 disabled:opacity-50 shadow-md"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-500">
          New to SHOP.CO?{' '}
          <Link to="/register" className="font-bold text-black hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
