import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('sss_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('sss_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on app initialization
  useEffect(() => {
    const verifyUserSession = async () => {
      const storedToken = localStorage.getItem('sss_token');
      if (storedToken) {
        try {
          const res = await api.get('/api/auth/profile');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('sss_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.warn('Session verification failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUserSession();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.data.success) {
      const userData = res.data.data;
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('sss_token', userData.token);
      localStorage.setItem('sss_user', JSON.stringify(userData));
      return userData;
    }
  };

  const register = async (name, email, password) => {
    const res = await api.post('/api/auth/register', { name, email, password });
    if (res.data.success) {
      const userData = res.data.data;
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('sss_token', userData.token);
      localStorage.setItem('sss_user', JSON.stringify(userData));
      return userData;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sss_token');
    localStorage.removeItem('sss_user');
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/api/auth/profile', profileData);
    if (res.data.success) {
      const updatedUser = res.data.data;
      setUser(updatedUser);
      localStorage.setItem('sss_user', JSON.stringify(updatedUser));
      return updatedUser;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
