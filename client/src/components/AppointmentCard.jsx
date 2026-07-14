import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, DollarSign, XCircle, Info, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';

const AppointmentCard = ({ appointment, onCancel, onComplete, isDoctor }) => {
  const navigate = useNavigate();
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
      case 'confirmed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'completed': return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const name = isDoctor ? patientId?.name : doctorId?.userId?.name;
  const subText = isDoctor ? patientId?.email : doctorId?.specialization;
  const photo = isDoctor ? patientId?.profilePhoto : doctorId?.userId?.profilePhoto;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between h-full lift-card">
      <div>
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 ring-2 ring-white shadow-sm shrink-0">
              {photo ? (
                <img src={photo} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-600 font-black text-lg uppercase">
                  {name?.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-800 group-hover:text-primary-600 transition-colors tracking-tight line-clamp-1">
                {isDoctor ? name : `Dr. ${name}`}
              </h3>
              <p className="text-slate-400 text-xs font-semibold truncate mt-0.5">{subText || 'Healthcare Practitioner'}</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>

        <div className="space-y-2.5 mb-5 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
          <div className="flex items-center gap-2.5 text-slate-600">
            <Calendar className="w-4 h-4 text-primary-500" />
            <span className="font-bold">{new Date(appointmentDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-600">
            <Clock className="w-4 h-4 text-primary-500" />
            <span className="font-bold">{timeSlot}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-600">
            <DollarSign className="w-4 h-4 text-primary-500" />
            <span className="font-bold">Consultation Fee: ₹{consultationFee}</span>
          </div>
        </div>

        {symptoms && (
          <div className="mb-5 px-1 text-xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400" /> symptoms reported
            </p>
            <p className="text-slate-600 italic line-clamp-2 leading-relaxed">&ldquo;{symptoms}&rdquo;</p>
          </div>
        )}
      </div>

      <div className="flex gap-2.5 pt-2 shrink-0">
        {status !== 'cancelled' && status !== 'completed' && (
          <button
            onClick={() => onCancel(_id)}
            className="flex-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-100 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
          >
            <XCircle className="w-3.5 h-3.5" /> Cancel
          </button>
        )}
        
        {isDoctor ? (
          status !== 'completed' && status !== 'cancelled' && (
            <button 
              onClick={onComplete}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-primary-500/10 active:scale-95 text-center flex items-center justify-center gap-1.5"
            >
              Start Consultation
            </button>
          )
        ) : (
          <button 
            onClick={() => navigate(`/doctors/${doctorId?._id || doctorId}`)}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-primary-500/10 active:scale-95 text-center flex items-center justify-center gap-1.5"
          >
            View Doctor
          </button>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
