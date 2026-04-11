import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, DollarSign, XCircle, Info } from 'lucide-react';

const AppointmentCard = ({ appointment, onCancel, isDoctor }) => {
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
      case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const name = isDoctor ? patientId?.name : doctorId?.userId?.name;
  const subText = isDoctor ? patientId?.email : doctorId?.specialization;
  const photo = isDoctor ? patientId?.profilePhoto : doctorId?.userId?.profilePhoto;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white shadow-sm">
            {photo ? (
              <img src={photo} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-600 font-bold text-xl uppercase">
                {name?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight line-clamp-1">
              Dr. {name}
            </h3>
            <p className="text-gray-500 text-sm font-medium">{subText || 'Specialist'}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      <div className="space-y-3 mb-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
        <div className="flex items-center gap-3 text-gray-600">
          <Calendar className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-semibold">{new Date(appointmentDate).toDateString()}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <Clock className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-semibold">{timeSlot}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <DollarSign className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-semibold">₹{consultationFee}</span>
        </div>
      </div>

      {symptoms && (
          <div className="mb-6 px-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> symptoms reported
              </p>
              <p className="text-sm text-gray-600 italic line-clamp-2 leading-relaxed">&ldquo;{symptoms}&rdquo;</p>
          </div>
      )}

      <div className="flex gap-3">
        {status !== 'cancelled' && status !== 'completed' && !isDoctor && (
          <button
            onClick={() => onCancel(_id)}
            className="flex-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" /> Cancel
          </button>
        )}
        <button 
          onClick={() => navigate(`/doctors/${doctorId?._id}`)}
          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary-500/20 active:scale-95"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default AppointmentCard;
