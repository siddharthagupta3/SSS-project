import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckIcon } from '../components/common/Icons';

const VerifyEmailPage = () => {
  const { user, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || user?.email || '';
  const initialDevOtp = location.state?.devOtp || '';

  const [otp, setOtp] = useState(initialDevOtp);
  const [digits, setDigits] = useState(() => Array.from({ length: 6 }, (_, i) => initialDevOtp[i] || ''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await verifyOTP(email, otp);
      setSuccessMsg('Your Gmail address has been verified successfully! 🎉');
      setTimeout(() => {
        navigate('/shop');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError('');
    setSuccessMsg('');
    try {
      const res = await resendOTP(email);
      setSuccessMsg('A new 6-digit verification code has been dispatched.');
      if (res.devOtp) setOtp(res.devOtp);
      setTimer(30);
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend OTP');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6 text-center">
        
        {/* Envelope Icon */}
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-sm">
          📧
        </div>

        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">
            Verify Your Gmail
          </h1>
          <p className="text-xs text-neutral-500 mt-2">
            We have sent a 6-digit verification code to:
          </p>
          <p className="font-bold text-sm text-neutral-800 mt-0.5">{email || 'your email'}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl font-medium flex items-center justify-center gap-1.5">
            <CheckIcon className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-2">
              Enter 6-Digit Code
            </label>
            <div className="flex justify-center gap-2">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  autoFocus={index === 0}
                  value={digit}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(-1);
                    const next = [...digits];
                    next[index] = value;
                    setDigits(next);
                    setOtp(next.join(''));
                    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
                  }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                    if (pasted) {
                      setDigits(Array.from({ length: 6 }, (_, i) => pasted[i] || ''));
                      setOtp(pasted);
                    }
                  }}
                  className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl bg-neutral-100 border border-neutral-200 outline-none focus:ring-2 focus:ring-black"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-black text-white py-3.5 rounded-full font-bold text-sm hover:bg-neutral-800 transition active:scale-95 disabled:opacity-50 shadow-md"
          >
            {loading ? 'Verifying Code...' : 'Verify Email & Continue'}
          </button>
        </form>

        <div className="pt-2 text-xs text-neutral-500 flex items-center justify-center gap-2">
          <span>Didn't receive code?</span>
          {canResend ? (
            <button
              onClick={handleResend}
              className="font-bold text-black hover:underline"
            >
              Resend OTP
            </button>
          ) : (
            <span className="font-semibold text-neutral-400">Resend in {timer}s</span>
          )}
        </div>

        <div className="border-t pt-4">
          <Link to="/shop" className="text-xs text-neutral-500 hover:text-black">
            Skip for now & browse store →
          </Link>
        </div>

      </div>
    </div>
  );
};

export default VerifyEmailPage;
