import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

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
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        
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
