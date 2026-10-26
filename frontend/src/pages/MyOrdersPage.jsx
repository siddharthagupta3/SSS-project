import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { ShoppingBagIcon } from '../components/common/Icons';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/api/orders/my-orders');
        if (res.data.success) {
          setOrders(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load user orders:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 flex justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 mb-8">
        MY ORDERS ({orders.length})
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
            <ShoppingBagIcon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-neutral-800">You haven't placed any orders yet</h2>
          <p className="text-xs text-neutral-500 mt-2">When you place an order, its details will appear here.</p>
          <Link
            to="/shop"
            className="mt-6 inline-block bg-black text-white px-8 py-3 rounded-full text-xs font-semibold hover:bg-neutral-800"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-neutral-100 gap-3">
                <div>
                  <span className="text-xs text-neutral-400">ORDER PLACED</span>
                  <p className="text-sm font-bold text-neutral-800">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-neutral-400">ORDER ID</span>
                  <p className="text-xs font-mono font-semibold text-neutral-700">#{order._id}</p>
                </div>

                <div>
                  <span className="text-xs text-neutral-400">TOTAL AMOUNT</span>
                  <p className="text-sm font-black text-neutral-900">
                    ₹{order.totalPrice?.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="flex gap-2 items-center">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusBadge(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                  {order.isPaid && (
                    <span className="bg-neutral-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                      Paid
                    </span>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-20 object-cover rounded-xl bg-neutral-100 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-neutral-900">{item.title}</h4>
                        <div className="text-xs text-neutral-500 mt-0.5 flex gap-2">
                          <span>Qty: {item.quantity}</span>
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                      </div>
                    </div>

                    <span className="font-bold text-sm text-neutral-900 shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping info */}
              <div className="border-t border-neutral-100 pt-4 text-xs text-neutral-500 flex flex-col sm:flex-row justify-between gap-2">
                <div>
                  <span className="font-semibold text-neutral-700">Delivering to: </span>
                  {order.shippingAddress?.fullName}, {order.shippingAddress?.city} ({order.shippingAddress?.postalCode})
                </div>
                <div>
                  <span className="font-semibold text-neutral-700">Payment: </span>
                  {order.paymentMethod} • ID: {order.paymentResult?.razorpay_payment_id || 'Verified'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
