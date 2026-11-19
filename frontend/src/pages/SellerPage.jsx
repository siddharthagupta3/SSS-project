import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['T-Shirts', 'Shirts', 'Jeans', 'Pants', 'Cargo Pants', 'Jackets', 'Hoodies', 'Shoes', 'Watches', 'Accessories', 'Groceries'];

const SellerPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', category: 'T-Shirts', price: '', stock: 20,
  });

  const loadProducts = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/products?limit=100');
      setProducts((res.data.data?.products || []).filter((product) =>
        product.createdBy?.toString() === user?._id?.toString()
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load products');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadProducts();
    api.get('/orders/seller/orders')
      .then((res) => setOrders(res.data.data || []))
      .catch(() => setOrders([]));
  }, [isAuthenticated, user?._id]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-4xl font-black">Seller Dashboard</h1>
        <p className="mt-4 text-neutral-600">Upload products and videos after signing in.</p>
        <button
          onClick={() => navigate('/login', { state: { from: { pathname: '/sellers' } } })}
          className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-black text-white"
        >
          Sign In to Upload
        </button>
      </div>
    );
  }

  const updateField = (event) => setForm((current) => ({
    ...current,
    [event.target.name]: event.target.value,
  }));

  const submitProduct = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      if (!imageFiles.length) throw new Error('Select at least one product image');
      const uploadData = new FormData();
      imageFiles.forEach((file) => uploadData.append('images', file));
      const upload = await api.post('/products/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await api.post('/products', {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        images: upload.data.data,
      });
      sessionStorage.removeItem('new_arrivals_cache');
      setMessage('Product uploaded and published publicly');
      setForm({ title: '', description: '', category: 'T-Shirts', price: '', stock: 20 });
      setImageFiles([]);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to upload product');
    }
  };

  const submitVideo = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      if (!videoFile) throw new Error('Select a product video');
      const data = new FormData();
      data.append('title', form.title);
      data.append('description', form.description);
      data.append('tags', form.category);
      data.append('video', videoFile);
      await api.post('/videos/seller/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Video uploaded and published publicly');
      setVideoFile(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to upload video');
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Delete this product publicly?')) return;
    try {
      await api.delete(`/products/${productId}`);
      sessionStorage.removeItem('new_arrivals_cache');
      setProducts((current) => current.filter((item) => item._id !== productId));
      setMessage('Product deleted');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete product');
    }
  };

  const updateStock = async (productId, stock) => {
    try {
      await api.put(`/products/${productId}`, { stock: Math.max(0, Number(stock)) });
      setProducts((current) => current.map((item) =>
        item._id === productId ? { ...item, stock: Number(stock) } : item
      ));
      setMessage('Stock updated');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update stock');
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-black">Seller Dashboard</h1>
      {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {message && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}

      <form onSubmit={submitProduct} className="mt-6 grid gap-4 rounded-3xl border border-neutral-200 p-5 md:grid-cols-2">
        <h2 className="text-xl font-black md:col-span-2">Upload Product</h2>
        <input name="title" value={form.title} onChange={updateField} required placeholder="Product title" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm" />
        <select name="category" value={form.category} onChange={updateField} className="rounded-xl bg-neutral-100 px-4 py-3 text-sm">
          {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
        </select>
        <input name="price" value={form.price} onChange={updateField} required type="number" min="0" placeholder="Price (INR)" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm" />
        <input name="stock" value={form.stock} onChange={updateField} required type="number" min="0" placeholder="Stock quantity" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm" />
        <textarea name="description" value={form.description} onChange={updateField} required placeholder="Full product description" className="min-h-28 rounded-xl bg-neutral-100 px-4 py-3 text-sm md:col-span-2" />
        <label className="text-xs font-black text-neutral-700 md:col-span-2">
          Product images
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple required onChange={(event) => setImageFiles([...event.target.files])} className="mt-2" />
        </label>
        <button className="rounded-full bg-black px-5 py-3 text-sm font-black text-white md:col-span-2">Publish Product Publicly</button>
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
          <input type="file" accept="video/mp4,video/webm" required onChange={(event) => setVideoFile(event.target.files?.[0] || null)} className="mt-2" />
        </label>
        <button className="rounded-full bg-black px-5 py-3 text-sm font-black text-white md:col-span-2">Publish Video Publicly</button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-black">My Products</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {products.map((product) => (
            <div key={product._id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              {product.images?.[0] && <img src={product.images[0]} alt={product.title} className="h-44 w-full object-cover" />}
              <div className="p-4">
                <p className="font-bold">{product.title}</p>
                <p className="mt-1 text-sm text-neutral-500">₹{product.price}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-neutral-100 p-2"><span className="block text-neutral-400">Sold</span><strong>{product.soldCount || 0}</strong></div>
                  <div className="rounded-xl bg-neutral-100 p-2"><span className="block text-neutral-400">Views</span><strong>{product.views || 0}</strong></div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <label className="flex-1 text-xs font-bold text-neutral-500">
                    Stock
                    <input type="number" min="0" defaultValue={product.stock} onBlur={(event) => updateStock(product._id, event.target.value)} className="mt-1 w-full rounded-xl bg-neutral-100 px-3 py-2 text-sm" />
                  </label>
                  <button type="button" onClick={() => deleteProduct(product._id)} className="mt-5 rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600">Delete</button>
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
                <div className="flex justify-between"><strong>#{order._id.slice(-8).toUpperCase()}</strong><span className="text-xs">{order.orderStatus}</span></div>
                {order.orderItems.map((item) => <p key={item._id} className="mt-2 text-xs">{item.title} × {item.quantity}</p>)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerPage;
