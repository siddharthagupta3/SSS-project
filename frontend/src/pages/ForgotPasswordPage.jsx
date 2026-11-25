import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await forgotPassword(email);
      setMessage('If an account exists for this email, a password reset code has been sent.');
      setTimeout(() => navigate('/reset-password', { state: { email: email.trim().toLowerCase() } }), 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full border border-white/10 rounded-3xl p-8 shadow-xl space-y-5">
        <h1 className="text-2xl font-black uppercase text-center">Forgot password</h1>
        {error && <div className="border border-red-500/40 text-red-400 text-xs p-3 rounded-xl">{error}</div>}
        {message && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Email address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full text-sm text-white placeholder-white/40 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-black" />
          </div>
          <button disabled={loading} className="w-full bg-black text-white py-3.5 rounded-full font-bold text-sm disabled:opacity-50">{loading ? 'Sending...' : 'Send reset code'}</button>
        </form>
        <p className="text-center text-xs"><Link to="/login" className="font-bold hover:underline">Back to login</Link></p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
