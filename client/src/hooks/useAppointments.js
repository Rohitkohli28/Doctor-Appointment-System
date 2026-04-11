import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState({ upcoming: [], past: [], cancelled: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/appointments/my');
      setAppointments(res.data.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch appointments';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelAppointment = async (id) => {
    try {
      await api.put(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
      return false;
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    refreshAppointments: fetchAppointments,
    cancelAppointment
  };
};
