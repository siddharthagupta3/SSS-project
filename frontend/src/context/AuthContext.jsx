import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
          const res = await api.get('/auth/profile');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('sss_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          const status = err.response?.status;
          if (status === 401 || status === 403) {
            logout();
          } else {
            console.warn('Session verification unavailable:', err.message);
          }
        }
      }
      setLoading(false);
    };

    verifyUserSession();
  }, []);

  const login = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const res = await api.post('/auth/login', {
      email: normalizedEmail,
      password,
    });

    if (!res.data.success || !res.data.data?.token) {
      throw new Error(res.data.message || 'Login failed. Please try again.');
    }

    const userData = res.data.data;
    setUser(userData);
    setToken(userData.token);
    localStorage.setItem('sss_token', userData.token);
    localStorage.setItem('sss_user', JSON.stringify(userData));
    return userData;
  };

  const loginWithGoogle = useCallback(async (googlePayload) => {
    const res = await api.post('/auth/google', googlePayload);
    if (res.data.success) {
      const userData = res.data.data;
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('sss_token', userData.token);
      localStorage.setItem('sss_user', JSON.stringify(userData));
      return userData;
    }
  }, []);

  const register = async (name, email, password, confirmPassword) => {
    const res = await api.post('/auth/register', { name, email, password, confirmPassword: confirmPassword ?? password });
    if (res.data.success) {
      return res.data.data;
    }
  };

  const verifyOTP = async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    if (res.data.success) {
      const updatedUser = res.data.data;
      if (updatedUser.token) {
        setToken(updatedUser.token);
        localStorage.setItem('sss_token', updatedUser.token);
      }
      setUser(updatedUser);
      localStorage.setItem('sss_user', JSON.stringify(updatedUser));
      return res.data;
    }
  };

  const resendOTP = async (email) => {
    const res = await api.post('/auth/send-otp', { email: email || user?.email });
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  };

  const resetPassword = async (email, otp, password, confirmPassword) => {
    const res = await api.post('/auth/reset-password', { email, otp, password, confirmPassword });
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sss_token');
    localStorage.removeItem('sss_user');
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    if (res.data.success) {
      const updatedUser = res.data.data;
      setUser(updatedUser);
      localStorage.setItem('sss_user', JSON.stringify(updatedUser));
      return updatedUser;
    }
  };

  const updateUser = (updatedUser) => {
    setUser((current) => {
      const next = { ...current, ...updatedUser };
      localStorage.setItem('sss_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isEmailVerified: !!user?.isEmailVerified,
        isAdmin: user?.role === 'admin',
        login,
        loginWithGoogle,
        register,
        verifyOTP,
        resendOTP,
        forgotPassword,
        resetPassword,
        logout,
        updateProfile,
        updateUser,
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
