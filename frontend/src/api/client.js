import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const apiUrl = configuredApiUrl ||
  (import.meta.env.PROD
    ? "https://sss-project-3.onrender.com"
    : "http://localhost:5000");

const api = axios.create({
  baseURL: `${apiUrl}/api`,
  timeout: 30000,
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
      config.headers["x-auth-token"] = token;
    }
    if (!config.headers.Authorization) {
      delete config.headers.Authorization;
      delete config.headers["x-auth-token"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle 401 unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message =
        "Unable to connect to the server. Please try again in a moment.";
    }

    return Promise.reject(error);
  }
);

export default api;
