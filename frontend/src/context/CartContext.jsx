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
      // Guest cart from localStorage
      const localCart = localStorage.getItem('sss_local_cart');
      if (localCart) {
        try {
          setCartItems(JSON.parse(localCart));
        } catch {
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/api/cart');
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

  // Sync guest cart changes to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('sss_local_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  const addToCart = async (product, quantity = 1, size = 'M', color = 'Standard') => {
    const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;

    if (isAuthenticated) {
      try {
        const res = await api.post('/api/cart', {
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
      // Guest mode
      setCartItems((prev) => {
        const existingIdx = prev.findIndex(
          (item) =>
            (item.product?._id === product._id || item.product === product._id) &&
            item.size === size &&
            item.color === color
        );

        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx].quantity += quantity;
          return updated;
        }

        return [
          ...prev,
          {
            _id: `guest_${Date.now()}_${Math.random()}`,
            product,
            quantity,
            size,
            color,
            price: effectivePrice,
          },
        ];
      });
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;

    if (isAuthenticated) {
      try {
        const res = await api.put(`/api/cart/${itemId}`, { quantity });
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
        const res = await api.delete(`/api/cart/${itemId}`);
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
        await api.delete('/api/cart');
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
