import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const emptyAddress = {
  fullName: '', phone: '', houseNumber: '', street: '', landmark: '',
  city: '', state: 'Maharashtra', postalCode: '', addressType: 'Home', isDefault: false,
};

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', dob: '', gender: '', avatar: '',
  });
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [password, setPassword] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/users/profile');
        const data = res.data.data;
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          dob: data.dob ? data.dob.substring(0, 10) : '',
          gender: data.gender || '',
          avatar: data.avatar || data.profilePhoto || data.picture || data.photoURL || '',
        });
        setAddresses(data.addresses || []);
      } catch (error) {
        alert(error.response?.data?.message || 'Unable to load profile');
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      api.get('/orders/my-orders').then((res) => setOrders(res.data.data || [])).catch(() => setOrders([]));
    }
    if (activeTab === 'wishlist') {
      api.get('/auth/wishlist').then((res) => setWishlist(res.data.data || [])).catch(() => setWishlist([]));
    }
  }, [activeTab]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/users/profile', {
        name: profile.name,
        phone: profile.phone,
        dob: profile.dob,
        gender: profile.gender,
      });
      updateUser(res.data.data);
      setProfile((current) => ({ ...current, ...res.data.data }));
      alert('Profile updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPG, PNG, and WebP images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be 5MB or smaller');
      return;
    }
    setAvatarPreview(URL.createObjectURL(file));
    const form = new FormData();
    form.append('avatar', file);
    try {
      const res = await api.post('/users/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile((current) => ({ ...current, avatar: res.data.data.avatar }));
      updateUser(res.data.user);
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to upload photo');
    }
  };

  const removeAvatar = async () => {
    try {
      const res = await api.delete('/users/avatar');
      setAvatarPreview('');
      setProfile((current) => ({ ...current, avatar: '' }));
      updateUser(res.data.user);
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to remove photo');
    }
  };

  const openAddressForm = (address = null) => {
    if (address) {
      setAddressForm(address);
      setEditingAddressId(address._id);
    } else {
      setAddressForm(emptyAddress);
      setEditingAddressId(null);
    }
    setShowAddressForm(true);
  };

  const saveAddress = async (event) => {
    event.preventDefault();
    if (!/^[1-9]\d{5}$/.test(addressForm.postalCode)) {
      alert('Enter a valid 6-digit PIN code');
      return;
    }
    setSaving(true);
    try {
      const res = editingAddressId
        ? await api.put(`/users/addresses/${editingAddressId}`, addressForm)
        : await api.post('/users/addresses', addressForm);
      setAddresses(res.data.data);
      setShowAddressForm(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to save address');
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (addressId) => {
    if (!window.confirm('Delete this saved address?')) return;
    try {
      const res = await api.delete(`/users/addresses/${addressId}`);
      setAddresses(res.data.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to delete address');
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      const res = await api.put(`/users/addresses/${addressId}/default`);
      setAddresses(res.data.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to set default address');
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/password', password);
      setPassword({ oldPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to change password');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    ['personal', 'Personal Info'],
    ['addresses', 'Addresses'],
    ['orders', 'Orders'],
    ['wishlist', 'Wishlist'],
    ['password', 'Change Password'],
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-black uppercase mb-6 sm:mb-8">Settings & Profile</h1>
      <div className="flex gap-1 sm:gap-2 overflow-x-auto border-b mb-6 sm:mb-8 scrollbar-hide">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`shrink-0 px-3 sm:px-4 pb-3 text-xs sm:text-sm font-bold border-b-2 ${activeTab === key ? 'border-black text-black' : 'border-transparent text-white/40'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'personal' && (
        <form onSubmit={saveProfile} className="max-w-3xl bg-transparent border rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-5">
            {avatarPreview || profile.avatar ? (
              <img
                src={avatarPreview || profile.avatar}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border"
                onError={(event) => { event.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-neutral-900 text-white flex items-center justify-center text-3xl font-bold">
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer bg-black text-white px-4 py-2 rounded-full text-sm font-semibold">
                Upload Photo
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatar} className="hidden" />
              </label>
              {(profile.avatar || avatarPreview) && (
                <button type="button" onClick={removeAvatar} className="border px-4 py-2 rounded-full text-sm font-semibold">
                  Remove
                </button>
              )}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2">Name</label>
              <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required className="w-full bg-white/8 px-4 py-2 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input value={profile.email} readOnly className="w-full bg-white/8 px-4 py-2 rounded-lg opacity-60" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Phone</label>
              <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="w-full bg-white/8 px-4 py-2 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Date of Birth</label>
              <input type="date" value={profile.dob} onChange={(e) => setProfile({ ...profile, dob: e.target.value })} className="w-full bg-white/8 px-4 py-2 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Gender</label>
              <select value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} className="w-full bg-white/8 px-4 py-2 rounded-lg">
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </div>
          </div>
          <button disabled={saving} className="bg-black text-white px-6 py-3 rounded-full text-sm font-bold">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {activeTab === 'addresses' && (
        <div className="space-y-5">
          <button onClick={() => openAddressForm()} className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold">Add Address</button>
          {addresses.map((address) => (
            <div key={address._id} className="border rounded-2xl p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-bold">{address.fullName} — {address.addressType}</p>
                  <p className="text-sm text-white/60">{address.houseNumber}, {address.street}{address.landmark ? `, ${address.landmark}` : ''}</p>
                  <p className="text-sm text-white/60">{address.city}, {address.state} - {address.postalCode}</p>
                  <p className="text-sm text-white/60">{address.phone}</p>
                  {address.isDefault && <span className="inline-block mt-2 text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Default</span>}
                </div>
                <div className="flex gap-2 items-start">
                  {!address.isDefault && <button onClick={() => setDefaultAddress(address._id)} className="text-xs font-bold underline">Set default</button>}
                  <button onClick={() => openAddressForm(address)} className="text-xs font-bold underline">Edit</button>
                  <button onClick={() => deleteAddress(address._id)} className="text-xs font-bold text-red-600 underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
          {showAddressForm && (
            <form onSubmit={saveAddress} className="border rounded-2xl p-6 grid sm:grid-cols-2 gap-4">
              {[
                ['fullName', 'Full Name'], ['phone', 'Phone'], ['houseNumber', 'House / Flat'],
                ['street', 'Street'], ['landmark', 'Landmark'], ['city', 'City'], ['postalCode', 'PIN Code'],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm font-semibold mb-1">{label}</label>
                  <input
                    value={addressForm[key]}
                    onChange={(e) => {
                      const value = key === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10)
                        : key === 'postalCode' ? e.target.value.replace(/\D/g, '').slice(0, 6)
                        : e.target.value;
                      setAddressForm({ ...addressForm, [key]: value });
                    }}
                    required={key !== 'landmark'}
                    className="w-full bg-white/8 px-4 py-2 rounded-lg"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold mb-1">State</label>
                <select value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="w-full bg-white/8 px-4 py-2 rounded-lg">
                  {INDIAN_STATES.map((state) => <option key={state}>{state}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Address Type</label>
                <select value={addressForm.addressType} onChange={(e) => setAddressForm({ ...addressForm, addressType: e.target.value })} className="w-full bg-white/8 px-4 py-2 rounded-lg">
                  <option>Home</option><option>Work</option><option>Other</option>
                </select>
              </div>
              <label className="sm:col-span-2 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} />
                Set as default address
              </label>
              <div className="sm:col-span-2 flex gap-3">
                <button disabled={saving} className="bg-black text-white px-5 py-2 rounded-full text-sm font-bold">{saving ? 'Saving...' : 'Save Address'}</button>
                <button type="button" onClick={() => setShowAddressForm(false)} className="border px-5 py-2 rounded-full text-sm font-bold">Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="border rounded-xl p-4 flex justify-between">
              <div><p className="font-bold">#{order._id.slice(-8)}</p><p className="text-sm text-white/50">{order.orderItems?.length || 0} items</p></div>
              <p className="font-bold">₹{order.totalPrice}</p>
            </div>
          ))}
          {orders.length === 0 && <p className="text-white/50">No orders yet.</p>}
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {wishlist.map((product) => (
            <a key={product._id} href={`/product/${product._id}`} className="border rounded-xl p-3">
              <img src={product.images?.[0] || ''} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/favicon.svg'; }} alt={product.title} className="w-full aspect-[3/4] object-cover rounded-lg" />
              <p className="mt-2 text-sm font-bold line-clamp-2">{product.title}</p>
            </a>
          ))}
          {wishlist.length === 0 && <p className="text-white/50">Your wishlist is empty.</p>}
        </div>
      )}

      {activeTab === 'password' && (
        <form onSubmit={changePassword} className="max-w-md border rounded-2xl p-6 space-y-4">
          {[
            ['oldPassword', 'Old Password'],
            ['newPassword', 'New Password'],
            ['confirmPassword', 'Confirm Password'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm font-semibold mb-1">{label}</label>
              <input type="password" value={password[key]} onChange={(e) => setPassword({ ...password, [key]: e.target.value })} required className="w-full bg-white/8 px-4 py-2 rounded-lg" />
            </div>
          ))}
          <button disabled={saving} className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold">
            {saving ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
