import axios from "axios";

const TOKEN_KEY = "sss_token";
const USER_KEY = "sss_user";

// Helper: Get token with fallback to sessionStorage
const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return sessionStorage.getItem(TOKEN_KEY);
  }
};

// Helper: Set token in both storages
const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.warn("localStorage not available, using sessionStorage");
  }
  sessionStorage.setItem(TOKEN_KEY, token);
};

// Helper: Clear token from both storages
const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (e) {
    console.warn("localStorage not available");
  }
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const apiUrl = configuredApiUrl ||
  (import.meta.env.PROD
    ? "https://sss-project-3.onrender.com"
    : "http://localhost:5000");

const api = axios.create({
  baseURL: `${apiUrl}/api`,
  timeout: 30000,
});

// Request interceptor: Attach token to all requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't manually set Content-Type for FormData - let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 auth errors, allow retry for network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error - don't logout, allow retry
      error.message = "Unable to connect to the server. Please try again.";
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Only logout on 401 with auth-related errors
    if (status === 401) {
      const errorMessage = data?.message?.toLowerCase() || '';
      if (errorMessage.includes('jwt') || errorMessage.includes('token') || errorMessage.includes('unauthorized')) {
        clearToken();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export { getToken, setToken, clearToken };
export default api;
