import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const useMedicalHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/medical-history/my');
      setHistory(res.data.data);
    } catch (err) {
      if (err.response?.status !== 401) {
        const msg = err.response?.data?.message || 'Failed to fetch medical history';
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    refreshHistory: fetchHistory
  };
};
