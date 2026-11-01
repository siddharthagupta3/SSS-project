import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

const api = axios.create({
  baseURL: `${apiUrl}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercept requests to attach JWT token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("sss_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle 401 unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      if (localStorage.getItem("sss_token")) {
        localStorage.removeItem("sss_token");
        localStorage.removeItem("sss_user");
        // Optionally redirect or allow user context to handle
      }
    }
    return Promise.reject(error);
  }
);

export default api;
