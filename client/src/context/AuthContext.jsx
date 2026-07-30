import { createContext, useState, useEffect } from 'react';
import api, { resetSessionExpiredFlag } from '../utils/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const localUser = localStorage.getItem('user');
      return localUser ? JSON.parse(localUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('user');
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setLoading(false);
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      } catch (err) {
        console.log("Session not found or expired.");
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      
      resetSessionExpiredFlag();
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setIsAuthenticated(true);
      
      const isDoc = res.data.user?.role === 'doctor';
      const userName = res.data.user?.name || (isDoc ? 'Doctor' : 'Patient');
      const welcomeMsg = isDoc 
        ? `Welcome back, Dr. ${userName.replace(/^Dr\.\s*/i, '')}! Redirecting to Doctor Portal...`
        : `Welcome back, ${userName}! Redirecting to your dashboard...`;

      toast.success(welcomeMsg, { duration: 4000, id: 'login-welcome-toast' });
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const doctorLogin = async (email, password) => {
    try {
      const res = await api.post('/auth/doctor/login', { email, password });
      
      resetSessionExpiredFlag();
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setIsAuthenticated(true);
      
      const userName = res.data.user?.name || 'Doctor';
      toast.success(`Welcome back, Dr. ${userName.replace(/^Dr\.\s*/i, '')}! Redirecting to Doctor Portal...`, { duration: 4000, id: 'doctor-login-welcome-toast' });
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Doctor login failed');
      throw err;
    }
  };

  const registerUser = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      toast.success('Registration successful. Please login.');
      return res.data;
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      const errorCode = err.response?.data?.code;

      if (errorCode === 'USER_EXISTS') {
        toast.error('An account with this email already exists — try signing in instead.', {
          duration: 5000,
          id: 'user-exists-toast'
        });
      } else if (!err.response || err.message === 'Network Error') {
        toast.error('Network Error: Unable to connect to the backend server. Please check your connection.', {
          duration: 5000,
          id: 'network-error-toast'
        });
      } else {
        toast.error(serverMessage || 'Registration failed');
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
       console.error("Logout error:", error);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully!');
      window.location.href = '/';      
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, doctorLogin, registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
