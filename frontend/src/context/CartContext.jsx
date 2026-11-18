import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync cart from backend when user logs in
  const fetchBackendCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success && res.data.data?.items) {
        setCartItems(res.data.data.items);
      }
    } catch (err) {
      console.warn('Failed to fetch user cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchBackendCart();
  }, [fetchBackendCart]);

  const addToCart = async (product, quantity = 1, size = 'M', color = 'Standard') => {
    if (isAuthenticated) {
      try {
        const res = await api.post('/cart', {
          productId: product._id,
          quantity,
          size,
          color,
        });
        if (res.data.success && res.data.data?.items) {
          setCartItems(res.data.data.items);
        }
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Could not add product to cart');
      }
    } else {
      throw new Error('LOGIN_REQUIRED');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;

    if (isAuthenticated) {
      try {
        const res = await api.put(`/cart/${itemId}`, { quantity });
        if (res.data.success && res.data.data?.items) {
          setCartItems(res.data.data.items);
        }
      } catch (err) {
        console.error('Update quantity failed:', err.message);
      }
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item._id === itemId ? { ...item, quantity } : item))
      );
    }
  };

  const removeFromCart = async (itemId) => {
    if (isAuthenticated) {
      try {
        const res = await api.delete(`/cart/${itemId}`);
        if (res.data.success && res.data.data?.items) {
          setCartItems(res.data.data.items);
        }
      } catch (err) {
        console.error('Remove item failed:', err.message);
      }
    } else {
      setCartItems((prev) => prev.filter((item) => item._id !== itemId));
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.delete('/cart');
      } catch (err) {
        console.error('Clear cart failed:', err.message);
      }
    }
    setCartItems([]);
    localStorage.removeItem('sss_local_cart');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => {
    const p = item.product?.discountPrice > 0 ? item.product.discountPrice : item.product?.price || item.price;
    return acc + p * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchBackendCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
