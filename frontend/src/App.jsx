import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import MyOrdersPage from './pages/MyOrdersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import NewArrivalsPage from './pages/NewArrivalsPage';
import WatchesPage from './pages/WatchesPage';
import DeveloperPage from './pages/DeveloperPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import ProfilePage from './pages/ProfilePage';
import AdminLoginPage from './pages/admin/AdminLoginPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans selection:bg-black selection:text-white">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Storefront Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />

                  {/* Authentication Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />

                  {/* Other Pages */}
                  <Route path="/new-arrivals" element={<NewArrivalsPage />} />
                  <Route path="/watches" element={<WatchesPage />} />
                  <Route path="/developer" element={<DeveloperPage />} />

                  {/* Protected Customer Routes */}
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute>
                        <CartPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/wishlist"
                    element={
                      <ProtectedRoute>
                        <WishlistPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/order-success/:id"
                    element={
                      <ProtectedRoute>
                        <OrderSuccessPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-orders"
                    element={
                      <ProtectedRoute>
                        <MyOrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/profile"
                    element={
                      <AdminRoute>
                        <AdminProfilePage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/products"
                    element={<AdminRoute><AdminDashboard /></AdminRoute>}
                  />
                  <Route
                    path="/admin/orders"
                    element={<AdminRoute><AdminDashboard /></AdminRoute>}
                  />
                  <Route
                    path="/admin/users"
                    element={<AdminRoute><AdminDashboard /></AdminRoute>}
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
