import React, { useState } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import AppointmentCard from '../components/AppointmentCard';
import { SkeletonCard } from '../components/SkeletonLoader';
import { Calendar, Search, Filter, Plus, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AppointmentsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled

  const { 
    appointments, 
    loading, 
    cancelAppointment 
  } = useAppointments();

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      await cancelAppointment(id);
    }
  };

  const getFilteredAppointments = () => {
    let list = [];
    if (filter === 'all') {
      list = [...(appointments.upcoming || []), ...(appointments.past || []), ...(appointments.cancelled || [])];
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
    
    list.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
    return list;
  };

  const filteredApps = getFilteredAppointments();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Appointments
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Manage your upcoming consultations, past visits, and booking history.
          </p>
        </div>

        <Link 
          to="/find-doctors" 
          className="bg-primary-600 hover:bg-primary-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" /> Book New Appointment
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-darkcard p-4 rounded-3xl border border-slate-200/80 dark:border-darkborder shadow-sm">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-darksurface border border-slate-200 dark:border-darkborder rounded-xl outline-none text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['all', 'upcoming', 'past', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === f 
                  ? 'bg-primary-600 dark:bg-cyan-600 text-white shadow-md' 
                  : 'bg-slate-50 dark:bg-darksurface text-slate-500 dark:text-slate-400 hover:text-slate-900 border border-slate-200/60 dark:border-darkborder'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          /* Empty State */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-darkcard p-12 rounded-3xl border border-slate-200/80 dark:border-darkborder text-center flex flex-col items-center justify-center min-h-[380px]"
          >
            <div className="w-20 h-20 bg-primary-50 dark:bg-cyan-950/40 text-primary-600 dark:text-cyan-400 rounded-3xl flex items-center justify-center mb-4 border border-primary-100 dark:border-cyan-900/50 shadow-md">
              <CalendarDays className="w-10 h-10" />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              No appointments found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium max-w-sm mx-auto mb-6">
              {searchQuery || filter !== 'all' 
                ? 'No visits matched your filter parameters. Try resetting your search or filter tab.'
                : 'You have no booked appointments. Search our directory to schedule a consultation with top specialists.'}
            </p>

            <Link
              to="/find-doctors"
              className="bg-primary-600 hover:bg-primary-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-lg shadow-primary-500/20 transition-all active:scale-95"
            >
              Book Appointment Now
            </Link>
          </motion.div>
        )}
      </div>

    </div>
  );
};

export default AppointmentsPage;
