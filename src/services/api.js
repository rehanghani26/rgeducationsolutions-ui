import axios from "axios";
import {
  normalizeApiError,
  notifyAfterRedirect,
  notifyApiError,
} from "./apiErrors.js";

// ─── API URL Configuration (Easily Switch Local / Dev) ──────────────────────
const local_url = "http://localhost:5000/api/v1";
const dev_url = "https://inventorymanagementserver-9tyo.onrender.com/api/v1";

// Change this to local_url or dev_url as needed:
const url = dev_url;

export const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL?.trim() || url
).replace(/\/+$/, "");
export const API_HEALTH_URL =
  API_BASE_URL.replace(/\/api(?:\/v\d+)?$/, "") + "/api/health";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    // 1. Attach Multi-Tenant Identifiers Header (both x-school-id and x-collection-name)
    const schoolIdentifier =
      localStorage.getItem("rges_school_id") ||
      localStorage.getItem("rges_school_collection") ||
      sessionStorage.getItem("rges_school_id") ||
      sessionStorage.getItem("rges_school_collection");

    if (schoolIdentifier) {
      config.headers["x-school-id"] = schoolIdentifier;
      config.headers["x-collection-name"] = schoolIdentifier;
    }

    const rawToken = localStorage.getItem("token");
    const token =
      rawToken && rawToken !== "undefined" && rawToken !== "null"
        ? rawToken
        : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // When not logged in, only allow public auth endpoints
      const url = config.url || "";
      const isPublicRoute =
        url.includes("/auth/login") ||
        url.includes("/auth/signup") ||
        url.includes("/auth/school-check") ||
        url.includes("/auth/setup-status") ||
        url.includes("/auth/has-users") ||
        url.includes("/auth/send-otp") ||
        url.includes("/auth/verify-otp") ||
        url.includes("/auth/forgot") ||
        url.includes("/auth/reset") ||
        url.includes("/certificates/verify");

      if (!isPublicRoute) {
        // Reject immediately so unauthenticated users do not hit any protected API
        return Promise.reject(
          new axios.Cancel("User is not logged in. Request cancelled.")
        );
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise;

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
      .then(({ data }) => {
        const token = data.accessToken || data.data?.accessToken;
        if (!token)
          throw new Error(
            "Unable to renew your session. Please sign in again."
          );
        localStorage.setItem("token", token);
        return token;
      })
      .catch(async (error) => {
        await normalizeApiError(error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (window.location.pathname.includes("/login")) notifyApiError(error);
        else notifyAfterRedirect(error, "/login");
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => {
    if (response.data?.success === false) notifyApiError(response.data);
    return response;
  },
  async (error) => {
    if (axios.isCancel(error)) throw error;

    const originalRequest = error.config;
    const status = error.response?.status;
    await normalizeApiError(error);

    // AI endpoints (/ai/chat, /ai/health) are sub-services and must NEVER take down the ERP with maintenance page!
    const isAiEndpoint = Boolean(
      originalRequest?.url &&
      (originalRequest.url.includes("/ai/") ||
        originalRequest.url.endsWith("/ai"))
    );

    // Detect if server is offline or unreachable (no response, ERR_NETWORK, connection refused, 502/503/504)
    const isServerDown =
      !isAiEndpoint &&
      (!error.response ||
        error.code === "ERR_NETWORK" ||
        [502, 503, 504].includes(status));

    if (isServerDown && !originalRequest?.localErrorUi && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("server:offline", {
          detail: {
            url: originalRequest?.url,
            status: status || 0,
            message: error.message,
            timestamp: new Date().toISOString(),
          },
        })
      );
    }

    // Check if institution access has been suspended (403 with status: "suspended")
    const isSuspendedResponse =
      error.response?.data?.status === "suspended" ||
      error.response?.data?.schoolStatus === "suspended" ||
      (error.response?.data?.message &&
        typeof error.response.data.message === "string" &&
        error.response.data.message.toLowerCase().includes("suspended"));

    if (isSuspendedResponse) {
      const suspensionInfo = {
        schoolId:
          error.response?.data?.schoolId ||
          localStorage.getItem("rges_school_id") ||
          "",
        schoolName: error.response?.data?.schoolName || "Your School",
        message:
          error.response?.data?.message ||
          "Access to your school has been suspended. Please contact RGES Support.",
      };
      sessionStorage.setItem(
        "rges_suspended_info",
        JSON.stringify(suspensionInfo)
      );
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/suspended")
      ) {
        notifyAfterRedirect(error, "/suspended");
      } else notifyApiError(error);
      throw error;
    }

    const rawToken = localStorage.getItem("token");
    const canRefresh =
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      rawToken &&
      rawToken !== "undefined" &&
      rawToken !== "null" &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh");
    if (!canRefresh) {
      if (!originalRequest?.localErrorUi) notifyApiError(error);
      throw error;
    }

    originalRequest._retry = true;
    await refreshAccessToken();
    return api(originalRequest);
  }
);

export default api;
