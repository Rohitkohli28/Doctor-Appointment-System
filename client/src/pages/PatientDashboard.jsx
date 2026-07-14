import React, { useState } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { useMedicalHistory } from '../hooks/useMedicalHistory';
import { useAuth } from '../hooks/useAuth';
import AppointmentCard from '../components/AppointmentCard';
import { 
  Calendar, History, Search, Filter, Loader2, LayoutDashboard, 
  Activity, Clock, Pill, CalendarDays, ArrowRight, CheckCircle, FileText, ChevronRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled

  const { 
    appointments, 
    loading: loadingApps, 
    cancelAppointment 
  } = useAppointments();

  const { 
    history, 
    loading: loadingHistory 
  } = useMedicalHistory();

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      await cancelAppointment(id);
    }
  };

  const getFilteredAppointments = () => {
    let list = [];
    if (filter === 'all') {
      list = [...appointments.upcoming, ...appointments.past, ...appointments.cancelled];
    } else {
      list = appointments[filter] || [];
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(app => 
        app.doctorId?.userId?.name?.toLowerCase().includes(q) ||
        app.doctorId?.specialization?.toLowerCase().includes(q) ||
        app.symptoms?.toLowerCase().includes(q)
      );
    }
    
    // Sort appointments: upcoming and past sorted by date
    list.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
    return list;
  };

  const filteredApps = getFilteredAppointments();

  // Stats Calculations
  const upcomingCount = appointments.upcoming?.length || 0;
  const completedCount = appointments.past?.filter(a => a.status === 'completed').length || appointments.past?.length || 0;
  const totalRecords = history?.length || 0;
  
  // Next Appointment Details
  const nextApp = appointments.upcoming && appointments.upcoming.length > 0 
    ? appointments.upcoming[0] 
    : null;

  // Recent Medical Activity Calculations
  const recentConsultation = history && history.length > 0 ? history[0] : null;
  const latestPrescriptions = recentConsultation?.prescriptions || [];
  
  const upcomingFollowUp = history 
    ? history.find(r => r.followUpDate && new Date(r.followUpDate) >= new Date()) 
    : null;

  const stats = [
    { 
      label: 'Upcoming Visits', 
      value: upcomingCount, 
      desc: nextApp ? `Next: ${new Date(nextApp.appointmentDate).toLocaleDateString()}` : 'No upcoming visits', 
      icon: CalendarDays, 
      color: 'text-sky-600 bg-sky-50' 
    },
    { 
      label: 'Completed Consults', 
      value: completedCount, 
      desc: 'Finished consultations', 
      icon: CheckCircle, 
      color: 'text-emerald-600 bg-emerald-50' 
    },
    { 
      label: 'Medical Records', 
      value: totalRecords, 
      desc: 'Chronological timeline entries', 
      icon: FileText, 
      color: 'text-purple-600 bg-purple-50' 
    },
    { 
      label: 'Next Appointment', 
      value: nextApp ? `Dr. ${nextApp.doctorId?.userId?.name?.split(' ')[0]}` : 'None Booked', 
      desc: nextApp ? `${nextApp.timeSlot}` : 'Book one today', 
      icon: Clock, 
      color: 'text-amber-600 bg-amber-50' 
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
          
          <div className="flex items-center gap-5 relative z-10 w-full sm:w-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 p-0.5 shadow-lg shadow-primary-500/10">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-white border-2 border-white flex items-center justify-center font-bold text-2xl text-primary-600">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0)
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-primary-50 text-primary-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-primary-100">Patient Member</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Welcome, {user?.name?.split(' ')[0]}!</h1>
              <p className="text-slate-500 text-sm font-semibold flex items-center gap-1.5 mt-0.5">
                <LayoutDashboard className="w-4 h-4 text-primary-500" /> Manage your appointments and consultations.
              </p>
            </div>
          </div>

          <div className="relative z-10 w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <Link to="/search" className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-7 py-3 rounded-2xl font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all hover:-translate-y-0.5 active:scale-95 text-center flex items-center justify-center gap-2 text-sm">
              <Activity className="w-4.5 h-4.5" /> Book Appointment
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={i} 
                variants={itemVariants}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow group"
              >
                <div>
                  <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">{stat.label}</h3>
                  <p className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                  <p className="text-slate-500 text-xs mt-1 font-medium">{stat.desc}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Main Content Dashboard Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Appointments List */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Filters bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="relative w-full sm:max-w-xs group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search visits..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium text-xs text-slate-800"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
                <Filter className="w-4.5 h-4.5 text-slate-400 flex-shrink-0" />
                {['all', 'upcoming', 'past', 'cancelled'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                      filter === f 
                        ? 'bg-slate-900 border-slate-900 text-white' 
                        : 'bg-white border-slate-200 text-slate-500 hover:border-primary-500 hover:text-primary-600'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="min-h-[400px]">
              {loadingApps ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-12 h-12 border-4 border-primary-50 border-t-primary-600 rounded-full animate-spin"></div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading visits...</p>
                </div>
              ) : filteredApps.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredApps.map(app => (
                    <AppointmentCard 
                      key={app._id} 
                      appointment={app} 
                      onCancel={handleCancel}
                      isDoctor={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-8 shadow-inner flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">No matching appointments</h3>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto mb-6">Adjust your search parameters or book a new medical appointment today.</p>
                  <button onClick={() => {setFilter('all'); setSearchQuery('')}} className="text-xs font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-5 py-2.5 rounded-xl hover:underline">Clear Filters</button>
                </div>
              )}
            </div>

          </div>

          {/* Right panel: Recent Medical Activity */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-500 animate-pulse" /> Recent Medical Activity
              </h2>

              {loadingHistory ? (
                <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div></div>
              ) : recentConsultation ? (
                <div className="space-y-6">
                  
                  {/* Latest Consultation */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Consultation</span>
                      <span className="text-xs text-slate-400 font-semibold">
                        {new Date(recentConsultation.appointment?.appointmentDate || recentConsultation.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-sm text-slate-800">
                          Dr. {recentConsultation.doctor?.userId?.name || recentConsultation.doctorId?.userId?.name || 'Doctor'}
                        </span>
                        <span className="text-[10px] bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          {recentConsultation.doctor?.specialization || recentConsultation.doctorId?.specialization || 'Specialist'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-2 bg-white px-3 py-2 rounded-lg border border-slate-100">
                        &ldquo;{recentConsultation.diagnosis}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Latest Prescription */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Latest Prescribed Medicines</span>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                      {latestPrescriptions.length > 0 ? (
                        latestPrescriptions.slice(0, 3).map((p, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            <Pill className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-slate-800 block truncate">{p.medicineName}</span>
                              <span className="text-[10px] text-slate-500">{p.dosage} &bull; {p.frequency} ({p.duration})</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No prescriptions from this consultation.</p>
                      )}
                    </div>
                  </div>

                  {/* Upcoming Follow-Up */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Upcoming Follow-Up</span>
                    {upcomingFollowUp ? (
                      <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {new Date(upcomingFollowUp.followUpDate).toLocaleDateString()}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                            {upcomingFollowUp.followUpInstructions || 'Follow-up consultation instructions.'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-400 italic">
                        No upcoming follow-ups scheduled.
                      </div>
                    )}
                  </div>

                  {/* Full Records link */}
                  <Link 
                    to="/medical-history" 
                    className="flex justify-between items-center w-full px-4 py-3 bg-primary-50 hover:bg-primary-100/60 rounded-xl text-xs font-bold text-primary-700 transition-colors"
                  >
                    <span>View Detailed Medical Record Dashboard</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>

                </div>
              ) : (
                <div className="text-center py-10 text-xs text-slate-400 italic">
                  No recent health history available yet.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default PatientDashboard;
