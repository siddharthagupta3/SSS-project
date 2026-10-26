import React, { useState, useEffect } from 'react';
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
  'Cargo Pants',
  'Jackets',
  'Hoodies',
  'Shoes',
  'Watches',
  'Accessories',
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Product Create / Edit
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    discountPrice: '',
    category: 'T-Shirts',
    brand: 'SHOP.CO',
    stock: 20,
    imageUrl: '',
    isFeatured: false,
    isNewArrival: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes] = await Promise.all([
        api.get('/api/products?limit=100'),
        api.get('/api/orders'),
      ]);

      if (prodRes.data.success) {
        setProducts(prodRes.data.data?.products || []);
      }
      if (orderRes.data.success) {
        setOrders(orderRes.data.data || []);
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
    setProductForm({
      title: '',
      description: '',
      price: '',
      discountPrice: '',
      category: 'T-Shirts',
      brand: 'SHOP.CO',
      stock: 20,
      imageUrl: '',
      isFeatured: false,
      isNewArrival: false,
    });
    setShowProductModal(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || '',
      category: product.category,
      brand: product.brand || 'SHOP.CO',
      stock: product.stock,
      imageUrl: product.images?.[0] || '',
      isFeatured: Boolean(product.isFeatured),
      isNewArrival: Boolean(product.isNewArrival),
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: productForm.title,
        description: productForm.description,
        price: Number(productForm.price),
        discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : 0,
        category: productForm.category,
        brand: productForm.brand,
        stock: Number(productForm.stock),
        images: [productForm.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'],
        isFeatured: productForm.isFeatured,
        isNewArrival: productForm.isNewArrival,
      };

      if (editingProduct) {
        await api.put(`/api/products/${editingProduct._id}`, payload);
      } else {
        await api.post('/api/products', payload);
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
        await api.delete(`/api/products/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting product');
      }
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { orderStatus: newStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating order status');
    }
  };

  // Metrics
  const totalRevenue = orders
    .filter((o) => o.isPaid)
    .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

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
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-neutral-800 transition"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
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
      </div>

      {/* Tab 1: Products Table */}
      {activeTab === 'products' && (
        <div className="mt-6 bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-xs uppercase text-neutral-400 font-semibold border-b">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((p) => (
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
                    <td className="px-6 py-4">{p.category}</td>
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

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
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
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Image URL (Unsplash or Cloudinary) *</label>
                <input
                  type="url"
                  required
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full bg-neutral-100 text-sm px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-black"
                  placeholder="https://images.unsplash.com/..."
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
