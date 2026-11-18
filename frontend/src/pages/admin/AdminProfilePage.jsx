import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

const AdminProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    storeName: '',
    storeAddress: '',
    supportEmail: '',
    profilePhoto: '',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetChallenge, setResetChallenge] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetStep, setResetStep] = useState(0);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.address?.phone || '',
        storeName: user.storeName || '',
        storeAddress: user.storeAddress || '',
        supportEmail: user.supportEmail || '',
        profilePhoto: user.profilePhoto || '',
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/admin/profile', formData);
      if (res.data.success) {
        updateUser(res.data.data);
        alert('Profile updated successfully');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await api.put('/auth/admin/password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.data.success) {
        alert('Password changed successfully');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  const requestAuthenticatorReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/admin/totp/reset/request', { password: resetPassword });
      setResetChallenge(res.data.data.challengeId);
      setResetStep(1);
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to start authenticator reset');
    } finally {
      setLoading(false);
    }
  };

  const verifyAuthenticatorReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/admin/totp/reset/verify', {
        challengeId: resetChallenge,
        otp: resetOtp,
      });
      alert('Authenticator reset. Sign out and log in again to set it up.');
      setResetStep(0);
      setResetPassword('');
      setResetOtp('');
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to reset authenticator');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be 5MB or smaller');
      return;
    }
    const body = new FormData();
    body.append('photo', file);
    setPhotoLoading(true);
    try {
      const res = await api.post('/auth/admin/profile-photo', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setFormData((current) => ({ ...current, profilePhoto: res.data.data.profilePhoto }));
        updateUser(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error uploading profile photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <a href="/admin" className="inline-flex items-center gap-2 text-neutral-600 hover:text-black">
          <span>← Back to Dashboard</span>
        </a>
      </div>

      <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 mb-8">
        Admin Profile
      </h1>

      {/* Profile Form */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-neutral-900 mb-6">Store Information</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="flex items-center gap-5">
            {formData.profilePhoto ? (
              <img src={formData.profilePhoto} alt="Admin profile" className="w-24 h-24 rounded-full object-cover border" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-neutral-900 text-white flex items-center justify-center text-3xl font-bold">
                {formData.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            )}
            <label className="cursor-pointer bg-neutral-100 px-4 py-2 rounded-full text-sm font-semibold hover:bg-neutral-200">
              {photoLoading ? 'Uploading...' : 'Upload Profile Photo'}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Store Name</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Support Email</label>
              <input
                type="email"
                value={formData.supportEmail}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Email (Read-only)</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-lg opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Store Address</label>
            <textarea
              value={formData.storeAddress}
              onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
              className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-lg"
              rows="3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-neutral-800 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password Change */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-900">Change Password</h2>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-sm text-neutral-600 hover:text-black"
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Old Password</label>
              <input
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                required
                className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
                className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-neutral-800 transition disabled:opacity-50"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm mt-8">
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Reset Authenticator</h2>
        <p className="text-sm text-neutral-500 mb-6">Requires your password and a 6-digit email OTP.</p>
        {resetStep === 0 ? (
          <form onSubmit={requestAuthenticatorReset} className="max-w-md space-y-4">
            <input
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              required
              placeholder="Current password"
              className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-lg"
            />
            <button disabled={loading} className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold">
              Send Email Verification
            </button>
          </form>
        ) : (
          <form onSubmit={verifyAuthenticatorReset} className="max-w-md space-y-4">
            <input
              type="text"
              inputMode="numeric"
              maxLength="6"
              value={resetOtp}
              onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              placeholder="6-digit email OTP"
              className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-lg"
            />
            <button disabled={loading} className="bg-red-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold">
              Confirm Reset
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminProfilePage;
