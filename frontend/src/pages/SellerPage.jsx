import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['T-Shirts', 'Shirts', 'Jeans', 'Pants', 'Cargo Pants', 'Jackets', 'Hoodies', 'Shoes', 'Watches', 'Accessories', 'Groceries'];

const SellerPage = () => {
  const { isAuthenticated, user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [storeForm, setStoreForm] = useState({ name: '', email: '', password: '', storeName: '', storeDescription: '', sellerPhone: '', sellerAddress: '' });
  const [storeLogo, setStoreLogo] = useState(null);
  const [editingStoreDetails, setEditingStoreDetails] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', category: 'T-Shirts', price: '', stock: 20, videoUrl: '',
  });

  const isSeller = user?.role === 'seller';
  const sellerStatus = user?.sellerStatus || 'not_applied';

  const loadProducts = async () => {
    if (!isSeller) return;
    try {
      const res = await api.get('/products?limit=100');
      setProducts((res.data.data?.products || []).filter((product) =>
        product.createdBy?.toString() === user?._id?.toString()
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load seller products');
    }
  };

  useEffect(() => {
    loadProducts();
  }, [isSeller, user?._id]);

  useEffect(() => {
    if (!isSeller) return;
    api.get('/orders/seller/orders')
      .then((res) => setOrders(res.data.data || []))
      .catch(() => setOrders([]));
  }, [isSeller]);

  useEffect(() => {
    if (!user) return;
    setStoreForm((current) => ({
      ...current,
      name: user.name || current.name,
      email: user.email || current.email,
      storeName: user.storeName || current.storeName,
      storeDescription: user.storeDescription || current.storeDescription,
      sellerPhone: user.sellerPhone || current.sellerPhone,
      sellerAddress: user.sellerAddress || current.sellerAddress,
    }));
  }, [user]);

  const applySeller = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const data = new FormData();
      Object.entries(storeForm).forEach(([key, value]) => data.append(key, value));
      if (storeLogo) data.append('logo', storeLogo);
      const res = await api.post('/auth/seller/apply', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      const seller = res.data.data;
      localStorage.setItem('sss_token', seller.token);
      localStorage.setItem('sss_user', JSON.stringify(seller));
      updateUser(seller);
      setEditingStoreDetails(false);
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit seller details');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-black">Become a Seller</h1>
        <p className="mt-2 text-sm text-neutral-500">Details submit karte hi seller dashboard aur upload options open ho jayenge.</p>
        {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {message && <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}
        <form onSubmit={applySeller} className="mt-6 grid gap-4 rounded-3xl border border-neutral-200 p-5 md:grid-cols-2">
          <input required value={storeForm.name} onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })} placeholder="Full name" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm" />
          <input required type="email" value={storeForm.email} onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })} placeholder="Email address" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm" />
          <input required type="password" minLength="8" value={storeForm.password} onChange={(e) => setStoreForm({ ...storeForm, password: e.target.value })} placeholder="Create password" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm md:col-span-2" />
          <input required value={storeForm.storeName} onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })} placeholder="Store name" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm" />
          <input required value={storeForm.sellerPhone} onChange={(e) => setStoreForm({ ...storeForm, sellerPhone: e.target.value })} placeholder="Phone number" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm" />
          <textarea required value={storeForm.storeDescription} onChange={(e) => setStoreForm({ ...storeForm, storeDescription: e.target.value })} placeholder="Store description" className="min-h-24 rounded-xl bg-neutral-100 px-4 py-3 text-sm md:col-span-2" />
          <textarea required value={storeForm.sellerAddress} onChange={(e) => setStoreForm({ ...storeForm, sellerAddress: e.target.value })} placeholder="Business address" className="min-h-24 rounded-xl bg-neutral-100 px-4 py-3 text-sm md:col-span-2" />
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setStoreLogo(e.target.files?.[0] || null)} className="text-sm md:col-span-2" />
          <button className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white md:col-span-2">Create Seller Account & Continue</button>
        </form>
      </div>
    );
  }

  if (!isSeller) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-black">Complete Seller Details</h1>
        <p className="mt-2 text-sm text-neutral-500">Store details submit karne ke baad product aur video upload unlock ho jayega.</p>
        {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {message && <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}
        <form onSubmit={applySeller} className="mt-6 grid gap-4 rounded-3xl border border-neutral-200 p-5">
          <input required value={storeForm.storeName} onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })} placeholder="Store name" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm" />
          <textarea required value={storeForm.storeDescription} onChange={(e) => setStoreForm({ ...storeForm, storeDescription: e.target.value })} placeholder="Store description" className="min-h-24 rounded-xl bg-neutral-100 px-4 py-3 text-sm" />
          <input required value={storeForm.sellerPhone} onChange={(e) => setStoreForm({ ...storeForm, sellerPhone: e.target.value })} placeholder="Phone number" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm" />
          <textarea required value={storeForm.sellerAddress} onChange={(e) => setStoreForm({ ...storeForm, sellerAddress: e.target.value })} placeholder="Business address" className="min-h-24 rounded-xl bg-neutral-100 px-4 py-3 text-sm" />
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setStoreLogo(e.target.files?.[0] || null)} className="text-sm" />
          <button className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white">Save Store Details & Unlock Upload</button>
        </form>
      </div>
    );
  }

  if (sellerStatus !== 'approved') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-black">Complete Seller Details</h1>
        <p className="mt-2 text-sm text-neutral-500">Upload products only after these details are submitted.</p>
        {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {message && <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}
        <form onSubmit={applySeller} className="mt-6 grid gap-4 rounded-3xl border border-neutral-200 p-5">
          <input required value={storeForm.storeName} onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })} placeholder="Store name" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm" />
          <textarea required value={storeForm.storeDescription} onChange={(e) => setStoreForm({ ...storeForm, storeDescription: e.target.value })} placeholder="Store description" className="min-h-24 rounded-xl bg-neutral-100 px-4 py-3 text-sm" />
          <input required value={storeForm.sellerPhone} onChange={(e) => setStoreForm({ ...storeForm, sellerPhone: e.target.value })} placeholder="Phone number" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm" />
          <textarea required value={storeForm.sellerAddress} onChange={(e) => setStoreForm({ ...storeForm, sellerAddress: e.target.value })} placeholder="Business address" className="min-h-24 rounded-xl bg-neutral-100 px-4 py-3 text-sm" />
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setStoreLogo(e.target.files?.[0] || null)} className="text-sm" />
          <button className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white">Save Store Details</button>
        </form>
      </div>
    );
  }

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submitProduct = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      if (!imageFiles.length) throw new Error('Please select at least one product image');
      const uploadData = new FormData();
      imageFiles.forEach((file) => uploadData.append('images', file));
      const upload = await api.post('/products/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        images: upload.data.data,
      };
      await api.post('/products', payload);
      sessionStorage.removeItem('new_arrivals_cache');
      setMessage('Product published successfully');
      setForm({ title: '', description: '', category: 'T-Shirts', price: '', stock: 20, videoUrl: '' });
      setImageFiles([]);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to publish product');
    }
  };

  const submitVideo = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      if (!videoFile) throw new Error('Please select a video file');
      const data = new FormData();
      data.append('title', form.title);
      data.append('description', form.description);
      data.append('tags', form.category);
      data.append('video', videoFile);
      await api.post('/videos/seller/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Video published successfully');
      setVideoFile(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to publish video');
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Delete this product? It will also disappear from New Arrivals.')) return;
    try {
      await api.delete(`/products/${productId}`);
      sessionStorage.removeItem('new_arrivals_cache');
      setProducts((current) => current.filter((product) => product._id !== productId));
      setMessage('Product deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete product');
    }
  };

  const updateStock = async (productId, stock) => {
    try {
      await api.put(`/products/${productId}`, { stock: Math.max(0, Number(stock)) });
      setProducts((current) => current.map((product) =>
        product._id === productId ? { ...product, stock: Number(stock) } : product
      ));
      setMessage('Stock updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update stock');
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-black">Seller Dashboard</h1>
      {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {message && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}
      <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Store Details</h2>
            <p className="mt-1 text-xs text-neutral-500">Saved seller information</p>
          </div>
          <button
            type="button"
            onClick={() => setEditingStoreDetails((editing) => !editing)}
            className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-black hover:border-black"
          >
            {editingStoreDetails ? 'Cancel' : 'Edit Details'}
          </button>
        </div>
        {editingStoreDetails ? (
          <form onSubmit={applySeller} className="mt-5 grid gap-4 md:grid-cols-2">
            <input required value={storeForm.storeName} onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })} placeholder="Store name" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm" />
            <input required value={storeForm.sellerPhone} onChange={(e) => setStoreForm({ ...storeForm, sellerPhone: e.target.value })} placeholder="Phone number" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm" />
            <textarea required value={storeForm.storeDescription} onChange={(e) => setStoreForm({ ...storeForm, storeDescription: e.target.value })} placeholder="Store description" className="min-h-24 rounded-xl bg-neutral-100 px-4 py-3 text-sm md:col-span-2" />
            <textarea required value={storeForm.sellerAddress} onChange={(e) => setStoreForm({ ...storeForm, sellerAddress: e.target.value })} placeholder="Business address" className="min-h-24 rounded-xl bg-neutral-100 px-4 py-3 text-sm md:col-span-2" />
            <label className="text-xs font-black text-neutral-700 md:col-span-2">
              Store logo
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setStoreLogo(e.target.files?.[0] || null)} className="mt-2" />
            </label>
            <button className="rounded-full bg-black px-5 py-3 text-sm font-black text-white md:col-span-2">Save Store Details</button>
          </form>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {user.storeLogo && <img src={user.storeLogo} alt={user.storeName || 'Store'} className="h-20 w-20 rounded-2xl object-cover border border-neutral-200" />}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Store</p>
              <p className="mt-1 font-black">{user.storeName || 'Not set'}</p>
              <p className="mt-1 text-sm text-neutral-600">{user.storeDescription || 'No description'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Phone</p>
              <p className="mt-1 font-bold">{user.sellerPhone || 'Not set'}</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-neutral-400">Address</p>
              <p className="mt-1 text-sm text-neutral-600">{user.sellerAddress || 'Not set'}</p>
            </div>
          </div>
        )}
      </section>
      <form onSubmit={submitProduct} className="mt-6 grid gap-4 rounded-3xl border border-neutral-200 p-5 md:grid-cols-2">
        <input name="title" value={form.title} onChange={updateField} required placeholder="Product title" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm" />
        <select name="category" value={form.category} onChange={updateField} className="rounded-xl bg-neutral-100 px-4 py-3 text-sm">
          {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
        </select>
        <input name="price" value={form.price} onChange={updateField} required type="number" min="0" placeholder="Price (INR)" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm" />
        <input name="stock" value={form.stock} onChange={updateField} required type="number" min="0" placeholder="Stock quantity" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm" />
        <textarea name="description" value={form.description} onChange={updateField} required placeholder="Product description" className="min-h-28 rounded-xl bg-neutral-100 px-4 py-3 text-sm md:col-span-2" />
        <label className="text-xs font-black text-neutral-700 md:col-span-2">
          Product images
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple required onChange={(event) => setImageFiles([...event.target.files])} className="mt-2 text-sm" />
        </label>
        <button className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white md:col-span-2">Publish Product</button>
      </form>
      <form onSubmit={submitVideo} className="mt-6 grid gap-4 rounded-3xl border border-neutral-200 p-5 md:grid-cols-2">
        <h2 className="text-xl font-black md:col-span-2">Upload Product Video</h2>
        <input name="title" value={form.title} onChange={updateField} required placeholder="Video title" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm" />
        <select name="category" value={form.category} onChange={updateField} className="rounded-xl bg-neutral-100 px-4 py-3 text-sm">
          {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
        </select>
        <textarea name="description" value={form.description} onChange={updateField} required placeholder="Video description" className="min-h-28 rounded-xl bg-neutral-100 px-4 py-3 text-sm md:col-span-2" />
        <label className="text-xs font-black text-neutral-700 md:col-span-2">
          Product video
          <input type="file" accept="video/mp4,video/webm" required onChange={(event) => setVideoFile(event.target.files?.[0] || null)} className="mt-2 text-sm" />
        </label>
        <button className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white md:col-span-2">Publish Video</button>
      </form>
      <div className="mt-8">
        <h2 className="text-xl font-black">My Products</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {products.map((product) => (
            <div key={product._id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              {product.images?.[0] && (
                <img src={product.images[0]} alt={product.title} className="h-44 w-full object-cover" />
              )}
              <div className="p-4">
                <p className="font-bold">{product.title}</p>
                <p className="mt-1 text-sm text-neutral-500">₹{product.price}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-neutral-100 p-2">
                    <span className="block text-neutral-400">Orders/Sold</span>
                    <strong>{product.soldCount || 0}</strong>
                  </div>
                  <div className="rounded-xl bg-neutral-100 p-2">
                    <span className="block text-neutral-400">Views</span>
                    <strong>{product.views || 0}</strong>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <label className="flex-1 text-xs font-bold text-neutral-500">
                    Stock
                    <input
                      type="number"
                      min="0"
                      defaultValue={product.stock}
                      onBlur={(event) => updateStock(product._id, event.target.value)}
                      className="mt-1 w-full rounded-xl bg-neutral-100 px-3 py-2 text-sm text-neutral-900"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => deleteProduct(product._id)}
                    className="mt-5 rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-black">Orders for My Products</h2>
        {orders.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-neutral-300 p-6 text-sm text-neutral-500">No orders yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {orders.map((order) => (
              <div key={order._id} className="rounded-2xl border border-neutral-200 p-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <strong className="text-sm">Order #{order._id.slice(-8).toUpperCase()}</strong>
                  <span className="text-xs font-bold text-neutral-500">{order.orderStatus}</span>
                </div>
                <div className="mt-2 text-xs text-neutral-600">
                  {order.orderItems.map((item) => (
                    <p key={item._id}>
                      {item.title} × {item.quantity} — ₹{item.price * item.quantity}
                    </p>
                  ))}
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  Customer: {order.user?.name || 'Customer'} · {order.user?.email || ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerPage;
