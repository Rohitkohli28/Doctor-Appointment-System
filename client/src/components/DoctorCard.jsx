import { Star, MapPin, Building2, Clock, IndianRupee, Languages, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const DoctorCard = ({ doctor }) => {
  const photo = doctor.userId?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.userId?.name || 'Dr')}&background=0D8ABC&color=fff&size=150`;
  const languagesList = doctor.languages?.length > 0 ? doctor.languages.join(', ') : 'English, Hindi';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-darkcard rounded-3xl shadow-sm border border-slate-200/80 dark:border-darkborder hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
    >
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Avatar & Badges */}
          <div className="flex-shrink-0 w-28 h-28 mx-auto sm:mx-0 relative">
            <img 
              src={photo} 
              alt={doctor.userId?.name} 
              className="w-full h-full object-cover rounded-2xl shadow-md border-2 border-slate-100 dark:border-darkborder group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute -bottom-2 -right-1 bg-white dark:bg-darksurface px-2 py-0.5 rounded-lg text-[11px] font-black text-amber-600 dark:text-amber-400 shadow-md flex items-center gap-1 border border-slate-100 dark:border-darkborder">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {doctor.rating || '4.8'}
            </div>
          </div>
          
          {/* Details */}
          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-primary-50 dark:bg-cyan-950/40 text-primary-700 dark:text-cyan-400 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-primary-100 dark:border-cyan-900/50">
                {doctor.specialization}
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Available Today
              </span>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-cyan-400 transition-colors">
              Dr. {doctor.userId?.name}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-3">
              {doctor.qualifications?.join(', ') || 'MBBS, MD'}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 w-full text-xs text-slate-600 dark:text-slate-300 font-medium">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Clock className="w-4 h-4 text-primary-500 shrink-0" />
                <span>{doctor.experience || 5} Years Exp.</span>
              </div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">{doctor.hospitalName || 'City Clinic'}</span>
              </div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Languages className="w-4 h-4 text-violet-500 shrink-0" />
                <span className="truncate">{languagesList}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center sm:justify-start font-bold text-slate-900 dark:text-white">
                <IndianRupee className="w-3.5 h-3.5 text-primary-600 dark:text-cyan-400 shrink-0" />
                <span>₹{doctor.consultationFee || 500}</span>
                <span className="font-normal text-slate-400 text-[10px]">/ visit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Action Footer */}
      <div className="bg-slate-50/80 dark:bg-darksurface/80 px-6 py-4 border-t border-slate-100 dark:border-darkborder flex flex-col sm:flex-row justify-between items-center gap-3">
        <Link 
          to={`/doctors/${doctor._id}`}
          className="w-full sm:w-auto text-center border border-slate-200 dark:border-darkborder hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-5 py-2 rounded-xl text-xs font-bold transition-all"
        >
          View Profile
        </Link>

        <Link 
          to={`/book/${doctor._id}`}
          className="w-full sm:w-auto text-center bg-primary-600 hover:bg-primary-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white px-6 py-2 rounded-xl text-xs font-extrabold shadow-md shadow-primary-500/20 hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95"
        >
          Book Appointment
        </Link>
      </div>
    </motion.div>
  );
};

export default DoctorCard;
