import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/client';
import {
  PlusIcon,
  TrashIcon,
  CloseIcon,
  CheckIcon,
} from '../../components/common/Icons';

const CATEGORIES = [
  'T-Shirts',
  'Shirts',
  'Jeans',
  'Pants',
  'Cargo Pants',
  'Jackets',
  'Hoodies',
  'Shoes',
  'Watches',
  'Accessories',
  'Groceries',
];

const AdminDashboard = () => {
  const location = useLocation();
  const initialTab = location.pathname.includes('/admin/orders')
    ? 'orders'
    : location.pathname.includes('/admin/users')
      ? 'users'
      : location.pathname.includes('/admin/videos')
        ? 'videos'
        : 'products';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [videoForm, setVideoForm] = useState({ title: '', description: '', tags: '', youtubeUrl: '', thumbnailUrl: '', relatedProduct: '' });
  const [videoFile, setVideoFile] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [productFilter, setProductFilter] = useState('All');

  // Modal State for Product Create / Edit
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    discountPrice: '',
    category: 'T-Shirts',
    brand: 'SHOP.CO',
    stock: 20,
    imageUrl: '',
    imageUrl2: '',
    imageUrl3: '',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Navy'],
    rating: 4.5,
    isFeatured: false,
    isNewArrival: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes, userRes, videoRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/orders'),
        api.get('/auth/admin/users'),
        api.get('/videos/admin/all'),
      ]);

      if (prodRes.data.success) {
        setProducts(prodRes.data.data?.products || []);
      }
      if (orderRes.data.success) {
        setOrders(orderRes.data.data || []);
      }
      if (userRes.data.success) {
        setUsers(userRes.data.data || []);
      }
      if (videoRes.data.success) {
        setVideos(videoRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setImageFiles([]);
    setImagePreviews([]);
    setProductForm({
      title: '',
      description: '',
      price: '',
      discountPrice: '',
      category: 'T-Shirts',
      brand: 'SHOP.CO',
      stock: 20,
      imageUrl: '',
      imageUrl2: '',
      imageUrl3: '',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White', 'Navy'],
      rating: 4.5,
      isFeatured: false,
      isNewArrival: false,
    });
    setShowProductModal(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setImageFiles([]);
    setImagePreviews(product.images || []);
    setProductForm({
      title: product.title,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || '',
      category: product.category,
      brand: product.brand || 'SHOP.CO',
      stock: product.stock,
      imageUrl: product.images?.[0] || '',
      imageUrl2: product.images?.[1] || '',
      imageUrl3: product.images?.[2] || '',
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      colors: product.colors || ['Black', 'White', 'Navy'],
      rating: product.rating || 4.5,
      isFeatured: Boolean(product.isFeatured),
      isNewArrival: Boolean(product.isNewArrival),
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      let uploadedImages = [];
      if (imageFiles.length > 0) {
        const uploadForm = new FormData();
        imageFiles.forEach((file) => uploadForm.append('images', file));
        const uploadRes = await api.post('/products/upload', uploadForm, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedImages = uploadRes.data.data || [];
      }

      const images = [...uploadedImages];
      if (productForm.imageUrl) images.push(productForm.imageUrl);
      if (productForm.imageUrl2) images.push(productForm.imageUrl2);
      if (productForm.imageUrl3) images.push(productForm.imageUrl3);
      if (images.length === 0 && editingProduct) {
        images.push(...(editingProduct.images || []));
      }

      const payload = {
        title: productForm.title,
        description: productForm.description,
        price: Number(productForm.price),
        discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : 0,
        category: productForm.category,
        brand: productForm.brand,
        stock: Number(productForm.stock),
        images: images,
        sizes: productForm.sizes,
        colors: productForm.colors,
        rating: Number(productForm.rating),
        isFeatured: productForm.isFeatured,
        isNewArrival: productForm.isNewArrival,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      setShowProductModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error saving product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting product');
      }
    }
  };

  const handleDeleteAllDemoProducts = async () => {
    if (window.confirm('Are you sure you want to delete ALL demo products? This cannot be undone.')) {
      try {
        await api.delete('/products/demo/all');
        fetchData();
        alert('All demo products deleted successfully');
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting demo products');
      }
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating order status');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await api.put(`/auth/admin/users/${userId}/role`, { role });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error changing user role');
    }
  };

  const openVideoModal = (video = null) => {
    setEditingVideo(video);
    setVideoFile(null);
    setVideoForm({
      title: video?.title || '',
      description: video?.description || '',
      tags: (video?.tags || []).join(', '),
      youtubeUrl: video?.videoUrl?.includes('youtube') ? video.videoUrl : '',
      thumbnailUrl: video?.thumbnailUrl || '',
      relatedProduct: video?.relatedProduct?._id || '',
    });
    setShowVideoModal(true);
  };

  const saveVideo = async (event) => {
    event.preventDefault();
    try {
      if (editingVideo) {
        await api.put(`/videos/${editingVideo._id}`, videoForm);
      } else {
        const form = new FormData();
        Object.entries(videoForm).forEach(([key, value]) => form.append(key, value || ''));
        if (videoFile) form.append('video', videoFile);
        await api.post('/videos', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setShowVideoModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to save video');
    }
  };

  const deleteVideo = async (videoId) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      await api.delete(`/videos/${videoId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to delete video');
    }
  };

  // Metrics
  const totalRevenue = orders
    .filter((o) => o.isPaid)
    .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(productSearch.toLowerCase());
    const matchesFilter = productFilter === 'All'
      || (productFilter === 'Real' && !product.isDummy)
      || (productFilter === 'Demo' && product.isDummy);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-6 border-b border-neutral-200 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Admin Control Center</span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 mt-0.5">
            Store Management
          </h1>
        </div>

        {activeTab === 'products' && (
          <div className="flex gap-3">
            <button
              onClick={handleDeleteAllDemoProducts}
              className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-red-700 transition"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Delete All Demo</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-neutral-800 transition"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        )}
        {activeTab === 'videos' && (
          <button
            onClick={() => openVideoModal()}
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-xs font-semibold"
          >
            <PlusIcon className="w-4 h-4" />
            Add Video
          </button>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 my-8">
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-neutral-400 font-semibold uppercase">Total Revenue</span>
          <p className="text-2xl font-black text-neutral-900 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-neutral-400 font-semibold uppercase">Total Orders</span>
          <p className="text-2xl font-black text-neutral-900 mt-1">{orders.length}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-neutral-400 font-semibold uppercase">Total Products</span>
          <p className="text-2xl font-black text-neutral-900 mt-1">{products.length}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-neutral-400 font-semibold uppercase">Paid Orders</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {orders.filter((o) => o.isPaid).length}
          </p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-neutral-400 font-semibold uppercase">Users</span>
          <p className="text-2xl font-black text-neutral-900 mt-1">{users.length}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-neutral-400 font-semibold uppercase">Real / Demo</span>
          <p className="text-lg font-black text-neutral-900 mt-1">{products.filter((p) => !p.isDummy).length} / {products.filter((p) => p.isDummy).length}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-neutral-400 font-semibold uppercase">Low Stock</span>
          <p className="text-2xl font-black text-red-600 mt-1">{products.filter((p) => p.stock < 5).length}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-200 space-x-8 text-sm font-bold">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'products' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-black'
          }`}
        >
          Catalog Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'orders' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-black'
          }`}
        >
          Customer Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'users' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-black'
          }`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'videos' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-black'
          }`}
        >
          Videos ({videos.length})
        </button>
      </div>

      {/* Tab 1: Products Table */}
      {activeTab === 'products' && (
        <div className="mt-6 bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="flex flex-col sm:flex-row gap-3 justify-between p-4 border-b">
            <input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products..."
              className="bg-neutral-100 px-4 py-2 rounded-lg text-sm sm:w-72"
            />
            <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="bg-neutral-100 px-4 py-2 rounded-lg text-sm">
              <option value="All">All Products</option>
              <option value="Real">Real</option>
              <option value="Demo">Demo</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-xs uppercase text-neutral-400 font-semibold border-b">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Sold</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'}
                        alt=""
                        className="w-10 h-12 rounded-lg object-cover bg-neutral-100 shrink-0"
                      />
                      <div>
                        <span className="font-semibold text-neutral-900 block line-clamp-1">{p.title}</span>
                        <span className="text-xs text-neutral-400">{p.brand}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {p.category}
                      <span className={`ml-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${p.isDummy ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {p.isDummy ? 'Demo' : 'Real'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-neutral-900">
                      ₹{p.price.toLocaleString('en-IN')}
                      {p.discountPrice > 0 && (
                        <span className="text-xs text-emerald-600 block">Sale: ₹{p.discountPrice}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${p.stock <= 5 ? 'text-red-500' : 'text-neutral-700'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{p.soldCount || 0}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="text-xs text-neutral-700 hover:text-black font-semibold px-2 py-1 bg-neutral-100 rounded-md"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p._id)}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1 bg-red-50 rounded-md"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Orders Table */}
      {activeTab === 'orders' && (
        <div className="mt-6 bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-xs uppercase text-neutral-400 font-semibold border-b">
                <tr>
                  <th className="px-6 py-4">Order ID & Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Total & Items</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-neutral-900 block">#{o._id.slice(-8)}</span>
                      <span className="text-xs text-neutral-400">
                        {new Date(o.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-neutral-900 block">{o.shippingAddress?.fullName || o.user?.name}</span>
                      <span className="text-xs text-neutral-400">{o.shippingAddress?.city}, {o.shippingAddress?.phone}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-neutral-900">₹{o.totalPrice?.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-neutral-400 block">{o.orderItems?.length} item(s)</span>
                    </td>
                    <td className="px-6 py-4">
                      {o.isPaid ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          <CheckIcon className="w-3 h-3" />
                          <span>Paid</span>
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => handleStatusChange(o._id, e.target.value)}
                        className="bg-neutral-100 border border-neutral-300 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="mt-6 bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-xs uppercase text-neutral-400 font-semibold border-b">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Verified</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map((listedUser) => (
                  <tr key={listedUser._id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 font-semibold text-neutral-900">{listedUser.name}</td>
                    <td className="px-6 py-4">{listedUser.email}</td>
                    <td className="px-6 py-4">{listedUser.isEmailVerified ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4">{new Date(listedUser.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <select
                        value={listedUser.role}
                        onChange={(e) => handleRoleChange(listedUser._id, e.target.value)}
                        className="bg-neutral-100 border border-neutral-300 text-xs font-semibold rounded-lg px-3 py-2"
                      >
                        <option value="user">User</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm text-neutral-600">
            <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-400">
              <tr>
                <th className="px-6 py-4">Video</th>
                <th className="px-6 py-4">Tags</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {videos.map((video) => (
                <tr key={video._id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt="" className="h-14 w-20 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-neutral-100">▶</div>
                      )}
                      <div>
                        <p className="font-bold text-neutral-900">{video.title}</p>
                        <p className="max-w-xs truncate text-xs text-neutral-400">{video.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{video.tags?.join(', ') || '-'}</td>
                  <td className="px-6 py-4">{/youtube\.com|youtu\.be/i.test(video.videoUrl) ? 'YouTube' : 'Cloudinary'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openVideoModal(video)} className="mr-2 rounded-md bg-neutral-100 px-2 py-1 text-xs font-bold">Edit</button>
                    <button onClick={() => deleteVideo(video._id)} className="rounded-md bg-red-50 px-2 py-1 text-xs font-bold text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {videos.length === 0 && <p className="py-12 text-center text-sm text-neutral-500">No videos added yet.</p>}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowProductModal(false)}>
                <CloseIcon className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g. Classic Heavyweight Tee"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Description *</label>
                <textarea
                  required
                  rows="3"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-black"
                  placeholder="Material details, fit, and aesthetic..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-black"
                    placeholder="1499"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.discountPrice}
                    onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                    className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-black"
                    placeholder="999 (optional)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-black"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-black"
                    placeholder="SHOP.CO"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Stock Quantity *</label>
                <input
                  type="number"
                  required
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2">Product Images (jpg/png/webp, max 5MB each)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []).slice(0, 5);
                    setImageFiles(files);
                    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
                  }}
                  className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-xl"
                />
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-3">
                    {imagePreviews.map((preview, index) => (
                      <img key={index} src={preview} alt={`Preview ${index + 1}`} className="w-full aspect-square object-cover rounded-lg border" />
                    ))}
                  </div>
                )}

                {showVideoModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
                      <div className="mb-5 flex items-center justify-between border-b pb-4">
                        <h2 className="text-xl font-black uppercase">{editingVideo ? 'Edit Video' : 'Add Video'}</h2>
                        <button onClick={() => setShowVideoModal(false)} aria-label="Close"><CloseIcon className="h-5 w-5" /></button>
                      </div>
                      <form onSubmit={saveVideo} className="space-y-4">
                        <div>
                          <label className="mb-1 block text-xs font-bold">Title *</label>
                          <input required value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} className="w-full rounded-xl bg-neutral-100 px-4 py-2.5 text-sm" />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold">Description</label>
                          <textarea rows="3" value={videoForm.description} onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })} className="w-full rounded-xl bg-neutral-100 px-4 py-2.5 text-sm" />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold">Tags (comma separated)</label>
                          <input value={videoForm.tags} onChange={(e) => setVideoForm({ ...videoForm, tags: e.target.value })} className="w-full rounded-xl bg-neutral-100 px-4 py-2.5 text-sm" placeholder="fashion, style, watch" />
                        </div>
                        {!editingVideo && (
                          <>
                            <div>
                              <label className="mb-1 block text-xs font-bold">Cloudinary Video (MP4/WebM, max 100MB)</label>
                              <input type="file" accept="video/mp4,video/webm" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="w-full rounded-xl bg-neutral-100 px-4 py-2.5 text-sm" />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-bold">OR YouTube Link</label>
                              <input type="url" value={videoForm.youtubeUrl} onChange={(e) => setVideoForm({ ...videoForm, youtubeUrl: e.target.value })} className="w-full rounded-xl bg-neutral-100 px-4 py-2.5 text-sm" placeholder="https://youtube.com/watch?v=..." />
                            </div>
                          </>
                        )}
                        <div>
                          <label className="mb-1 block text-xs font-bold">Thumbnail URL</label>
                          <input type="url" value={videoForm.thumbnailUrl} onChange={(e) => setVideoForm({ ...videoForm, thumbnailUrl: e.target.value })} className="w-full rounded-xl bg-neutral-100 px-4 py-2.5 text-sm" />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold">Related Product</label>
                          <select value={videoForm.relatedProduct} onChange={(e) => setVideoForm({ ...videoForm, relatedProduct: e.target.value })} className="w-full rounded-xl bg-neutral-100 px-4 py-2.5 text-sm">
                            <option value="">None</option>
                            {products.map((product) => <option key={product._id} value={product._id}>{product.title}</option>)}
                          </select>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                          <button type="button" onClick={() => setShowVideoModal(false)} className="rounded-full border px-5 py-2.5 text-xs font-bold">Cancel</button>
                          <button type="submit" className="rounded-full bg-black px-5 py-2.5 text-xs font-bold text-white">{editingVideo ? 'Save Changes' : 'Add Video'}</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Primary Image URL (Optional)</label>
                <input
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-black"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Secondary Image URL (Optional)</label>
                <input
                  type="url"
                  value={productForm.imageUrl2}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl2: e.target.value })}
                  className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-black"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Third Image URL (Optional)</label>
                <input
                  type="url"
                  value={productForm.imageUrl3}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl3: e.target.value })}
                  className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-black"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Sizes (comma-separated)</label>
                <input
                  type="text"
                  value={productForm.sizes.join(', ')}
                  onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-black"
                  placeholder="S, M, L, XL"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Colors (comma-separated)</label>
                <input
                  type="text"
                  value={productForm.colors.join(', ')}
                  onChange={(e) => setProductForm({ ...productForm, colors: e.target.value.split(',').map(c => c.trim()).filter(Boolean) })}
                  className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-black"
                  placeholder="Black, White, Navy"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Rating (0-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={productForm.rating}
                  onChange={(e) => setProductForm({ ...productForm, rating: e.target.value })}
                  className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-black"
                  placeholder="4.5"
                />
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    className="rounded accent-black"
                  />
                  <span>Featured Product</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isNewArrival}
                    onChange={(e) => setProductForm({ ...productForm, isNewArrival: e.target.checked })}
                    className="rounded accent-black"
                  />
                  <span>New Arrival</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full text-xs font-semibold bg-black text-white hover:bg-neutral-800"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
