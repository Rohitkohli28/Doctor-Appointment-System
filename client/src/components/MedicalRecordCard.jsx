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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl opacity-40 -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700"></div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner group-hover:scale-110 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight uppercase line-clamp-1">
              Dr. {doctorId?.userId?.name || 'Doctor'}
            </h3>
            <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 border border-emerald-100 px-2 py-0.5 rounded-full bg-emerald-50/50">
              <ClipboardList className="w-3 h-3" /> {doctorId?.specialization || 'Specialist'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold justify-end">
            <Calendar className="w-4 h-4 text-primary-500" />
            {new Date(appointmentDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Diagnosis</label>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 group-hover:border-emerald-200 transition-colors h-[100px] overflow-y-auto custom-scrollbar">
               <p className="text-sm text-gray-700 font-medium leading-relaxed italic">&ldquo;{diagnosis || 'No diagnosis recorded'}&rdquo;</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Prescription</label>
            <div className="bg-primary-50/50 p-4 rounded-xl border border-primary-100 group-hover:border-primary-200 transition-colors h-[100px] overflow-y-auto custom-scrollbar">
               <p className="text-sm text-primary-900 font-medium leading-relaxed whitespace-pre-wrap">{prescription || 'No prescription available'}</p>
            </div>
          </div>
        </div>
      </div>
      
      {notes && (
          <div className="mt-6 pt-6 border-t border-gray-100/80">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                  <Stethoscope className="w-3.5 h-3.5" /> Additional Notes
              </label>
              <p className="text-sm text-gray-600 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">{notes}</p>
          </div>
      )}

      <div className="mt-6 flex justify-end">
        <button 
          onClick={() => {
            const reportContent = [
              '═══════════════════════════════════════',
              '         MEDICARE - MEDICAL REPORT       ',
              '═══════════════════════════════════════',
              '',
              `Doctor: Dr. ${doctorId?.userId?.name || 'N/A'}`,
              `Specialization: ${doctorId?.specialization || 'N/A'}`,
              `Date: ${new Date(appointmentDate).toLocaleDateString()}`,
              '',
              '───────────────────────────────────────',
              'DIAGNOSIS:',
              diagnosis || 'No diagnosis recorded',
              '',
              'PRESCRIPTION:',
              prescription || 'No prescription available',
              '',
              ...(notes ? ['ADDITIONAL NOTES:', notes, ''] : []),
              '───────────────────────────────────────',
              `Report generated on: ${new Date().toLocaleString()}`,
              'MediCare Healthcare Platform',
            ].join('\n');

            const blob = new Blob([reportContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `MediCare_Report_${new Date(appointmentDate).toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          className="text-primary-600 text-sm font-bold flex items-center gap-2 hover:underline bg-primary-50 px-4 py-2 rounded-lg transition-all active:scale-95"
        >
          <FileText className="w-4 h-4" /> Download Report
        </button>
      </div>
    </div>
  );
};

export default MedicalRecordCard;
