import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [otp, setOtp] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const submitCredentials = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/admin/login', { email, password });
      setChallengeId(res.data.data.challengeId);
      setCooldown(30);
      setStep(res.data.data.requiresTotpSetup ? 2 : 2);
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/admin/email-otp/resend', { challengeId });
      setCooldown(30);
    } catch {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/admin/email-otp/verify', { challengeId, otp });
      if (res.data.data.requiresTotpSetup) {
        const setup = await api.post('/auth/admin/totp/setup', { challengeId });
        setQrCode(setup.data.data.qrCode);
        setManualKey(setup.data.data.manualKey);
        setStep(4);
      } else {
        setStep(3);
      }
    } catch {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const completeExistingTotp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/admin/totp/verify', { challengeId, code: totpCode });
      const data = res.data.data;
      localStorage.setItem('sss_token', data.token);
      localStorage.setItem('sss_user', JSON.stringify(data.user));
      updateUser(data.user);
      navigate(data.redirectTo || '/admin', { replace: true });
    } catch {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const completeTotpSetup = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/admin/totp/setup/verify', { challengeId, code: totpCode });
      const data = res.data.data;
      setBackupCodes(data.backupCodes || []);
      setStep(5);
      localStorage.setItem('sss_token', data.token);
      localStorage.setItem('sss_user', JSON.stringify(data.user));
      updateUser(data.user);
    } catch {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const panelTitle = step === 1 ? 'Admin Sign In'
    : step === 2 ? 'Email Verification'
    : step === 3 ? 'Authenticator Code'
    : step === 4 ? 'Setup Authenticator'
    : 'Backup Codes';

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-3xl p-7 sm:p-10 shadow-xl">
        <div className="text-center mb-7">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Secure Admin Access</p>
          <h1 className="text-2xl font-black uppercase mt-1">{panelTitle}</h1>
        </div>
        {error && <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">{error}</div>}

        {step === 1 && (
          <form onSubmit={submitCredentials} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Admin Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-neutral-100 px-4 py-3 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-neutral-100 px-4 py-3 rounded-xl" />
            </div>
            <button disabled={loading} className="w-full bg-black text-white py-3 rounded-full font-bold">
              {loading ? 'Checking...' : 'Continue'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyOtp} className="space-y-4">
            <p className="text-sm text-neutral-500 text-center">Enter the 6-digit code sent to your admin email.</p>
            <input type="text" inputMode="numeric" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required className="w-full text-center text-2xl tracking-[0.5em] bg-neutral-100 px-4 py-3 rounded-xl" />
            <button disabled={loading} className="w-full bg-black text-white py-3 rounded-full font-bold">Verify Email Code</button>
            <button type="button" disabled={cooldown > 0 || loading} onClick={resendOtp} className="w-full text-sm font-semibold text-neutral-600 disabled:opacity-50">
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={completeExistingTotp} className="space-y-4">
            <p className="text-sm text-neutral-500 text-center">Enter the 6-digit code from Google Authenticator.</p>
            <input type="text" inputMode="numeric" maxLength="8" value={totpCode} onChange={(e) => setTotpCode(e.target.value.toUpperCase())} required className="w-full text-center text-2xl tracking-[0.25em] bg-neutral-100 px-4 py-3 rounded-xl" />
            <button disabled={loading} className="w-full bg-black text-white py-3 rounded-full font-bold">Open Admin Dashboard</button>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={completeTotpSetup} className="space-y-5">
            {qrCode && <img src={qrCode} alt="Authenticator QR code" className="w-52 h-52 mx-auto border rounded-2xl" />}
            <div className="text-center">
              <p className="text-xs text-neutral-500">Manual key</p>
              <code className="block mt-1 text-sm font-bold break-all bg-neutral-100 p-2 rounded-lg">{manualKey}</code>
            </div>
            <input type="text" inputMode="numeric" maxLength="6" value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required placeholder="000000" className="w-full text-center text-2xl tracking-[0.5em] bg-neutral-100 px-4 py-3 rounded-xl" />
            <button disabled={loading} className="w-full bg-black text-white py-3 rounded-full font-bold">Verify & Enable</button>
          </form>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <p className="text-sm text-neutral-600">Save these backup codes now. They are shown once.</p>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code) => <code key={code} className="text-center bg-neutral-100 p-2 rounded-lg font-bold">{code}</code>)}
            </div>
            <button onClick={() => navigate('/admin', { replace: true })} className="w-full bg-black text-white py-3 rounded-full font-bold">Continue to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLoginPage;
