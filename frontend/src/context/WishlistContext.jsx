import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist on auth change
  useEffect(() => {
    const fetchWishlist = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          const res = await api.get('/auth/wishlist');
          if (res.data.success) {
            setWishlist(res.data.data || []);
          }
        } catch (err) {
          console.warn('Could not load user wishlist:', err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setWishlist([]);
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  const toggleWishlist = async (product) => {
    const productId = product._id || product;
    const isPresent = wishlist.some((item) => (item._id || item) === productId);

    if (isAuthenticated) {
      try {
        const res = await api.post(`/auth/wishlist/${productId}`);
        if (res.data.success) {
          if (isPresent) {
            setWishlist((prev) => prev.filter((item) => (item._id || item) !== productId));
          } else {
            setWishlist((prev) => [...prev, product]);
          }
          return res.data.isWishlisted;
        }
      } catch (err) {
        console.error('Toggle wishlist failed:', err.message);
      }
    } else {
      throw new Error('LOGIN_REQUIRED');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item) === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        loading,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
