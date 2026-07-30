import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, DollarSign, XCircle, Info, Stethoscope, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateAppointmentReceiptPdf } from '../utils/generateReceiptPdf';
import { useAuth } from '../hooks/useAuth';

const AppointmentCard = ({ appointment, onCancel, onComplete, isDoctor }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    _id,
    appointmentDate,
    timeSlot,
    status,
    type,
    consultationFee,
    doctorId,
    patientId,
    symptoms
  } = appointment;

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'pending': return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'completed': return 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-cyan-400 border-sky-200 dark:border-cyan-800';
      case 'cancelled': return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      default: return 'bg-slate-50 dark:bg-darksurface text-slate-700 dark:text-slate-300 border-slate-200 dark:border-darkborder';
    }
  };

  const name = isDoctor ? patientId?.name : doctorId?.userId?.name;
  const subText = isDoctor ? patientId?.email : doctorId?.specialization;
  const photo = isDoctor ? patientId?.profilePhoto : doctorId?.userId?.profilePhoto;

  return (
    <div className="bg-white dark:bg-darkcard rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-darkborder hover:shadow-lg transition-all duration-300 group flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-50 dark:bg-darksurface border-2 border-white dark:border-darkbg shadow-sm shrink-0">
              {photo ? (
                <img src={photo} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-50 dark:bg-cyan-950/40 text-primary-600 dark:text-cyan-400 font-black text-lg uppercase">
                  {(name || 'User').charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-cyan-400 transition-colors tracking-tight line-clamp-1">
                {isDoctor ? (name || 'Patient') : `Dr. ${name || 'Doctor'}`}
              </h3>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold truncate mt-0.5">{subText || 'Healthcare Practitioner'}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>

        <div className="space-y-2.5 mb-5 bg-slate-50 dark:bg-darksurface p-4 rounded-2xl border border-slate-100 dark:border-darkborder text-xs">
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-primary-500 dark:text-cyan-400" />
            <span className="font-bold">{appointmentDate ? new Date(appointmentDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span className="font-bold">{timeSlot || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
            <DollarSign className="w-4 h-4 text-violet-500" />
            <span className="font-bold">Consultation Fee: ₹{consultationFee || 0}</span>
          </div>
        </div>

        {symptoms && (
          <div className="mb-5 px-1 text-xs">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Symptoms Reported
            </p>
            <p className="text-slate-600 dark:text-slate-300 italic line-clamp-2 leading-relaxed">&ldquo;{symptoms}&rdquo;</p>
          </div>
        )}
      </div>

      <div className="flex gap-2.5 pt-2 shrink-0">
        {status !== 'cancelled' && status !== 'completed' && (
          <button
            onClick={() => onCancel(_id)}
            className="flex-1 bg-white dark:bg-darksurface hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
          >
            <XCircle className="w-3.5 h-3.5" /> Cancel
          </button>
        )}
        
        {!isDoctor && (status === 'confirmed' || status === 'completed') && (
          <button
            onClick={() => generateAppointmentReceiptPdf(appointment, user)}
            className="p-2.5 bg-slate-100 dark:bg-darksurface hover:bg-slate-200 dark:hover:bg-darkborder text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-darkborder"
            title="Download Official PDF Receipt"
          >
            <Download className="w-4 h-4 text-primary-600 dark:text-cyan-400" />
          </button>
        )}

        {isDoctor ? (
          status !== 'completed' && status !== 'cancelled' && (
            <button 
              onClick={onComplete}
              className="flex-1 bg-primary-600 hover:bg-primary-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 text-center flex items-center justify-center gap-1.5"
            >
              Start Consultation
            </button>
          )
        ) : (
          <button 
            onClick={() => navigate(`/doctors/${doctorId?._id || doctorId}`)}
            className="flex-1 bg-primary-600 hover:bg-primary-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 text-center flex items-center justify-center gap-1.5"
          >
            View Doctor
          </button>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
