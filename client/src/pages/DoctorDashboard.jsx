import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import toast from 'react-hot-toast';
import AppointmentCard from '../components/AppointmentCard';
import { 
  Users, CalendarCheck, Clock, Star, Activity, User, Shield, 
  FileText, Plus, Trash2, X, AlertCircle, Sparkles, CheckCircle2, 
  ChevronDown, ChevronUp, Edit, MapPin, Award, IndianRupee, Languages, 
  BookOpen, Calendar, Filter, Search, Loader2, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorDashboard = ({ view = 'dashboard' }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search/Filter states for Appointments
  const [apptFilter, setApptFilter] = useState({ search: '', status: 'all', date: '' });
  // Search state for Patients
  const [patientSearch, setPatientSearch] = useState('');

  // Consultation Wizard State
  const [consultModal, setConsultModal] = useState({ isOpen: false, appointment: null });
  const [patientData, setPatientData] = useState({ profile: null, records: [], loading: false });
  const [expandedRecordId, setExpandedRecordId] = useState(null);

  // Patient History View Modal (outside consultation wizard)
  const [historyModal, setHistoryModal] = useState({ isOpen: false, patient: null });

  // Consultation Form Fields
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescriptions, setPrescriptions] = useState([
    { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  const [recommendedTests, setRecommendedTests] = useState([]);
  const [newTest, setNewTest] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [medicalAdvice, setMedicalAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpInstructions, setFollowUpInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Availability form state
  const [availabilityList, setAvailabilityList] = useState([]);
  const [savingAvailability, setSavingAvailability] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    specialization: '',
    experience: '',
    consultationFee: '',
    hospitalName: '',
    hospitalAddress: '',
    about: '',
    languages: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const profileRes = await api.get('/doctors/profile/me');
      const docData = profileRes.data.data;
      setDoctorProfile(docData);

      // Pre-fill profile form
      setProfileForm({
        specialization: docData.specialization || '',
        experience: docData.experience || '',
        consultationFee: docData.consultationFee || '',
        hospitalName: docData.hospitalName || '',
        hospitalAddress: docData.hospitalAddress || '',
        about: docData.about || '',
        languages: docData.languages ? docData.languages.join(', ') : ''
      });

      // Pre-fill availability
      if (docData.availableSlots) {
        setAvailabilityList(docData.availableSlots);
      }

      const apptRes = await api.get('/appointments/doctor');
      setAppointments(apptRes.data.data);
    } catch (error) {
      console.error('Dashboard load error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.put(`/appointments/${id}/cancel`);
        toast.success('Appointment cancelled');
        fetchDashboardData();
      } catch (error) {
        toast.error('Failed to cancel appointment');
      }
    }
  };

  const handleStartConsultation = async (appointment) => {
    setConsultModal({ isOpen: true, appointment });
    
    setSymptoms(appointment.symptoms || '');
    setDiagnosis('');
    setPrescriptions([{ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    setRecommendedTests([]);
    setDoctorNotes('');
    setMedicalAdvice('');
    setFollowUpDate('');
    setFollowUpInstructions('');

    setPatientData({ profile: null, records: [], loading: true });
    try {
      const res = await api.get(`/medical-history/patient/${appointment.patientId?._id}`);
      setPatientData({
        profile: res.data.profile,
        records: res.data.records,
        loading: false
      });
    } catch (error) {
      console.error('Failed to load patient history:', error);
      toast.error('Failed to load patient history');
      setPatientData(prev => ({ ...prev, loading: false }));
    }
  };

  const handleOpenHistoryModal = async (patient) => {
    setHistoryModal({ isOpen: true, patient });
    setPatientData({ profile: null, records: [], loading: true });
    try {
      const res = await api.get(`/medical-history/patient/${patient._id}`);
      setPatientData({
        profile: res.data.profile,
        records: res.data.records,
        loading: false
      });
    } catch (error) {
      console.error('Failed to load patient history:', error);
      toast.error('Failed to load patient history');
      setPatientData(prev => ({ ...prev, loading: false }));
    }
  };

  const handleAddMedicine = () => {
    setPrescriptions(prev => [...prev, { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const handleRemoveMedicine = (index) => {
    if (prescriptions.length === 1) {
      toast.error('Please include at least one medicine row.');
      return;
    }
    setPrescriptions(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    setPrescriptions(prev => prev.map((item, idx) => {
      if (idx === index) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleAddTest = (e) => {
    e.preventDefault();
    if (!newTest.trim()) return;
    if (recommendedTests.includes(newTest.trim())) {
      toast.error('Test already added');
      return;
    }
    setRecommendedTests(prev => [...prev, newTest.trim()]);
    setNewTest('');
  };

  const handleRemoveTest = (testName) => {
    setRecommendedTests(prev => prev.filter(t => t !== testName));
  };

  const submitConsultation = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      toast.error('Diagnosis is required.');
      return;
    }

    setSubmitting(true);
    try {
      const activePrescriptions = prescriptions.filter(p => p.medicineName.trim() !== '');
      
      await api.put(`/appointments/${consultModal.appointment._id}/complete`, {
        diagnosis,
        symptoms,
        prescriptions: activePrescriptions,
        doctorNotes,
        recommendedTests,
        medicalAdvice,
        followUpDate: followUpDate || null,
        followUpInstructions,
        consultationType: consultModal.appointment.type || 'in-person'
      });

      toast.success('Consultation completed successfully');
      setConsultModal({ isOpen: false, appointment: null });
      fetchDashboardData();
    } catch (error) {
      console.error('Submit consultation error:', error);
      toast.error('Failed to save consultation');
    } finally {
      setSubmitting(false);
    }
  };

  // Availability Handlers
  const handleAvailabilityToggle = (index) => {
    setAvailabilityList(prev => prev.map((slot, idx) => {
      if (idx === index) {
        return { ...slot, isAvailable: !slot.isAvailable };
      }
      return slot;
    }));
  };

  const handleAvailabilityTimeChange = (index, field, value) => {
    setAvailabilityList(prev => prev.map((slot, idx) => {
      if (idx === index) {
        return { ...slot, [field]: value };
      }
      return slot;
    }));
  };

  const saveAvailability = async () => {
    if (!doctorProfile) return;
    setSavingAvailability(true);
    try {
      await api.put(`/doctors/${doctorProfile._id}`, {
        availableSlots: availabilityList
      });
      toast.success('Availability settings saved successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Save availability error:', error);
      toast.error('Failed to save availability settings');
    } finally {
      setSavingAvailability(false);
    }
  };

  // Profile Handlers
  const saveProfile = async (e) => {
    e.preventDefault();
    if (!doctorProfile) return;
    setSavingProfile(true);
    try {
      // Split languages by comma
      const languagesArray = profileForm.languages
        ? profileForm.languages.split(',').map(l => l.trim()).filter(l => l !== '')
        : [];

      await api.put(`/doctors/${doctorProfile._id}`, {
        ...profileForm,
        languages: languagesArray
      });
      toast.success('Profile updated successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Save profile error:', error);
      toast.error('Failed to update profile settings');
    } finally {
      setSavingProfile(false);
    }
  };

  // Date parsing
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const today = new Date().toLocaleDateString('en-CA');
  const todayAppointments = appointments.filter(app => new Date(app.appointmentDate).toLocaleDateString('en-CA') === today);
  const pendingAppointments = appointments.filter(app => app.status === 'pending' || app.status === 'confirmed');
  const completedAppointments = appointments.filter(app => app.status === 'completed');

  const stats = [
    { label: "Today's Schedule", value: todayAppointments.length, icon: CalendarCheck, color: 'text-sky-600 bg-sky-50' },
    { label: 'Pending / Confirmed', value: pendingAppointments.length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Completed Visits', value: completedAppointments.length, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Total Patients', value: new Set(appointments.map(a => a.patientId?._id).filter(Boolean)).size, icon: Users, color: 'text-purple-600 bg-purple-50' }
  ];

  // Extraction of unique patients
  const uniquePatients = [];
  const seenPatients = new Set();
  appointments.forEach(app => {
    if (app.patientId && !seenPatients.has(app.patientId._id)) {
      seenPatients.add(app.patientId._id);
      uniquePatients.push(app.patientId);
    }
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-emerald-50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {getGreeting()}, Dr. {doctorProfile?.userId?.name || user?.name || 'Workspace'}
            </h1>
            <p className="text-slate-500 font-semibold text-sm">
              {view === 'dashboard' && "Here is your practice overview for today."}
              {view === 'appointments' && "Manage and filter your clinical appointments."}
              {view === 'patients' && "Access and view medical profiles of your patients."}
              {view === 'availability' && "Configure your weekly work days and hour slots."}
              {view === 'profile' && "Keep your credentials, experiences, and details up to date."}
            </p>
          </div>
          <div className="relative z-10 bg-emerald-50 border border-emerald-100 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider text-emerald-800">
             {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Global Loading Spinner */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 gap-3">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            <p className="text-slate-400 font-bold text-sm">Loading clinic records...</p>
          </div>
        ) : (
          <>
            {/* VIEW: DASHBOARD */}
            {view === 'dashboard' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow group">
                        <div>
                          <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">{stat.label}</h3>
                          <p className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${stat.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Dashboard Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Today's appointments */}
                  <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                       Today's Schedule <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">{todayAppointments.length}</span>
                    </h2>
                    
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                      {todayAppointments.length > 0 ? (
                        <div className="divide-y divide-slate-50 p-6 space-y-6">
                           {todayAppointments.sort((a,b) => a.timeSlot.localeCompare(b.timeSlot)).map(app => (
                              <div key={app._id} className="first:pt-0 pt-6">
                                 <AppointmentCard 
                                    appointment={app} 
                                    onCancel={handleCancel}
                                    onComplete={() => handleStartConsultation(app)}
                                    isDoctor={true}
                                 />
                              </div>
                           ))}
                        </div>
                      ) : (
                        <div className="p-16 text-center bg-slate-50/50">
                           <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center border border-slate-100 mb-4 shadow-sm">
                              <CalendarCheck className="w-8 h-8 text-emerald-500" />
                           </div>
                           <p className="text-slate-500 font-bold text-sm">No appointments scheduled for today.</p>
                        </div>
                      )}
                    </div>

                    {/* Upcoming Appointments List (excluding today) */}
                    <div className="pt-6 border-t-2 border-dashed border-slate-200 mt-10">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-slate-800">Upcoming Appointments</h2>
                        <a href="/doctor/appointments" className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-1">
                          View All <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         {pendingAppointments.filter(app => new Date(app.appointmentDate).toLocaleDateString('en-CA') !== today).slice(0, 4).map(app => (
                            <AppointmentCard 
                               key={app._id} 
                               appointment={app} 
                               onCancel={handleCancel}
                               onComplete={() => handleStartConsultation(app)}
                               isDoctor={true}
                            />
                         ))}
                         {pendingAppointments.filter(app => new Date(app.appointmentDate).toLocaleDateString('en-CA') !== today).length === 0 && (
                           <div className="col-span-2 p-10 text-center bg-white border border-slate-100 rounded-2xl text-slate-400 font-medium text-sm">
                             No upcoming bookings scheduled.
                           </div>
                         )}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar stats & quick links */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-3 mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-2 gap-3.5">
                        <a href="/doctor/appointments" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-sky-50 border border-sky-100 text-sky-700 hover:bg-sky-100 transition-all font-bold text-center gap-2 group">
                          <Calendar className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          <span className="text-xs">Schedule</span>
                        </a>
                        <a href="/doctor/patients" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 hover:bg-purple-100 transition-all font-bold text-center gap-2 group">
                          <Users className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          <span className="text-xs">Patients</span>
                        </a>
                        <a href="/doctor/availability" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 hover:bg-amber-100 transition-all font-bold text-center gap-2 group">
                          <Clock className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          <span className="text-xs">Availability</span>
                        </a>
                        <a href="/doctor/profile" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 transition-all font-bold text-center gap-2 group">
                          <User className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          <span className="text-xs">Profile</span>
                        </a>
                      </div>
                    </div>

                    {/* Clinic & Profile overview card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                      <div className="flex flex-col items-center border-b border-slate-100 pb-6 mb-6">
                         <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-50 border border-slate-100 shadow-inner mb-4">
                           <img 
                              src={doctorProfile?.userId?.profilePhoto || user?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Dr')}&background=0D8ABC&color=fff&size=200`} 
                              alt="profile" 
                              className="w-full h-full object-cover" 
                           />
                         </div>
                         <h3 className="text-lg font-black text-slate-800 leading-tight">Dr. {doctorProfile?.userId?.name || user?.name}</h3>
                         <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" /> {doctorProfile?.specialization || 'Healthcare Practitioner'}
                         </p>
                      </div>
                      
                      <div className="space-y-4 text-xs font-medium text-slate-600">
                         <div className="flex justify-between items-center">
                            <span>Portal Access</span>
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                               Active / Approved
                            </span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span>Clinical Experience</span>
                            <span className="font-extrabold text-slate-800">{doctorProfile?.experience || 0} Years</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span>Consultation Fee</span>
                            <span className="font-extrabold text-slate-800">₹{doctorProfile?.consultationFee || 0}</span>
                         </div>
                         <div className="flex justify-between items-start font-bold">
                            <span>Clinic / Hospital</span>
                            <span className="text-slate-800 text-right max-w-[150px] truncate">{doctorProfile?.hospitalName || 'Medicare Clinic'}</span>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: APPOINTMENTS */}
            {view === 'appointments' && (
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search patient by name..." 
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-850"
                      value={apptFilter.search}
                      onChange={(e) => setApptFilter(prev => ({ ...prev, search: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-wrap md:flex-nowrap gap-4">
                    {/* Status Dropdown */}
                    <div className="relative">
                      <select 
                        className="pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700 appearance-none"
                        value={apptFilter.status}
                        onChange={(e) => setApptFilter(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-4 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Date Input */}
                    <input 
                      type="date" 
                      className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
                      value={apptFilter.date}
                      onChange={(e) => setApptFilter(prev => ({ ...prev, date: e.target.value }))}
                    />

                    {/* Clear Button */}
                    {(apptFilter.search || apptFilter.status !== 'all' || apptFilter.date) && (
                      <button 
                        onClick={() => setApptFilter({ search: '', status: 'all', date: '' })}
                        className="px-4 py-3 border border-red-100 hover:bg-red-50 text-red-600 rounded-xl font-bold text-sm transition-all"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Appointments List */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  {(() => {
                    const filtered = appointments.filter(app => {
                      const matchSearch = app.patientId?.name?.toLowerCase().includes(apptFilter.search.toLowerCase());
                      const matchStatus = apptFilter.status === 'all' || app.status === apptFilter.status;
                      const matchDate = !apptFilter.date || new Date(app.appointmentDate).toLocaleDateString('en-CA') === apptFilter.date;
                      return matchSearch && matchStatus && matchDate;
                    });

                    return filtered.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filtered.map(app => (
                          <AppointmentCard 
                            key={app._id} 
                            appointment={app} 
                            onCancel={handleCancel}
                            onComplete={() => handleStartConsultation(app)}
                            isDoctor={true}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 text-center">
                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-400 font-bold text-sm">No appointments matching filters found.</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* VIEW: PATIENTS */}
            {view === 'patients' && (
              <div className="space-y-6">
                {/* Search patients */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="relative group max-w-md">
                    <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search patient by name or email..." 
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-850"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Unique Patients list */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden">
                  {(() => {
                    const filteredPatients = uniquePatients.filter(p => 
                      p.name?.toLowerCase().includes(patientSearch.toLowerCase()) || 
                      p.email?.toLowerCase().includes(patientSearch.toLowerCase())
                    );

                    return filteredPatients.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wider">
                              <th className="py-4 px-4">Patient Name</th>
                              <th className="py-4 px-4">Contact Info</th>
                              <th className="py-4 px-4">Gender</th>
                              <th className="py-4 px-4">DOB</th>
                              <th className="py-4 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {filteredPatients.map(p => (
                              <tr key={p._id} className="hover:bg-slate-50/50 transition-colors text-sm text-slate-700">
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base">
                                      {p.name?.charAt(0)}
                                    </div>
                                    <div>
                                      <div className="font-bold text-slate-800">{p.name}</div>
                                      <div className="text-xs text-slate-400">ID: {p._id?.slice(-8).toUpperCase()}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div>{p.email}</div>
                                  <div className="text-xs text-slate-400 font-medium">{p.phone}</div>
                                </td>
                                <td className="py-4 px-4 capitalize font-semibold">{p.gender || 'N/A'}</td>
                                <td className="py-4 px-4 font-semibold">
                                  {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <button 
                                    onClick={() => handleOpenHistoryModal(p)}
                                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 ml-auto"
                                  >
                                    <FileText className="w-3.5 h-3.5" /> View Clinical History
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-20 text-center">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-400 font-bold text-sm">No patient files found.</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* VIEW: AVAILABILITY */}
            {view === 'availability' && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-8">
                <div className="border-b border-slate-100 pb-5">
                  <h2 className="text-lg font-black text-slate-800">Weekly Active Days & Hours</h2>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Configure available hours for patients to select during booking slots.</p>
                </div>

                <div className="space-y-4 max-w-3xl">
                  {availabilityList.map((slot, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 gap-4 hover:border-emerald-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          id={`chk-${index}`}
                          checked={slot.isAvailable}
                          onChange={() => handleAvailabilityToggle(index)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                        />
                        <label htmlFor={`chk-${index}`} className="font-extrabold text-sm text-slate-700 cursor-pointer w-24">
                          {slot.day}
                        </label>
                      </div>

                      {slot.isAvailable ? (
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                          <span>From:</span>
                          <input 
                            type="time" 
                            value={slot.startTime}
                            onChange={(e) => handleAvailabilityTimeChange(index, 'startTime', e.target.value)}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-white"
                          />
                          <span>To:</span>
                          <input 
                            type="time" 
                            value={slot.endTime}
                            onChange={(e) => handleAvailabilityTimeChange(index, 'endTime', e.target.value)}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-white"
                          />
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 italic">Off duty / Unavailable</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-5 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={saveAvailability}
                    disabled={savingAvailability}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/10 active:scale-95 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {savingAvailability ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        Save Availability
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* VIEW: PROFILE */}
            {view === 'profile' && (
              <form onSubmit={saveProfile} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-8">
                <div className="border-b border-slate-100 pb-5">
                  <h2 className="text-lg font-black text-slate-800">Professional Credentials & Bio</h2>
                  <p className="text-xs font-semibold text-slate-400 mt-1">This information is visible to patients seeking appointments.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Specialization</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Cardiologist, Dermatologist"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm font-semibold text-slate-800"
                      value={profileForm.specialization}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, specialization: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Clinical Experience (Years)</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      placeholder="e.g. 10"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm font-semibold text-slate-800"
                      value={profileForm.experience}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, experience: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Consultation Fee (INR)</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold">
                        ₹
                      </div>
                      <input 
                        type="number" 
                        required
                        min="0"
                        placeholder="e.g. 500"
                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm font-semibold text-slate-800"
                        value={profileForm.consultationFee}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, consultationFee: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Languages Spoken (comma-separated)</label>
                    <input 
                      type="text" 
                      placeholder="English, Hindi, Spanish"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm font-semibold text-slate-800"
                      value={profileForm.languages}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, languages: e.target.value }))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Hospital / Clinic Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Apollo Hospital, City Clinic"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm font-semibold text-slate-800"
                      value={profileForm.hospitalName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, hospitalName: e.target.value }))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Hospital Address</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Street, Area, City, Pincode"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm font-semibold text-slate-800"
                      value={profileForm.hospitalAddress}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, hospitalAddress: e.target.value }))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Professional Bio / About</label>
                    <textarea 
                      rows="4"
                      placeholder="Tell patients about your medical background, philosophies, certifications..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm font-semibold text-slate-800"
                      value={profileForm.about}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, about: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-100 flex justify-end">
                  <button 
                    type="submit"
                    disabled={savingProfile}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/10 active:scale-95 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        Save Profile Settings
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>

      {/* Consultation Wizard Split Screen Modal (Emerald theme) */}
      <AnimatePresence>
        {consultModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <h3 className="font-black text-lg">Clinical Consultation Panel</h3>
                </div>
                <button 
                  onClick={() => setConsultModal({ isOpen: false, appointment: null })} 
                  className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Split Content */}
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
                
                {/* Left Pane: Patient Health profile & timeline (width 2/5) */}
                <div className="w-full md:w-2/5 overflow-y-auto p-6 bg-slate-50/50 space-y-6 custom-scrollbar">
                  
                  {/* Patient Demographics */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3.5">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
                      Patient Demographics
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                        {consultModal.appointment?.patientId?.name?.charAt(0)}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm">{consultModal.appointment?.patientId?.name}</h5>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">ID: {consultModal.appointment?.patientId?._id?.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-50">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Blood Group</span>
                        <span className="font-bold text-slate-700">{patientData.profile?.bloodGroup || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Allergies</span>
                        <p className="font-bold text-red-655 truncate">
                          {patientData.profile?.allergies?.length > 0 ? patientData.profile.allergies.join(', ') : 'None'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
                      Medical Profile Summary
                    </h4>
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase mb-1">Chronic Conditions</span>
                        <div className="flex flex-wrap gap-1">
                          {patientData.profile?.chronicConditions?.length > 0 ? (
                            patientData.profile.chronicConditions.map((c, idx) => (
                              <span key={idx} className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded text-[10px] font-bold">{c}</span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">None recorded.</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase mb-0.5">Family Health History</span>
                        <p className="text-slate-600 leading-relaxed italic">{patientData.profile?.familyHistory || 'No history recorded.'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline History */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
                      Clinical Consultation History ({patientData.records?.length || 0})
                    </h4>
                    
                    {patientData.loading ? (
                      <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-emerald-600 animate-spin" /></div>
                    ) : patientData.records?.length > 0 ? (
                      <div className="space-y-4 pl-4 border-l border-slate-200 ml-2 py-1">
                        {patientData.records.map(record => {
                          const isExpanded = expandedRecordId === record._id;
                          const recordDate = new Date(record.appointment?.appointmentDate || record.createdAt).toLocaleDateString();
                          return (
                            <div key={record._id} className="relative text-xs">
                              <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 border border-white" />
                              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2">
                                <div className="flex justify-between items-start">
                                  <span className="font-bold text-slate-800">Dr. {record.doctor?.userId?.name || record.doctorId?.userId?.name || 'Practitioner'}</span>
                                  <span className="text-[10px] text-slate-400">{recordDate}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-semibold uppercase">{record.doctor?.specialization || 'Clinical'}</div>
                                <p className="text-slate-600 italic bg-slate-50 px-2 py-1 rounded leading-relaxed mt-1">
                                  &ldquo;{record.diagnosis}&rdquo;
                                </p>
                                
                                <button 
                                  onClick={() => setExpandedRecordId(isExpanded ? null : record._id)}
                                  className="text-[10px] text-emerald-600 font-bold hover:underline pt-1 block"
                                >
                                  {isExpanded ? 'Hide Details' : 'View Full Record Details'}
                                </button>

                                {isExpanded && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="overflow-hidden space-y-2 pt-2 border-t border-slate-50 text-[11px]"
                                  >
                                    <div>
                                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Symptoms</span>
                                      <p className="text-slate-600">{record.symptoms || 'Not entered.'}</p>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Medicines</span>
                                      {record.prescriptions?.map((p, idx) => (
                                        <div key={idx} className="font-semibold text-slate-800 ml-1 mt-0.5">
                                          &bull; {p.medicineName} ({p.dosage} - {p.frequency})
                                        </div>
                                      )) || <p className="text-slate-400 italic">None prescribed.</p>}
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Doctor Notes</span>
                                      <p className="text-slate-600">{record.doctorNotes || record.notes || 'None.'}</p>
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-4">No previous consultations logged.</p>
                    )}
                  </div>
                </div>

                {/* Right Pane: Consultation wizard form (width 3/5) */}
                <form onSubmit={submitConsultation} className="w-full md:w-3/5 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                  {/* Diagnosis */}
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                      Clinical Diagnosis <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acute Viral Bronchitis, Migraine Headaches..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold text-sm text-slate-800"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                    />
                  </div>

                  {/* Symptoms */}
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                      Symptoms / Reason for Visit
                    </label>
                    <textarea
                      placeholder="Symptoms reported by patient..."
                      rows="2"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-xs text-slate-800"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                    />
                  </div>

                  {/* Prescriptions */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">
                        Prescription Medicines
                      </label>
                      <button
                        type="button"
                        onClick={handleAddMedicine}
                        className="text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5 flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Medicine
                      </button>
                    </div>

                    <div className="space-y-3.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                      {prescriptions.map((p, index) => (
                        <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3 relative">
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(index)}
                            className="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Medicine Name</label>
                              <input
                                type="text"
                                placeholder="e.g. Paracetamol"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none text-xs font-bold text-slate-800"
                                value={p.medicineName}
                                onChange={(e) => handleMedicineChange(index, 'medicineName', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Dosage</label>
                              <input
                                type="text"
                                placeholder="e.g. 500mg"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none text-xs font-semibold text-slate-800"
                                value={p.dosage}
                                onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Frequency</label>
                              <input
                                type="text"
                                placeholder="e.g. Twice daily"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none text-xs font-semibold text-slate-800"
                                value={p.frequency}
                                onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Duration</label>
                              <input
                                type="text"
                                placeholder="e.g. 5 days"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none text-xs font-semibold text-slate-800"
                                value={p.duration}
                                onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Instructions</label>
                              <input
                                type="text"
                                placeholder="e.g. After food"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none text-xs font-semibold text-slate-800"
                                value={p.instructions}
                                onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Tests */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">
                      Recommended Medical Tests
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. CBC, Chest X-Ray"
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-xs font-semibold text-slate-800"
                        value={newTest}
                        onChange={(e) => setNewTest(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { handleAddTest(e); } }}
                      />
                      <button
                        type="button"
                        onClick={handleAddTest}
                        className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-slate-800 active:scale-95 transition-all"
                      >
                        Add Test
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {recommendedTests.map(test => (
                        <span 
                          key={test} 
                          className="bg-emerald-50 text-emerald-600 border border-emerald-100 pl-3 pr-1.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 hover:border-red-200 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors group"
                          onClick={() => handleRemoveTest(test)}
                        >
                          {test}
                          <X className="w-3.5 h-3.5 text-emerald-400 group-hover:text-red-500 transition-colors" />
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Notes & Advice */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                        Doctor Clinical Notes
                      </label>
                      <textarea
                        placeholder="Diagnosis details, clinical observations..."
                        rows="2.5"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-xs text-slate-800"
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                        Lifestyle Advice
                      </label>
                      <textarea
                        placeholder="Dietary guidelines, activity constraints..."
                        rows="2.5"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-xs text-slate-800"
                        value={medicalAdvice}
                        onChange={(e) => setMedicalAdvice(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Follow Up */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                        Follow-Up Date
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-xs font-semibold text-slate-800"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                        Follow-Up Instructions
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Review blood report"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-xs font-medium text-slate-800"
                        value={followUpInstructions}
                        onChange={(e) => setFollowUpInstructions(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Form Footer */}
                  <div className="flex gap-3 justify-end pt-5 border-t border-slate-100 shrink-0">
                    <button 
                      type="button" 
                      onClick={() => setConsultModal({ isOpen: false, appointment: null })} 
                      className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors text-xs uppercase"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-xs uppercase flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>Saving Consultation...</>
                      ) : (
                        <>Save & Complete</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Patient History Viewer Modal (outside consultation wizard) */}
      <AnimatePresence>
        {historyModal.isOpen && historyModal.patient && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <h3 className="font-black text-lg">Patient Clinical File: {historyModal.patient.name}</h3>
                </div>
                <button 
                  onClick={() => setHistoryModal({ isOpen: false, patient: null })} 
                  className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* History Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
                
                {/* Profile demographics details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left demographics block */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3.5">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Demographics</h4>
                    <div className="space-y-2 text-xs font-semibold text-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-450 block uppercase">Blood Group</span>
                        <span>{patientData.profile?.bloodGroup || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-450 block uppercase">Gender</span>
                        <span className="capitalize">{historyModal.patient.gender || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-450 block uppercase">Phone Number</span>
                        <span>{historyModal.patient.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle allergies block */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3.5">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Allergies</h4>
                    <p className="text-xs font-bold text-red-600 leading-relaxed">
                      {patientData.profile?.allergies?.length > 0 ? patientData.profile.allergies.join(', ') : 'No known drug or lifestyle allergies recorded.'}
                    </p>
                  </div>

                  {/* Right conditions block */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3.5">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Chronic Conditions</h4>
                    <div className="flex flex-wrap gap-1">
                      {patientData.profile?.chronicConditions?.length > 0 ? (
                        patientData.profile.chronicConditions.map((c, idx) => (
                          <span key={idx} className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded text-[10px] font-bold">{c}</span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-xs">No chronic conditions declared.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline History */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Consultation Log history</h4>
                  
                  {patientData.loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-emerald-600 animate-spin" /></div>
                  ) : patientData.records?.length > 0 ? (
                    <div className="space-y-4 pl-4 border-l border-slate-200 ml-2 py-1">
                      {patientData.records.map(record => {
                        const isExpanded = expandedRecordId === record._id;
                        const recordDate = new Date(record.appointment?.appointmentDate || record.createdAt).toLocaleDateString();
                        return (
                          <div key={record._id} className="relative text-xs">
                            <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 border border-white" />
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2">
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-slate-800">Dr. {record.doctor?.userId?.name || record.doctorId?.userId?.name || 'Practitioner'}</span>
                                <span className="text-[10px] text-slate-450">{recordDate}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-semibold uppercase">{record.doctor?.specialization || 'Clinical'}</div>
                              <p className="text-slate-600 italic bg-slate-50 px-2 py-1 rounded leading-relaxed mt-1">
                                &ldquo;{record.diagnosis}&rdquo;
                              </p>
                              
                              <button 
                                onClick={() => setExpandedRecordId(isExpanded ? null : record._id)}
                                className="text-[10px] text-emerald-650 font-bold hover:underline pt-1 block"
                              >
                                {isExpanded ? 'Hide Details' : 'View Full Details'}
                              </button>

                              {isExpanded && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="overflow-hidden space-y-2 pt-2 border-t border-slate-50 text-[11px]"
                                >
                                  <div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Symptoms</span>
                                    <p className="text-slate-650">{record.symptoms || 'Not entered.'}</p>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Medicines</span>
                                    {record.prescriptions?.map((p, idx) => (
                                      <div key={idx} className="font-semibold text-slate-800 ml-1 mt-0.5">
                                        &bull; {p.medicineName} ({p.dosage} - {p.frequency})
                                      </div>
                                    )) || <p className="text-slate-400 italic">None prescribed.</p>}
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Notes & Recommendations</span>
                                    <p className="text-slate-650">{record.doctorNotes || record.notes || 'None.'}</p>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-4">No historical logs exist for this patient file.</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end shrink-0">
                <button 
                  onClick={() => setHistoryModal({ isOpen: false, patient: null })}
                  className="px-6 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wide rounded-xl transition-all"
                >
                  Close File
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorDashboard;
