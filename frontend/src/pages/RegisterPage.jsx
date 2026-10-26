import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserIcon, GoogleIcon } from '../components/common/Icons';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const userData = await register(name, email, password);
      // Navigate to Gmail OTP verification
      navigate('/verify-email', {
        state: {
          email,
          devOtp: userData?.devOtp,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError('');

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          try {
            await loginWithGoogle({ credential: response.credential });
            navigate('/shop');
          } catch (err) {
            setError(err.response?.data?.message || 'Google account creation failed');
          } finally {
            setGoogleLoading(false);
          }
        },
      });
      window.google.accounts.id.prompt();
    } else {
      const userPromptEmail = prompt('Enter your Gmail address to create your verified account:', email || 'user@gmail.com');
      if (!userPromptEmail) {
        setGoogleLoading(false);
        return;
      }
      try {
        await loginWithGoogle({
          email: userPromptEmail,
          name: name || userPromptEmail.split('@')[0],
          picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
        });
        navigate('/shop');
      } catch (err) {
        setError(err.response?.data?.message || 'Google account creation failed');
      } finally {
        setGoogleLoading(false);
      }
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
            Create an Account
          </h1>
          <p className="text-xs text-neutral-500 mt-1">Join SHOP.CO to access authentic collections</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Continue with Google (Instant Verification) */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading}
          className="w-full border border-neutral-300 hover:border-black bg-white hover:bg-neutral-50 text-neutral-800 text-sm py-3 px-4 rounded-full font-semibold flex items-center justify-center gap-3 transition shadow-xs active:scale-95 disabled:opacity-50"
        >
          <GoogleIcon className="w-5 h-5 shrink-0" />
          <span>{googleLoading ? 'Connecting to Google...' : 'Sign up with Google'}</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-200 w-full" />
          <span className="bg-white px-3 text-xs uppercase font-bold text-neutral-400 absolute">
            or register with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
              placeholder="Rohan Sharma"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Gmail / Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
              placeholder="you@gmail.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Password (min 6 characters)</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-neutral-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3.5 rounded-full font-bold text-sm hover:bg-neutral-800 transition active:scale-95 disabled:opacity-50 shadow-md"
          >
            {loading ? 'Generating Verification...' : 'Verify Gmail with OTP'}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-black hover:underline">
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;
