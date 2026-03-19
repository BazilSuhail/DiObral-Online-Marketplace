import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

function getToken() {
  const token = useAuthStore.getState().token;
  if (token) return token;
  try {
    const stored = JSON.parse(localStorage.getItem("diobral-auth-storage") || "{}");
    return stored.state?.token || null
  } catch { return null }
}

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);

export async function apiCall(url, method = "GET", data = null, options = {}) {
  const isFormData = data instanceof FormData;
  const config = {
    url,
    method,
    data,
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    ...options,
  };
  const response = await api(config);
  return response.data;
}

export const get = (url, params) => apiCall(url, "GET", null, { params });
export const post = (url, data) => apiCall(url, "POST", data);
export const put = (url, data) => apiCall(url, "PUT", data);
export const patch = (url, data) => apiCall(url, "PATCH", data);
export const del = (url) => apiCall(url, "DELETE");

export default api;
