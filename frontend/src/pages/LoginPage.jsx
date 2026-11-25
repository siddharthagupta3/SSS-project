import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserIcon } from '../components/common/Icons';
import { loadGoogleIdentityServices } from '../utils/googleAuth';
import { loadTurnstile } from '../utils/turnstile';

// Turnstile CAPTCHA — only active when VITE_TURNSTILE_SITE_KEY is set in .env
// Leave blank to disable completely (no errors, no widget)
const TURNSTILE_SITE_KEY =
  import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAGK0ipwow1maoTwK';

const LoginPage = () => {
  const [email, setEmail] = useState(() => localStorage.getItem('sss_remember_email') || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const googleButtonRef = useRef(null);
  const turnstileRef = useRef(null);
  const [turnstileToken, setTurnstileToken] = useState('');

  // Login OTP step
  const [step, setStep] = useState('credentials');
  const [loginEmail, setLoginEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const { login, loginWithGoogle, verifyLoginOTP, resendLoginOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryRedirect = new URLSearchParams(location.search).get('redirect');
  const from = location.state?.from?.pathname || queryRedirect || '/';
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [googleReady, setGoogleReady] = useState(false);

  // Turnstile widget init
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileRef.current) return;
    let active = true;
    let widgetId;
    loadTurnstile()
      .then((turnstile) => {
        if (!active || !turnstileRef.current) return;
        widgetId = turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (t) => setTurnstileToken(t),
          'expired-callback': () => setTurnstileToken(''),
          'error-callback': () => {
            setTurnstileToken('');
            setError('Cloudflare verification failed. Please retry.');
          },
        });
      })
      .catch((err) => setError(err.message));
    return () => {
      active = false;
      try { if (widgetId !== undefined && window.turnstile) window.turnstile.remove(widgetId); } catch (_) {}
    };
  }, []);

  // OTP countdown
  useEffect(() => {
    if (step !== 'otp') return;
    setOtpTimer(30);
    setCanResend(false);
    const interval = setInterval(() => {
      setOtpTimer((t) => {
        if (t <= 1) { clearInterval(interval); setCanResend(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const initializeGoogle = useCallback(() => {
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
            if (!response?.credential) { setError('Google authentication failed'); return; }
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
          type: 'standard', theme: 'outline', size: 'large',
          text: 'continue_with', shape: 'rectangular',
          width: Math.min(320, googleButtonRef.current.clientWidth || 320),
        });
        setGoogleReady(true);
      })
      .catch((err) => setError(err.message));
  }, [googleClientId, from, loginWithGoogle, navigate]);

  useEffect(() => { initializeGoogle(); }, [initializeGoogle]);

  // Step 1: Submit credentials
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Only block if key is set AND token is missing
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError('Please complete the CAPTCHA verification.');
      return;
    }

    setLoading(true);
    try {
      const body = { email: email.trim().toLowerCase(), password };
      if (TURNSTILE_SITE_KEY && turnstileToken) body['cf-turnstile-response'] = turnstileToken;

      const result = await login(email, password, TURNSTILE_SITE_KEY ? turnstileToken : undefined);

      if (result?.requiresOtp) {
        setLoginEmail(result.email || email.trim().toLowerCase());
        setStep('otp');
        return;
      }
      if (rememberMe) localStorage.setItem('sss_remember_email', email.trim().toLowerCase());
      else localStorage.removeItem('sss_remember_email');
      navigate(result.role === 'admin' ? '/admin' : from, { replace: true });
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

  // Step 2: Verify login OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== 6) { setError('Please enter the 6-digit code'); return; }
    setError('');
    setOtpLoading(true);
    try {
      const user = await verifyLoginOTP(loginEmail, otp);
      if (rememberMe) localStorage.setItem('sss_remember_email', loginEmail);
      else localStorage.removeItem('sss_remember_email');
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid or expired code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendLoginOTP = async () => {
    if (!canResend) return;
    setError('');
    try {
      await resendLoginOTP(loginEmail);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpTimer(30);
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend code');
    }
  };

  // ── OTP Step ──────────────────────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12"
        style={{ background: 'linear-gradient(to bottom, #2d1057, #1a0b2e, #0f2e2a)' }}>
        <div className="max-w-md w-full border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 text-center"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}>
          <div className="w-16 h-16 bg-purple-900/60 text-pink-300 rounded-full flex items-center justify-center mx-auto text-2xl shadow-sm">🔐</div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Login Verification</h1>
            <p className="text-xs text-white/50 mt-2">We sent a 6-digit code to:</p>
            <p className="font-bold text-sm text-white/90 mt-0.5">{loginEmail}</p>
          </div>

          {error && (
            <div className="border border-red-500/40 text-red-400 text-xs p-3 rounded-xl font-medium">{error}</div>
          )}

          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2">Enter 6-Digit Code</label>
              <div className="flex justify-center gap-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`login-otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    autoFocus={index === 0}
                    value={digit}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(-1);
                      const next = [...otpDigits];
                      next[index] = value;
                      setOtpDigits(next);
                      if (value && index < 5) document.getElementById(`login-otp-${index + 1}`)?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && index > 0) {
                        document.getElementById(`login-otp-${index - 1}`)?.focus();
                      }
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                      if (pasted) setOtpDigits(Array.from({ length: 6 }, (_, i) => pasted[i] || ''));
                    }}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border border-white/20 outline-none focus:ring-2 focus:ring-purple-400 text-white" style={{ background: "rgba(255,255,255,0.08)" }}
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={otpLoading || otpDigits.join('').length !== 6}
              className="w-full bg-black text-white py-3.5 rounded-full font-bold text-sm hover:bg-neutral-800 transition active:scale-95 disabled:opacity-50 shadow-md"
            >
              {otpLoading ? 'Verifying...' : 'Confirm & Sign In'}
            </button>
          </form>

          <div className="text-xs text-white/50 flex items-center justify-center gap-2">
            <span>Didn't receive code?</span>
            {canResend ? (
              <button onClick={handleResendLoginOTP} className="font-bold text-black hover:underline">Resend Code</button>
            ) : (
              <span className="font-semibold text-white/40">Resend in {otpTimer}s</span>
            )}
          </div>
          <button
            onClick={() => { setStep('credentials'); setError(''); setOtpDigits(['', '', '', '', '', '']); }}
            className="text-xs text-white/50 hover:text-black"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Credentials Step ──────────────────────────────────────────────────────
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(to bottom, #2d1057, #1a0b2e, #0f2e2a)' }}>
      <div className="w-full max-w-sm sm:max-w-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5"
        style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}>
        <div className="text-center">
          <div className="w-11 h-11 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <UserIcon className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">Welcome to SHOP.CO</h1>
          <p className="text-xs text-white/50 mt-1">Sign in to your verified account</p>
        </div>

        {error && (
          <div className="border border-red-500/40 text-red-400 text-xs p-3 rounded-xl font-medium">{error}</div>
        )}

        {/* Google Sign-In */}
        <div className="w-full overflow-hidden">
          <div className="flex min-h-[44px] w-full justify-center overflow-hidden" ref={googleButtonRef} />
          {!googleClientId && <p className="text-center text-xs text-red-600">Google Sign-In is not configured.</p>}
          {googleClientId && !googleReady && !googleLoading && (
            <button type="button" onClick={initializeGoogle}
              className="mt-2 w-full rounded-full border border-white/20 py-2.5 text-sm font-bold text-white/90 hover:bg-neutral-50">
              Retry Google Sign-In
            </button>
          )}
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/15 w-full" />
          <span className="bg-transparent px-3 text-xs uppercase font-bold text-white/40 absolute">or continue with email</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm text-white placeholder-white/40 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-purple-400" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
              placeholder="name@example.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm text-white placeholder-white/40 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-purple-400" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
              placeholder="••••••••" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-white/60">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-xs font-semibold text-white/60 hover:text-black">Forgot password?</Link>
          </div>

          {/* Turnstile CAPTCHA — only shown when site key is set */}
          {TURNSTILE_SITE_KEY && (
            <div className="flex justify-center overflow-hidden rounded-xl" ref={turnstileRef} />
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-black text-white py-3 rounded-full font-bold text-sm hover:bg-neutral-800 transition active:scale-95 disabled:opacity-50 shadow-md">
            {loading ? 'Sending Code...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-white/50">
          New to SHOP.CO?{' '}
          <Link to="/register" className="font-bold text-black hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
