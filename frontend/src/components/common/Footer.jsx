import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-neutral-100 border-t border-neutral-200 mt-20">
      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -translate-y-12">
        <div className="bg-black text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="max-w-md">
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              STAY UP TO DATE ABOUT OUR LATEST OFFERS
            </h3>
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email address"
              className="bg-white text-black text-sm px-5 py-3 rounded-full outline-none w-full sm:w-72"
            />
            <button className="bg-white text-black font-semibold text-sm px-6 py-3 rounded-full hover:bg-neutral-200 transition">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          
          <div className="col-span-2">
            <h4 className="text-2xl font-black uppercase tracking-tighter text-black">SHOP.CO</h4>
            <p className="mt-4 text-sm text-neutral-600 max-w-sm">
              We have clothes that suits your style and which you're proud to wear. From men to women and streetwear enthusiasts.
            </p>
            <div className="mt-4 flex gap-4 text-xs font-semibold text-neutral-500">
              <span>💳 Razorpay Protected</span>
              <span>🔒 256-Bit SSL Encrypted</span>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-black">Company</h5>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              <li><Link to="/shop" className="hover:text-black">About Us</Link></li>
              <li><Link to="/shop" className="hover:text-black">Features</Link></li>
              <li><Link to="/shop" className="hover:text-black">Works</Link></li>
              <li><Link to="/shop" className="hover:text-black">Career</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-black">Help</h5>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              <li><Link to="/shop" className="hover:text-black">Customer Support</Link></li>
              <li><Link to="/shop" className="hover:text-black">Delivery Details</Link></li>
              <li><Link to="/shop" className="hover:text-black">Terms & Conditions</Link></li>
              <li><Link to="/shop" className="hover:text-black">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-black">FAQ</h5>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              <li><Link to="/shop" className="hover:text-black">Account</Link></li>
              <li><Link to="/my-orders" className="hover:text-black">Manage Deliveries</Link></li>
              <li><Link to="/shop" className="hover:text-black">Orders</Link></li>
              <li><Link to="/shop" className="hover:text-black">Payments</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} SHOP.CO. All Rights Reserved. Built with MERN Stack & Razorpay.</p>
          <div className="flex gap-3 font-semibold text-neutral-700">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>UPI</span>
            <span>RuPay</span>
            <span>NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
