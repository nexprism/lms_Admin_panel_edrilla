import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { clearCredentials } from '../store/slices/authslice';

// Store injection breaks the circular import store/index -> authslice -> axiosConfig
// -> store/index, which left `authReducer` in the temporal dead zone and crashed the
// whole app at boot (blank page). store/index.ts calls injectStore(store) right after
// configureStore; interceptors only run long after that.
let injectedStore: { dispatch: (action: unknown) => unknown } | null = null;
export const injectStore = (s: { dispatch: (action: unknown) => unknown }) => {
  injectedStore = s;
};

// API base URL
const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api.edrilla.com/';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3600000, // 1 hour in milliseconds
  // Send the httpOnly auth cookie with every request (auth no longer depends on a
  // JWT read from localStorage).
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: import('axios').InternalAxiosRequestConfig): import('axios').InternalAxiosRequestConfig => {
    const token = localStorage.getItem('accessToken');
    
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['x-access-token'] = token;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        config.headers['x-refresh-token'] = refreshToken;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      // Handle 401 Unauthorized errors.
      // clearCredentials flips isAuthenticated=false in Redux AND removes the
      // token/accessToken/refreshToken/user keys from localStorage, so the
      // in-memory store stays consistent with the cleared session.
      injectedStore?.dispatch(clearCredentials());
      // Redirect to signin so the UI reflects the cleared session, guarding
      // against a redirect loop when already on the signin page.
      if (window.location.pathname !== '/signin') {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;