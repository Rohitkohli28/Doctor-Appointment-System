import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  CheckCircle2, Calendar, Clock, MapPin, Video, 
  Download, CalendarPlus, LayoutDashboard, Stethoscope, ArrowRight, Loader2 
} from 'lucide-react';
import { motion } from 'framer-motion';

import { generateAppointmentReceiptPdf } from '../utils/generateReceiptPdf';
import { useAuth } from '../hooks/useAuth';

const AppointmentSuccess = () => {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await api.get(`/appointments/${appointmentId}`);
        setAppointment(res.data.data);
      } catch (error) {
        console.error('Failed to load appointment:', error);
        toast.error('Failed to load appointment summary');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointment();
    } else {
      navigate('/dashboard');
    }
  }, [appointmentId, navigate]);

  const handleDownloadReceipt = () => {
    if (!appointment) return;
    try {
      generateAppointmentReceiptPdf(appointment, user);
      toast.success('PDF Receipt downloaded successfully! 📄');
    } catch (err) {
      console.error('PDF receipt generation error', err);
      toast.error('Failed to generate PDF receipt.');
    }
  };

  const handleAddToCalendar = () => {
    if (!appointment) return;
    const refId = appointment._id.slice(-8).toUpperCase();
    const startDate = new Date(appointment.appointmentDate).toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MediCare Healthcare System//EN
BEGIN:VEVENT
SUMMARY:Doctor Appointment with Dr. ${appointment.doctorId?.userId?.name || 'Practitioner'}
DESCRIPTION:Consultation with Dr. ${appointment.doctorId?.userId?.name} (${appointment.doctorId?.specialization}). Ref: APT-${refId}
LOCATION:${appointment.doctorId?.hospitalName || 'MediCare Clinic'}
DTSTART:${startDate}
DTEND:${startDate}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Doctor_Appointment_APT-${refId}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Calendar event (.ics) created!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary-600 dark:text-cyan-400 animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Generating appointment receipt...</p>
        </div>
      </div>
    );
  }

  if (!appointment) return null;

  const doctorName = appointment.doctorId?.userId?.name || 'Practitioner';
  const doctorPhoto = appointment.doctorId?.userId?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorName)}&background=0D8ABC&color=fff&size=150`;
  const referenceId = `APT-${appointment._id.slice(-8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        
        {/* Success Card Header */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-darkcard rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-darkborder shadow-xl text-center space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800/50 shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black rounded-full uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
              Booking Confirmed
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Appointment Successfully Booked!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Reference ID: <strong className="text-primary-600 dark:text-cyan-400 font-extrabold">{referenceId}</strong>
            </p>
          </div>

          {/* Doctor Summary Card */}
          <div className="bg-slate-50 dark:bg-darksurface p-6 rounded-2xl border border-slate-100 dark:border-darkborder text-left flex flex-col sm:flex-row items-center gap-5">
            <img 
              src={doctorPhoto} 
              alt={doctorName} 
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white dark:border-darkbg shadow-md shrink-0" 
            />
            <div className="flex-1 space-y-1 text-center sm:text-left">
              <span className="text-[11px] font-extrabold uppercase text-primary-600 dark:text-cyan-400 tracking-wider">
                {appointment.doctorId?.specialization || 'Clinical Specialist'}
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Dr. {doctorName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {appointment.doctorId?.hospitalName || 'MediCare Healthcare Center'}
              </p>
            </div>
          </div>

          {/* Appointment Meta Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-xs font-semibold">
            <div className="bg-slate-50 dark:bg-darksurface p-4 rounded-2xl border border-slate-100 dark:border-darkborder space-y-1">
              <div className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5 uppercase text-[10px]">
                <Calendar className="w-3.5 h-3.5 text-primary-500" /> Date
              </div>
              <div className="text-slate-900 dark:text-white font-extrabold text-sm">
                {new Date(appointment.appointmentDate).toLocaleDateString()}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-darksurface p-4 rounded-2xl border border-slate-100 dark:border-darkborder space-y-1">
              <div className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5 uppercase text-[10px]">
                <Clock className="w-3.5 h-3.5 text-emerald-500" /> Time Slot
              </div>
              <div className="text-slate-900 dark:text-white font-extrabold text-sm">
                {appointment.timeSlot}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-darksurface p-4 rounded-2xl border border-slate-100 dark:border-darkborder space-y-1">
              <div className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5 uppercase text-[10px]">
                {appointment.type === 'online' ? <Video className="w-3.5 h-3.5 text-violet-500" /> : <MapPin className="w-3.5 h-3.5 text-rose-500" />} Mode
              </div>
              <div className="text-slate-900 dark:text-white font-extrabold text-sm capitalize">
                {appointment.type || 'in-person'}
              </div>
            </div>
          </div>

          {/* Interactive Action Buttons */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleDownloadReceipt}
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Download className="w-4 h-4" /> Download Printable Receipt
            </button>

            <button
              onClick={handleAddToCalendar}
              className="w-full bg-primary-50 dark:bg-cyan-950/40 border border-primary-200 dark:border-cyan-800/50 text-primary-700 dark:text-cyan-300 hover:bg-primary-100 font-extrabold py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <CalendarPlus className="w-4 h-4" /> Add to Calendar (.ics)
            </button>
          </div>

          {/* Navigation Links */}
          <div className="pt-6 border-t border-slate-100 dark:border-darkborder flex flex-col sm:flex-row gap-3 justify-between items-center">
            <Link
              to="/dashboard"
              className="text-primary-600 dark:text-cyan-400 font-extrabold text-xs flex items-center gap-1.5 hover:underline"
            >
              <LayoutDashboard className="w-4 h-4" /> View My Patient Dashboard
            </Link>

            <Link
              to="/search"
              className="text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-1 hover:text-slate-900"
            >
              Book Another Doctor <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default AppointmentSuccess;
