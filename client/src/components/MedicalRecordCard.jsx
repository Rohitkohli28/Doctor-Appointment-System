import React from 'react';
import { FileText, User, Calendar, Activity, ClipboardList, Stethoscope } from 'lucide-react';

const MedicalRecordCard = ({ record }) => {
  const {
    appointmentDate,
    diagnosis,
    prescription,
    doctorId,
    notes
  } = record;

  return (
    <div className="bg-white dark:bg-darkcard rounded-3xl shadow-sm border border-slate-200/80 dark:border-darkborder p-6 hover:shadow-md transition-all relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 dark:bg-emerald-950/20 rounded-full blur-2xl opacity-40 -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700"></div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase line-clamp-1">
              Dr. {doctorId?.userId?.name || 'Doctor'}
            </h3>
            <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-900/50 px-2.5 py-0.5 rounded-full bg-emerald-50/50 dark:bg-emerald-950/20">
              <ClipboardList className="w-3 h-3" /> {doctorId?.specialization || 'Specialist'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-semibold justify-end">
            <Calendar className="w-4 h-4 text-primary-500 dark:text-cyan-400" />
            {appointmentDate ? new Date(appointmentDate).toLocaleDateString() : 'N/A'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block">Diagnosis</label>
            <div className="bg-slate-50 dark:bg-darksurface p-4 rounded-2xl border border-slate-100 dark:border-darkborder h-[100px] overflow-y-auto custom-scrollbar">
               <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed italic">&ldquo;{diagnosis || 'No diagnosis recorded'}&rdquo;</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block">Prescription</label>
            <div className="bg-slate-50 dark:bg-darksurface p-4 rounded-2xl border border-slate-100 dark:border-darkborder h-[100px] overflow-y-auto custom-scrollbar">
               <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-line">{prescription || 'No prescription specified'}</p>
            </div>
          </div>
        </div>
      </div>

      {notes && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-darkborder text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Doctor Notes:</span>
          <p className="text-slate-600 dark:text-slate-300 font-medium mt-1">{notes}</p>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordCard;
