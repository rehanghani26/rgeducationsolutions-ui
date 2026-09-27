import axios from "axios";
const DEV_URL = "https://inventorymanagementserver-9tyo.onrender.com";
const LOCAL_URL = "http://localhost:5000";

const baseURL = `${LOCAL_URL}/api/v1`;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // If a request succeeds, we can signal the server is online
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Detect if server is offline or unreachable (no response, ERR_NETWORK, connection refused, 502/503/504)
    const isServerDown =
      !error.response ||
      error.code === "ERR_NETWORK" ||
      error.message === "Network Error" ||
      [502, 503, 504].includes(error.response?.status);

    if (isServerDown && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("server:offline", {
          detail: {
            url: originalRequest?.url,
            status: error.response?.status || 0,
            message:
              error.message || "ERR_CONNECTION_REFUSED - Server is currently offline",
            timestamp: new Date().toISOString(),
          },
        })
      );
    }

    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    if (
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const res = await axios.post(
        `${baseURL}/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const newToken = res.data.accessToken;
      localStorage.setItem("token", newToken);
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
