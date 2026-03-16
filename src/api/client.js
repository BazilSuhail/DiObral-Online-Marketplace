import axios from "axios";
import { useMarketplaceStore } from "../lib/marketplaceStore";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = useMarketplaceStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useMarketplaceStore.getState().logout();
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
