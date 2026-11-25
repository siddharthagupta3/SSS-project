import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { ShoppingBagIcon, CheckIcon, TruckIcon } from '../components/common/Icons';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
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

  const getStepActive = (currentStatus, step) => {
    const steps = ['Processing', 'Shipped', 'Delivered'];
    const curIdx = steps.indexOf(currentStatus);
    const targetIdx = steps.indexOf(step);
    if (curIdx === -1) return false;
    return curIdx >= targetIdx;
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
      <div className="flex items-center justify-between pb-6 border-b border-white/15 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">
            My Orders ({orders.length})
          </h1>
          <p className="text-xs text-white/50 mt-1">Track and manage your order deliveries</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="border border-white/10 rounded-3xl p-16 text-center shadow-xs">
          <div className="w-16 h-16 bg-white/8 rounded-full flex items-center justify-center mx-auto mb-4 text-white/40">
            <ShoppingBagIcon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white/90">You haven't placed any orders yet</h2>
          <p className="text-xs text-white/50 mt-2">When you place an order, its details will appear here.</p>
          <Link
            to="/shop"
            className="mt-6 inline-block bg-black text-white px-8 py-3 rounded-full text-xs font-semibold hover:bg-neutral-800 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isConfirmed = true;
            const isPacked = getStepActive(order.orderStatus, 'Processing');
            const isShipped = getStepActive(order.orderStatus, 'Shipped');
            const isDelivered = getStepActive(order.orderStatus, 'Delivered');

            return (
              <div
                key={order._id}
                className="border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs hover:shadow-md transition"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-white/10 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/40">ORDER PLACED</span>
                    <p className="text-xs font-bold text-white/90">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/40">ORDER ID</span>
                    <p className="text-xs font-mono font-semibold text-white/80">#{order._id}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/40">TOTAL</span>
                    <p className="text-sm font-black text-white">
                      ₹{order.totalPrice?.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.isPaid ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckIcon className="w-3 h-3" />
                        <span>Paid via {order.paymentMethod}</span>
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-3 py-1 rounded-full">
                        Payment Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Flipkart Style Order Tracking Timeline */}
                <div className="bg-white/5/70 p-4 sm:p-5 rounded-2xl border border-white/15">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-3 block flex items-center gap-1.5">
                    <TruckIcon className="w-4 h-4 text-white/80" />
                    <span>Live Tracking Status</span>
                  </span>

                  <div className="relative flex items-center justify-between text-xs">
                    {/* Connecting Bar */}
                    <div className="absolute left-6 right-6 top-3 h-1 bg-white/8 z-0" />
                    <div
                      className="absolute left-6 top-3 h-1 bg-emerald-500 z-0 transition-all duration-500"
                      style={{
                        width: isDelivered ? '90%' : isShipped ? '60%' : isPacked ? '30%' : '5%',
                      }}
                    />

                    {/* Step 1: Confirmed */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        ✓
                      </div>
                      <span className="font-bold text-[11px] text-white mt-1.5">Confirmed</span>
                    </div>

                    {/* Step 2: Packed */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                        isPacked ? 'bg-emerald-600 text-white' : 'bg-transparent border-2 border-white/20 text-white/40'
                      }`}>
                        {isPacked ? '✓' : '2'}
                      </div>
                      <span className={`text-[11px] font-semibold mt-1.5 ${isPacked ? 'text-white font-bold' : 'text-white/40'}`}>
                        Packed
                      </span>
                    </div>

                    {/* Step 3: Shipped */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                        isShipped ? 'bg-emerald-600 text-white' : 'bg-transparent border-2 border-white/20 text-white/40'
                      }`}>
                        {isShipped ? '✓' : '3'}
                      </div>
                      <span className={`text-[11px] font-semibold mt-1.5 ${isShipped ? 'text-white font-bold' : 'text-white/40'}`}>
                        Shipped
                      </span>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                        isDelivered ? 'bg-emerald-600 text-white' : 'bg-transparent border-2 border-white/20 text-white/40'
                      }`}>
                        {isDelivered ? '✓' : '4'}
                      </div>
                      <span className={`text-[11px] font-semibold mt-1.5 ${isDelivered ? 'text-emerald-700 font-bold' : 'text-white/40'}`}>
                        Delivered
                      </span>
                    </div>

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
                          className="w-16 h-20 object-cover rounded-xl bg-white/8 shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-white">{item.title}</h4>
                          <div className="text-xs text-white/50 mt-0.5 flex gap-2">
                            <span>Qty: <strong>{item.quantity}</strong></span>
                            {item.size && <span>Size: <strong>{item.size}</strong></span>}
                            {item.color && <span>Color: <strong>{item.color}</strong></span>}
                          </div>
                        </div>
                      </div>

                      <span className="font-bold text-sm text-white shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping Destination */}
                <div className="border-t border-white/10 pt-4 text-xs text-white/50 flex flex-col sm:flex-row justify-between gap-2">
                  <div>
                    <span className="font-semibold text-white/90">Delivering to: </span>
                    {order.shippingAddress?.fullName}, {order.shippingAddress?.street}, {order.shippingAddress?.city} ({order.shippingAddress?.postalCode})
                  </div>
                  <div>
                    <span className="font-semibold text-white/90">Tracking Ref: </span>
                    {order.paymentResult?.razorpay_payment_id || 'EXPRESS_IN'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
