import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 8 || !/\d/.test(password)) return setError('Password must be at least 8 characters and include at least one number');
    setLoading(true);
    try {
      await resetPassword(email, otp, password, confirmPassword);
      setSuccess('Password updated. Please log in again.');
      setTimeout(() => navigate('/login', { replace: true }), 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-3xl p-8 shadow-xl space-y-5">
        <h1 className="text-2xl font-black uppercase text-center">Reset password</h1>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl">{error}</div>}
        {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-neutral-100 text-sm px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-black" />
          <input type="text" inputMode="numeric" required maxLength={6} placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full text-center tracking-[10px] bg-neutral-100 text-lg py-3 rounded-xl outline-none focus:ring-2 focus:ring-black" />
          <input type="password" required placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-neutral-100 text-sm px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-black" />
          <input type="password" required placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-neutral-100 text-sm px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-black" />
          <button disabled={loading || otp.length !== 6} className="w-full bg-black text-white py-3.5 rounded-full font-bold text-sm disabled:opacity-50">{loading ? 'Updating...' : 'Update password'}</button>
        </form>
        <p className="text-center text-xs"><Link to="/login" className="font-bold hover:underline">Back to login</Link></p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
