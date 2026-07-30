import React, { useState, useEffect } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { useMedicalHistory } from '../hooks/useMedicalHistory';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import { 
  Calendar, Search, Activity, Clock, CalendarDays, ArrowRight, 
  CheckCircle, FileText, ChevronRight, Video, MapPin, Pill, 
  Sparkles, Heart, Shield, Bell, User, Plus, Star, Droplets, Dumbbell, Apple, Brain
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DoctorCard from '../components/DoctorCard';
import { SkeletonAnalyticsCard } from '../components/SkeletonLoader';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { appointments, loading: loadingApps, cancelAppointment } = useAppointments();
  const { history, loading: loadingHistory } = useMedicalHistory();

  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    const fetchTopDoctors = async () => {
      try {
        const res = await api.get('/doctors');
        const docs = res.data.data || [];
        setRecommendedDoctors(docs.slice(0, 3));
      } catch (err) {
        console.error('Error fetching recommended doctors:', err);
      } finally {
        setLoadingDocs(false);
      }
    };
    fetchTopDoctors();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quotes = [
    "Health is not valued till sickness comes. Take proactive care of your wellness today.",
    "Small daily habits create long-term health. Stay hydrated, active, and rested.",
    "Your health is an investment, not an expense. Regular checkups protect your future.",
    "Nourish your mind, body, and spirit with balance and healthy choices."
  ];

  const dailyQuote = quotes[new Date().getDate() % quotes.length];

  const nextApp = appointments?.upcoming && appointments.upcoming.length > 0 
    ? appointments.upcoming[0] 
    : null;

  const upcomingCount = appointments?.upcoming?.length || 0;
  const completedCount = appointments?.past?.filter(a => a.status === 'completed').length || appointments?.past?.length || 0;
  const cancelledCount = appointments?.cancelled?.length || 0;
  const totalRecords = history?.length || 0;

  const quickActions = [
    { title: 'Find Doctors', desc: 'Browse 50+ medical specialists', path: '/find-doctors', icon: Search, color: 'text-primary-600 bg-primary-50 dark:bg-cyan-950/40' },
    { title: 'Book Appointment', desc: 'Schedule instant consultation', path: '/find-doctors', icon: CalendarDays, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
    { title: 'Medical History', desc: 'Prescriptions & lab reports', path: '/history', icon: Shield, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
    { title: 'My Profile', desc: 'Update contact & health details', path: '/profile', icon: User, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' }
  ];

  const healthTips = [
    { title: 'Optimal Hydration', desc: 'Drink at least 2.5L of water daily to maintain cognitive focus.', icon: Droplets, color: 'text-cyan-500' },
    { title: 'Daily Movement', desc: '30 minutes of brisk walking lowers cardiovascular risks by 40%.', icon: Dumbbell, color: 'text-emerald-500' },
    { title: 'Balanced Nutrition', desc: 'Include antioxidant-rich leafy greens and fruits in your meals.', icon: Apple, color: 'text-rose-500' },
    { title: 'Mindful Wellness', desc: 'Practice 5-minute deep breathing exercises to lower cortisol levels.', icon: Brain, color: 'text-violet-500' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Welcome Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-darkcard rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-darkborder relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl -mt-16 -mr-16 pointer-events-none" />

        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-cyan-950/40 text-primary-700 dark:text-cyan-400 text-xs font-black uppercase tracking-wider border border-primary-100 dark:border-cyan-900/50">
            <Sparkles className="w-3.5 h-3.5" /> Healthcare Portal
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, <span className="text-primary-600 dark:text-cyan-400">{user?.name?.split(' ')[0] || 'Patient'}</span> 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed italic">
            &ldquo;{dailyQuote}&rdquo;
          </p>
        </div>

        <Link
          to="/find-doctors"
          className="relative z-10 bg-primary-600 hover:bg-primary-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" /> Book Consultation
        </Link>
      </motion.div>

      {/* 2. Upcoming Appointment Hero Card or Empty State */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
            <Calendar className="w-4.5 h-4.5 text-primary-600 dark:text-cyan-400" /> Next Scheduled Consultation
          </h2>
          {nextApp && (
            <Link to="/appointments" className="text-xs font-extrabold text-primary-600 dark:text-cyan-400 hover:underline">
              View All ({upcomingCount})
            </Link>
          )}
        </div>

        {nextApp ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-primary-600 to-primary-800 dark:from-darkcard dark:to-darksurface text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-primary-500/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          >
            <div className="flex items-center gap-5">
              <img 
                src={nextApp.doctorId?.userId?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(nextApp.doctorId?.userId?.name || 'Dr')}&background=fff&color=0D8ABC`}
                alt="doctor" 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/20 shadow-md shrink-0"
              />
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-md">
                  {nextApp.doctorId?.specialization || 'General Specialist'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black">
                  Dr. {nextApp.doctorId?.userId?.name}
                </h3>
                <p className="text-xs opacity-80 font-medium">
                  {nextApp.doctorId?.hospitalName || 'City Medicare Center'}
                </p>
                <div className="flex flex-wrap gap-4 pt-2 text-xs font-bold opacity-95">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-cyan-300" /> {new Date(nextApp.appointmentDate).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-emerald-300" /> {nextApp.timeSlot}</span>
                  <span className="flex items-center gap-1.5 capitalize"><Video className="w-3.5 h-3.5 text-violet-300" /> {nextApp.type || 'In-Person'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <Link 
                to="/appointments"
                className="bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs px-6 py-3 rounded-2xl shadow-md text-center transition-all active:scale-95"
              >
                View Details
              </Link>
              <button
                onClick={() => cancelAppointment(nextApp._id)}
                className="bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs px-5 py-3 rounded-2xl border border-white/20 text-center transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          /* Empty State for Upcoming Appointment */
          <div className="bg-white dark:bg-darkcard rounded-3xl p-8 border border-slate-200/80 dark:border-darkborder text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 bg-primary-50 dark:bg-cyan-950/40 text-primary-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center border border-primary-100 dark:border-cyan-900/50 shadow-inner">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">No Upcoming Appointments</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm font-medium">You don't have any scheduled appointments right now. Find a practitioner and book a visit in seconds.</p>
            </div>
            <Link
              to="/find-doctors"
              className="bg-primary-600 hover:bg-primary-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              Book Appointment Now
            </Link>
          </div>
        )}
      </div>

      {/* 3. Quick Actions Cards */}
      <div className="space-y-3">
        <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider px-1">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link
                key={i}
                to={action.path}
                className="bg-white dark:bg-darkcard rounded-3xl p-6 border border-slate-200/80 dark:border-darkborder shadow-sm hover:shadow-md transition-all group flex items-start gap-4"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${action.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm group-hover:text-primary-600 dark:group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                    {action.title}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-slate-400 dark:text-slate-500 text-[11px] font-semibold truncate">{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4. Stats Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Upcoming Visits', val: upcomingCount, icon: CalendarDays, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40' },
          { label: 'Completed Consults', val: completedCount, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
          { label: 'Cancelled Visits', val: cancelledCount, icon: Clock, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' },
          { label: 'Medical Records', val: totalRecords, icon: FileText, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' }
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white dark:bg-darkcard rounded-2xl p-5 border border-slate-200/80 dark:border-darkborder shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-0.5">{s.label}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{s.val}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Recommended Doctors & Health Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Recommended Doctors (3-4 doctors max) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4.5 h-4.5 text-amber-500 fill-amber-400" /> Recommended Specialists
            </h2>
            <Link to="/find-doctors" className="text-xs font-extrabold text-primary-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
              View All Doctors <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingDocs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkeletonAnalyticsCard />
              <SkeletonAnalyticsCard />
            </div>
          ) : recommendedDoctors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedDoctors.map(doctor => (
                <DoctorCard key={doctor._id} doctor={doctor} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400 italic">No doctors currently listed.</div>
          )}
        </div>

        {/* Right Col: Daily Health Tips */}
        <div className="space-y-4">
          <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 px-1">
            <Activity className="w-4.5 h-4.5 text-emerald-500" /> Daily Health Tips
          </h2>

          <div className="bg-white dark:bg-darkcard rounded-3xl p-6 border border-slate-200/80 dark:border-darkborder shadow-sm space-y-4">
            {healthTips.map((tip, idx) => {
              const Icon = tip.icon;
              return (
                <div key={idx} className="flex items-start gap-3.5 pb-3 border-b border-slate-100 dark:border-darkborder last:border-0 last:pb-0">
                  <div className={`w-9 h-9 rounded-xl bg-slate-50 dark:bg-darksurface flex items-center justify-center shrink-0 ${tip.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{tip.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};

export default PatientDashboard;
