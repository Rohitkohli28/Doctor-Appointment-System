import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Failed to fetch notifications:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const clearAll = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications cleared');
    } catch (err) {
      toast.error('Failed to clear notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

    const handleUpdate = () => {
      fetchNotifications();
    };

    socket.on('new-appointment', handleUpdate);
    socket.on('appointment-paid', handleUpdate);
    socket.on('appointment-completed', handleUpdate);
    socket.on('appointment-cancelled', handleUpdate);

    return () => {
      socket.disconnect();
    };
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    refreshNotifications: fetchNotifications,
    markAllRead,
    deleteNotification,
    clearAll
  };
};
