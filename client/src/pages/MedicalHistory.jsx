import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import MedicalHistoryForm from '../components/MedicalHistoryForm';
import { generatePdfReport } from '../utils/generatePdfReport';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Shield, Calendar, Search, Filter, Loader2, Download, 
  ChevronDown, ChevronUp, Edit2, FileText, HeartPulse, User, Clock, CheckCircle2 
} from 'lucide-react';
import toast from 'react-hot-toast';

const MedicalHistory = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [records, setRecords] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expandedRecordId, setExpandedRecordId] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedSpec, setSelectedSpec] = useState('all');
  const [selectedDiag, setSelectedDiag] = useState('all');
  const [dateOrder, setDateOrder] = useState('newest'); // newest, oldest

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch general profile
      const profileRes = await api.get('/medical-history/me');
      setProfile(profileRes.data.data);

      // Fetch detailed consultation records
      const recordsRes = await api.get('/medical-history/my');
      setRecords(recordsRes.data.data);
    } catch (error) {
      console.error('Error fetching medical history:', error);
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleExpandRecord = (id) => {
    setExpandedRecordId(expandedRecordId === id ? null : id);
  };

  // Extract unique values for filters
  const uniqueDoctors = Array.from(new Set(records.map(r => r.doctor?.userId?.name || r.doctorId?.userId?.name).filter(Boolean)));
  const uniqueSpecs = Array.from(new Set(records.map(r => r.doctor?.specialization || r.doctorId?.specialization).filter(Boolean)));
  const uniqueDiags = Array.from(new Set(records.map(r => r.diagnosis).filter(Boolean)));

  // Filter and sort records
  const getFilteredRecords = () => {
    let list = [...records];

    // Text search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter(r => {
        const docName = (r.doctor?.userId?.name || r.doctorId?.userId?.name || '').toLowerCase();
        const spec = (r.doctor?.specialization || r.doctorId?.specialization || '').toLowerCase();
        const diag = (r.diagnosis || '').toLowerCase();
        const symptoms = (r.symptoms || '').toLowerCase();
        return docName.includes(query) || spec.includes(query) || diag.includes(query) || symptoms.includes(query);
      });
    }

    // Filter by Doctor
    if (selectedDoctor !== 'all') {
      list = list.filter(r => (r.doctor?.userId?.name || r.doctorId?.userId?.name) === selectedDoctor);
    }

    // Filter by Specialization
    if (selectedSpec !== 'all') {
      list = list.filter(r => (r.doctor?.specialization || r.doctorId?.specialization) === selectedSpec);
    }

    // Filter by Diagnosis
    if (selectedDiag !== 'all') {
      list = list.filter(r => r.diagnosis === selectedDiag);
    }

    // Sorting by Date
    list.sort((a, b) => {
      const dateA = a.appointment?.appointmentDate ? new Date(a.appointment.appointmentDate) : new Date(a.createdAt);
      const dateB = b.appointment?.appointmentDate ? new Date(b.appointment.appointmentDate) : new Date(b.createdAt);
      return dateOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return list;
  };

  const filteredRecords = getFilteredRecords();

  // Statistics calculation
  const totalConsultations = records.length;
  const lastConsultation = records[0];
  const activePrescriptionsCount = profile?.currentMedications?.length || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-50 border-t-primary-600 rounded-full animate-spin"></div>
          <Loader2 className="w-8 h-8 text-primary-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Loading patient records...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-50 rounded-full blur-3xl opacity-40 -translate-y-1/3 translate-x-1/3"></div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                <HeartPulse className="w-9 h-9 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{user?.name}</h1>
                <p className="text-slate-400 text-sm font-semibold tracking-wider uppercase mt-1">
                  PATIENT ID: {user?._id?.slice(-8).toUpperCase() || 'N/A'}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto border-t lg:border-t-0 border-slate-100 pt-6 lg:pt-0">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Blood Group</span>
                <span className="text-lg font-black text-primary-600">{profile?.bloodGroup || 'N/A'}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Consultations</span>
                <span className="text-lg font-black text-slate-800">{totalConsultations}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Last Consult</span>
                <span className="text-sm font-bold text-slate-700 block truncate">
                  {lastConsultation 
                    ? new Date(lastConsultation.appointment?.appointmentDate || lastConsultation.appointmentDate || lastConsultation.createdAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Meds</span>
                <span className="text-lg font-black text-emerald-600">{activePrescriptionsCount}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Sidebar: General Health Profile */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6 lg:col-span-1"
          >
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6 relative">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-500" /> General Health Profile
                </h2>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                  title="Edit Profile"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* General Health Details */}
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Family History</h3>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed italic">
                    {profile?.familyHistory ? `"${profile.familyHistory}"` : 'No significant family history recorded.'}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Allergies</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile?.allergies?.length > 0 ? (
                      profile.allergies.map((a, i) => (
                        <span key={i} className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-semibold border border-red-100">{a}</span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 font-medium">No recorded allergies.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Chronic Conditions</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile?.chronicConditions?.length > 0 ? (
                      profile.chronicConditions.map((c, i) => (
                        <span key={i} className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold border border-amber-100">{c}</span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 font-medium">No chronic conditions recorded.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Active Medications</h3>
                  <div className="space-y-2">
                    {profile?.currentMedications?.length > 0 ? (
                      profile.currentMedications.map((m, i) => (
                        <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                          <span className="font-bold text-slate-800">{m.name}</span>
                          <span className="text-slate-500">{m.dosage} &bull; {m.frequency}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 font-medium">No medications currently active.</span>
                    )}
                  </div>
                </div>

                {/* Uploaded Documents */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                    <span>Medical Documents</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{profile?.documents?.length || 0}</span>
                  </h3>
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                    {profile?.documents?.length > 0 ? (
                      profile.documents.map(doc => (
                        <a 
                          key={doc._id} 
                          href={doc.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:border-primary-200 hover:bg-primary-50/20 transition-all text-xs group"
                        >
                          <FileText className="w-5 h-5 text-primary-500 group-hover:scale-105 transition-transform" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 truncate" title={doc.title}>{doc.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                          </div>
                        </a>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 font-medium py-2">No documents uploaded.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Area: Chronological Medical Records Timeline */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search & Dynamic Filters */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4"
            >
              {/* Text Search */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search consultation records by doctor, specialization, diagnosis..."
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium text-sm text-slate-800"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Dropdown filters grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                {/* Doctor Filter */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Doctor</label>
                  <select
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:border-primary-500"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                  >
                    <option value="all">All Doctors</option>
                    {uniqueDoctors.map(doc => (
                      <option key={doc} value={doc}>{doc}</option>
                    ))}
                  </select>
                </div>

                {/* Specialization Filter */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Specialty</label>
                  <select
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:border-primary-500"
                    value={selectedSpec}
                    onChange={(e) => setSelectedSpec(e.target.value)}
                  >
                    <option value="all">All Specialties</option>
                    {uniqueSpecs.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                {/* Diagnosis Filter */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Diagnosis</label>
                  <select
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:border-primary-500"
                    value={selectedDiag}
                    onChange={(e) => setSelectedDiag(e.target.value)}
                  >
                    <option value="all">All Diagnoses</option>
                    {uniqueDiags.map(diag => (
                      <option key={diag} value={diag}>{diag}</option>
                    ))}
                  </select>
                </div>

                {/* Date Sort Order */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sort Date</label>
                  <select
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:border-primary-500"
                    value={dateOrder}
                    onChange={(e) => setDateOrder(e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>

              </div>
            </motion.div>

            {/* Timeline */}
            <div className="space-y-6">
              {filteredRecords.length > 0 ? (
                <div className="space-y-6 relative pl-6 border-l-2 border-slate-200/80 ml-4 py-2">
                  <AnimatePresence>
                    {filteredRecords.map((record, index) => {
                      const isExpanded = expandedRecordId === record._id;
                      const dateObj = new Date(record.appointment?.appointmentDate || record.appointmentDate || record.createdAt);
                      const isVirtual = record._id.toString().startsWith('virtual_');

                      const docName = record.doctor?.userId?.name || record.doctorId?.userId?.name || 'Doctor';
                      const docSpec = record.doctor?.specialization || record.doctorId?.specialization || 'Specialist';
                      const docHospital = record.doctor?.hospitalName || record.doctorId?.hospitalName || 'Medicare Clinic';

                      return (
                        <motion.div 
                          key={record._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                          className="relative"
                        >
                          {/* Timeline Dot */}
                          <div className={`absolute -left-[35px] top-5 w-4.5 h-4.5 rounded-full border-4 border-white shadow flex items-center justify-center transition-all ${
                            isExpanded ? 'bg-primary-500 scale-125' : 'bg-slate-300'
                          }`} />

                          {/* Record Card */}
                          <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-primary-200 hover:shadow-lg hover:shadow-slate-100/50 transition-all lift-card">
                            
                            {/* Card Top Details */}
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-600 shrink-0">
                                  {docName.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="font-bold text-slate-800 leading-tight">Dr. {docName}</h3>
                                  <p className="text-slate-400 text-xs mt-0.5">{docSpec} &bull; {docHospital}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-bold text-slate-500 block">{dateObj.toLocaleDateString()}</span>
                                <span className="text-[10px] text-slate-400 mt-1 block uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full inline-block">
                                  {record.consultationType || record.appointment?.type || 'in-person'}
                                </span>
                              </div>
                            </div>

                            {/* Core summary */}
                            <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Diagnosis</span>
                                <p className="text-sm text-slate-800 font-medium italic">&ldquo;{record.diagnosis}&rdquo;</p>
                              </div>
                              <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Primary Prescription</span>
                                <p className="text-sm text-slate-600 truncate font-semibold">
                                  {record.prescriptions?.length > 0 
                                    ? record.prescriptions.map(p => p.medicineName).join(', ') 
                                    : 'No prescriptions logged.'}
                                </p>
                              </div>
                            </div>

                            {/* Expandable detailed content */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden mt-5 pt-5 border-t border-slate-100 space-y-5"
                                >
                                  {/* Symptoms */}
                                  <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Reported Symptoms</span>
                                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                                      {record.symptoms || record.appointment?.symptoms || 'Not recorded.'}
                                    </p>
                                  </div>

                                  {/* Prescription Details Table */}
                                  <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Detailed Prescriptions</span>
                                    {record.prescriptions?.length > 0 ? (
                                      <div className="overflow-x-auto rounded-xl border border-slate-100">
                                        <table className="min-w-full divide-y divide-slate-100 text-xs">
                                          <thead className="bg-slate-50">
                                            <tr>
                                              <th className="px-4 py-2 text-left font-bold text-slate-500">Medicine</th>
                                              <th className="px-4 py-2 text-left font-bold text-slate-500">Dosage</th>
                                              <th className="px-4 py-2 text-left font-bold text-slate-500">Frequency</th>
                                              <th className="px-4 py-2 text-left font-bold text-slate-500">Duration</th>
                                              <th className="px-4 py-2 text-left font-bold text-slate-500">Instructions</th>
                                            </tr>
                                          </thead>
                                          <tbody className="bg-white divide-y divide-slate-100">
                                            {record.prescriptions.map((p, idx) => (
                                              <tr key={idx}>
                                                <td className="px-4 py-2.5 font-bold text-slate-800">{p.medicineName}</td>
                                                <td className="px-4 py-2.5 text-slate-600">{p.dosage || '-'}</td>
                                                <td className="px-4 py-2.5 text-slate-600">{p.frequency || '-'}</td>
                                                <td className="px-4 py-2.5 text-slate-600">{p.duration || '-'}</td>
                                                <td className="px-4 py-2.5 text-slate-500 italic">{p.instructions || '-'}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-slate-500 italic">No prescriptions entered.</p>
                                    )}
                                  </div>

                                  {/* Additional advice, tests & notes */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Clinical Notes */}
                                    <div className="bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200">
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Doctor's Notes</span>
                                      <p className="text-xs text-slate-600 leading-relaxed">
                                        {record.doctorNotes || record.notes || 'None recorded.'}
                                      </p>
                                    </div>

                                    {/* Medical Advice */}
                                    <div className="bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200">
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Medical Advice</span>
                                      <p className="text-xs text-slate-600 leading-relaxed">
                                        {record.medicalAdvice || 'None provided.'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    {/* Recommended Tests */}
                                    <div>
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Recommended Medical Tests</span>
                                      <div className="flex flex-wrap gap-1.5">
                                        {record.recommendedTests?.length > 0 ? (
                                          record.recommendedTests.map((t, idx) => (
                                            <span key={idx} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200">{t}</span>
                                          ))
                                        ) : (
                                          <span className="text-xs text-slate-400">None recommended.</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Follow Up */}
                                    <div>
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Follow-up Schedule</span>
                                      {record.followUpDate ? (
                                        <div className="text-xs">
                                          <p className="font-bold text-slate-800">Date: {new Date(record.followUpDate).toLocaleDateString()}</p>
                                          {record.followUpInstructions && (
                                            <p className="text-slate-500 mt-1">{record.followUpInstructions}</p>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-xs text-slate-400">No follow-up required.</span>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Card Footer Actions */}
                            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                              <button 
                                onClick={() => toggleExpandRecord(record._id)}
                                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-all"
                              >
                                {isExpanded ? (
                                  <>Collapse Details <ChevronUp className="w-4 h-4" /></>
                                ) : (
                                  <>View Full Record <ChevronDown className="w-4 h-4" /></>
                                )}
                              </button>

                              <button 
                                onClick={() => generatePdfReport(record, profile, user)}
                                className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:bg-primary-50/50 bg-primary-50 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
                              >
                                <Download className="w-3.5 h-3.5" /> Download Medical Report
                              </button>
                            </div>

                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-8 shadow-inner flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5 border border-slate-100">
                    <FileText className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">No Medical Records Found</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
                    {records.length > 0 
                      ? "No records match your active search filters. Try adjusting them!"
                      : "You don't have any medical reports yet. Consultation reports appear here after your doctor completing visits."}
                  </p>
                  {records.length > 0 && (
                    <button 
                      onClick={() => {setSelectedDoctor('all'); setSelectedSpec('all'); setSelectedDiag('all'); setSearchQuery('')}}
                      className="text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100/70 px-4 py-2.5 rounded-xl transition-all"
                    >
                      Clear Filter Selections
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Edit Health Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col"
            >
              <div className="bg-primary-600 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Edit General Health Profile
                </h3>
                <button 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <MedicalHistoryForm 
                  initialData={profile} 
                  onSaveSuccess={(updated) => {
                    setProfile(updated);
                    setIsEditModalOpen(false);
                    fetchData(); // reload records and details
                  }} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MedicalHistory;
