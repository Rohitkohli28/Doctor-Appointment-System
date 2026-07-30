import { useState, useEffect, useCallback } from 'react';
import api, { getSocketUrl } from '../utils/api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState({ upcoming: [], past: [], cancelled: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/appointments/my');
      setAppointments(res.data.data);
    } catch (err) {
      if (err.response?.status !== 401) {
        const msg = err.response?.data?.message || 'Failed to fetch appointments';
        setError(msg);
        toast.error(msg);
      }
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

    const socket = io(getSocketUrl());

    socket.on('appointment-completed', () => {
      toast.success('🔔 Your doctor has completed the consultation and issued a prescription!');
      fetchAppointments();
    });

    socket.on('appointment-cancelled', () => {
      fetchAppointments();
    });

    socket.on('appointment-paid', () => {
      toast.success('🔔 Payment confirmed for your appointment!');
      fetchAppointments();
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    refreshAppointments: fetchAppointments,
    cancelAppointment
  };
};
