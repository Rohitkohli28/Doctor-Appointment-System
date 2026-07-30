import axios from 'axios';
import toast from 'react-hot-toast';

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  // In production / live browser deployment without VITE_API_URL set
  if (
    typeof window !== 'undefined' &&
    window.location &&
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1')
  ) {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:5000/api';
};

export const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL.replace(/\/$/, '');
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  }
  if (
    typeof window !== 'undefined' &&
    window.location &&
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1')
  ) {
    return window.location.origin;
  }
  return 'http://localhost:5000';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization Bearer token header if available in localStorage
api.interceptors.request.use(
  (config) => {
    if (!config.baseURL || config.baseURL.includes('localhost:5000')) {
      config.baseURL = getApiBaseUrl();
    }
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (e) {}
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let sessionExpiredShown = false;

export const resetSessionExpiredFlag = () => {
  sessionExpiredShown = false;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const hasUserSession = !!localStorage.getItem('user');

    // Check if 401 Unauthorized or 403 Forbidden on protected request
    if (
      (status === 401 || status === 403) &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/doctor/login' &&
      originalRequest.url !== '/auth/refresh-token'
    ) {
      originalRequest._retry = true;

      // Case 1: Guest Visitor (User has never logged in / no user session stored)
      if (!hasUserSession) {
        return Promise.reject(error);
      }

      // Case 2: Previously Logged-in User whose session expired
      try {
        // Attempt refresh token
        const refreshRes = await axios.post(
          `${getApiBaseUrl()}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        
        if (refreshRes.data?.token) {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            try {
              const u = JSON.parse(userStr);
              u.token = refreshRes.data.token;
              localStorage.setItem('user', JSON.stringify(u));
            } catch (e) {}
          }
        }
        
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('user');
        
        if (!sessionExpiredShown) {
          sessionExpiredShown = true;
          toast.error('Session expired. Please log in again.', { id: 'session-expired-toast' });
        }

        const publicPaths = ['/', '/login', '/doctor/login', '/register'];
        if (!publicPaths.includes(window.location.pathname)) {
          const currentTarget = window.location.pathname + window.location.search;
          window.location.href = `/login?redirect=${encodeURIComponent(currentTarget)}`;
        }
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
