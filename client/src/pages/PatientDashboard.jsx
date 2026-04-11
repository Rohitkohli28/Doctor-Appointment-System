import React, { useState } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { useMedicalHistory } from '../hooks/useMedicalHistory';
import { useAuth } from '../hooks/useAuth';
import AppointmentCard from '../components/AppointmentCard';
import MedicalRecordCard from '../components/MedicalRecordCard';
import { Calendar, History, Search, Filter, Loader2, LayoutDashboard, User, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled for appointments

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

  const filteredAppointments = () => {
    let list = [];
    if (filter === 'all') {
      list = [...appointments.upcoming, ...appointments.past, ...appointments.cancelled];
    } else {
      list = appointments[filter] || [];
    }

    if (searchQuery) {
      list = list.filter(app => 
        app.doctorId?.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.doctorId?.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  };

  const filteredHistory = () => {
    if (!searchQuery) return history;
    return history.filter(record => 
      record.doctorId?.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const tabs = [
    { id: 'appointments', label: 'My Appointments', icon: Calendar },
    { id: 'history', label: 'Medical History', icon: History }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="bg-white rounded-[2rem] p-8 mb-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
            
            <div className="flex items-center gap-6 relative z-10 w-full sm:w-auto">
               <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] bg-gradient-to-br from-primary-500 to-primary-600 p-1 shadow-xl shadow-primary-500/20 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="w-full h-full rounded-[1.2rem] overflow-hidden bg-white border-4 border-white">
                     {user?.profilePhoto ? (
                        <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary-600 text-3xl font-extrabold bg-primary-50">
                           {user?.name?.charAt(0)}
                        </div>
                     )}
                  </div>
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-1">
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-200">Patient Dashboard</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">Welcome, {user?.name?.split(' ')[0]}!</h1>
                  <p className="text-slate-500 font-semibold flex items-center gap-1.5 mt-1">
                      <LayoutDashboard className="w-4 h-4 text-primary-500" /> Manage your health journey here.
                  </p>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full md:w-auto">
               <div className="bg-slate-50/80 backdrop-blur-sm p-1.5 rounded-2xl flex border border-slate-100 shadow-inner w-full sm:w-auto">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                          activeTab === tab.id 
                            ? 'bg-white text-primary-600 shadow-md ring-1 ring-slate-100' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary-600 shadow-sm' : ''}`} />
                        {tab.label}
                      </button>
                    );
                  })}
               </div>
               <Link to="/search" className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-2xl shadow-primary-500/30 transition-all hover:-translate-y-1 active:scale-95 text-center flex items-center justify-center gap-2">
                  <Activity className="w-5 h-5" /> Book Appointment
               </Link>
            </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
            <div className="relative w-full lg:max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                    type="text"
                    placeholder={`Search ${activeTab === 'appointments' ? 'by doctor or specialization' : 'by diagnosis or doctor'}...`}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all shadow-sm font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {activeTab === 'appointments' && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 w-full lg:w-auto">
                    <Filter className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    {['all', 'upcoming', 'past', 'cancelled'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                                filter === f 
                                ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' 
                                : 'bg-white border-slate-200 text-slate-500 hover:border-primary-500 hover:text-primary-600'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {activeTab === 'appointments' ? (
            loadingApps ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary-50 border-t-primary-600 rounded-full animate-spin"></div>
                    <Loader2 className="w-8 h-8 text-primary-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Fetching your appointments</p>
              </div>
            ) : filteredAppointments().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in slide-in-from-bottom-5 duration-700">
                {filteredAppointments().map(app => (
                  <AppointmentCard 
                    key={app._id} 
                    appointment={app} 
                    onCancel={handleCancel}
                    isDoctor={false}
                  />
                ))}
              </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-inner flex flex-col items-center animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-slate-500/5">
                        <Calendar className="w-12 h-12 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">No matching appointments</h3>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">We couldn't find any appointments that match your current search or filter. Try adjusting them!</p>
                    <button onClick={() => {setFilter('all'); setSearchQuery('')}} className="text-primary-600 font-black uppercase tracking-widest text-xs hover:underline bg-primary-50 px-6 py-3 rounded-xl transition-all">Clear all filters</button>
                </div>
            )
          ) : (
            loadingHistory ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 animate-in fade-in duration-500">
                 <div className="w-16 h-16 border-4 border-emerald-50 border-t-emerald-500 rounded-full animate-spin"></div>
                 <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Retrieving medical records</p>
              </div>
            ) : filteredHistory().length > 0 ? (
              <div className="grid grid-cols-1 gap-8 animate-in slide-in-from-bottom-5 duration-700">
                {filteredHistory().map(record => (
                  <MedicalRecordCard key={record._id} record={record} />
                ))}
              </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-inner flex flex-col items-center animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-slate-500/5">
                        <History className="w-12 h-12 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">No medical records yet</h3>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">Your medical history will appear here once you complete your consultations with our doctors.</p>
                </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
