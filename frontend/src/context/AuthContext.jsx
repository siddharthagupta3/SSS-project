import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { getToken, setToken, clearToken } from '../api/client';

const AuthContext = createContext();

const TOKEN_KEY = "sss_token";
const USER_KEY = "sss_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: Get user from storage
  const getStoredUser = () => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      const sessionUser = sessionStorage.getItem(USER_KEY);
      return sessionUser ? JSON.parse(sessionUser) : null;
    }
  };

  // Helper: Set user in both storages
  const setUserInStorage = (userData) => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (e) {
      console.warn("localStorage not available, using sessionStorage");
    }
    sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
  };

  // Helper: Clear user from both storages
  const clearUserFromStorage = () => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.warn("localStorage not available");
    }
    sessionStorage.removeItem(USER_KEY);
  };

  // Validate session on app initialization
  useEffect(() => {
    const verifyUserSession = async () => {
      const storedToken = getToken();
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            setUserInStorage(res.data.data);
          }
        } catch (err) {
          const status = err.response?.status;
          const message = err.response?.data?.message?.toLowerCase() || '';
          // Only logout on 401 with auth-related errors
          if (status === 401 && (message.includes('jwt') || message.includes('token') || message.includes('unauthorized'))) {
            clearToken();
            clearUserFromStorage();
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
    setUserInStorage(userData);
    return userData;
  };

  const loginWithGoogle = useCallback(async (googlePayload) => {
    const res = await api.post('/auth/google', googlePayload);
    if (res.data.success) {
      const userData = res.data.data;
      setUser(userData);
      setToken(userData.token);
      setUserInStorage(userData);
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
      }
      setUser(updatedUser);
      setUserInStorage(updatedUser);
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
    clearToken();
    clearUserFromStorage();
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    if (res.data.success) {
      const updatedUser = res.data.data;
      setUser(updatedUser);
      setUserInStorage(updatedUser);
      return updatedUser;
    }
  };

  const updateUser = (updatedUser) => {
    setUser((current) => {
      const next = { ...current, ...updatedUser };
      setUserInStorage(next);
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
