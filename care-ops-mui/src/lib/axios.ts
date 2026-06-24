import axios from "axios";
import useAuthStore from "../store/useAuthStore";

// Shared axios instance. /api/* is proxied (vite.config) to the care-api backend.
export const api = axios.create({
  baseURL: "/api",
  timeout: 20000,
});

// Request interceptor: attach the bearer token (mirrors micro-fes AxiosProvider).
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: on 401, drop the session (token expired/invalid).
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) useAuthStore.getState().logout();
    return Promise.reject(error);
  },
);
