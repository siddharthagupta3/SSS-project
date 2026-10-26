import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { CheckIcon, ShoppingBagIcon } from '../components/common/Icons';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load confirmed order:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
        <CheckIcon className="w-10 h-10" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900">
        Order Confirmed!
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        Thank you for your purchase. We have received your payment via Razorpay.
      </p>

      {loading ? (
        <div className="mt-8 h-32 bg-neutral-100 rounded-2xl animate-pulse" />
      ) : order ? (
        <div className="mt-8 text-left bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-neutral-100 gap-2">
            <div>
              <span className="text-xs text-neutral-400 uppercase font-semibold">Order Reference</span>
              <p className="font-mono font-bold text-sm text-neutral-800">#{order._id}</p>
            </div>
            <div>
              <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                Payment Verified • {order.paymentMethod}
              </span>
            </div>
          </div>

          {/* Delivery destination */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Shipping To</h3>
            <p className="text-sm font-semibold text-neutral-800">{order.shippingAddress?.fullName}</p>
            <p className="text-xs text-neutral-600">
              {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
            </p>
            <p className="text-xs text-neutral-600">Phone: {order.shippingAddress?.phone}</p>
          </div>

          {/* Items Preview */}
          <div className="border-t border-neutral-100 pt-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Items Ordered</h3>
            {order.orderItems?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt="" className="w-10 h-12 object-cover rounded-md" />
                  <div>
                    <span className="font-semibold text-neutral-900">{item.title}</span>
                    <span className="text-neutral-500 block">Qty: {item.quantity} | Size: {item.size}</span>
                  </div>
                </div>
                <span className="font-bold text-neutral-900">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-100 pt-4 flex justify-between font-black text-base text-neutral-900">
            <span>Amount Paid</span>
            <span>₹{order.totalPrice?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <Link
          to="/my-orders"
          className="bg-black text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-neutral-800 transition"
        >
          View My Orders
        </Link>
        <Link
          to="/shop"
          className="border border-neutral-300 text-neutral-800 px-8 py-3 rounded-full text-sm font-semibold hover:bg-neutral-100 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
