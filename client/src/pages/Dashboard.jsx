import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import toast from 'react-hot-toast';
import AppointmentCard from '../components/AppointmentCard';
import { Calendar, CalendarCheck, CalendarOff, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState({ upcoming: [], past: [], cancelled: [] });
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments/my');
      setAppointments(res.data.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.put(`/appointments/${id}/cancel`);
        toast.success('Appointment cancelled');
        fetchAppointments();
      } catch (error) {
        toast.error('Failed to cancel appointment');
      }
    }
  };

  const stats = [
    { label: 'Total Visits', value: appointments.upcoming.length + appointments.past.length + appointments.cancelled.length, icon: Calendar, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Upcoming', value: appointments.upcoming.length, icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Cancelled', value: appointments.cancelled.length, icon: CalendarOff, color: 'text-rose-600', bg: 'bg-rose-50' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
           
           <div className="flex items-center gap-6 relative z-10 w-full">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-primary-100 flex-shrink-0 border-4 border-white shadow-md">
                 {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary-600 text-3xl font-bold bg-primary-50">
                       {user?.name?.charAt(0)}
                    </div>
                 )}
              </div>
              <div>
                 <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Welcome back, {user?.name}!</h1>
                 <p className="text-gray-500 font-medium">Manage your appointments and medical records from here.</p>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto">
              <Link to="/search" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all text-center whitespace-nowrap">
                 Book New Visit
              </Link>
           </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:border-primary-200 transition-colors">
                 <div>
                    <h3 className="text-gray-500 font-semibold mb-2 uppercase tracking-wider text-sm">{stat.label}</h3>
                    <p className="text-4xl font-extrabold text-gray-900">{stat.value}</p>
                 </div>
                 <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                 </div>
              </div>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           
           <div className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="flex overflow-x-auto border-b border-gray-100 custom-scrollbar">
                    {['upcoming', 'past', 'cancelled'].map(tab => (
                       <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-8 py-5 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap
                             ${activeTab === tab 
                                ? 'border-b-2 border-primary-600 text-primary-600 bg-primary-50/50' 
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 border-b-2 border-transparent'
                             }`
                          }
                       >
                          {tab} Appointments ({appointments[tab]?.length || 0})
                       </button>
                    ))}
                 </div>

                 <div className="p-6 md:p-8">
                    {loading ? (
                       <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div></div>
                    ) : appointments[activeTab]?.length > 0 ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                          {appointments[activeTab].map(app => (
                             <AppointmentCard 
                               key={app._id} 
                               appointment={app} 
                               onCancel={handleCancel}
                               isDoctor={false}
                             />
                          ))}
                       </div>
                    ) : (
                       <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 animate-in fade-in">
                          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4 border border-gray-200 shadow-sm">
                             <Calendar className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">No {activeTab} appointments</h3>
                          <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">You don't have any appointments in this category right now.</p>
                          {activeTab === 'upcoming' && (
                             <Link to="/search" className="inline-block text-primary-600 font-bold border-2 border-primary-600 hover:bg-primary-50 px-6 py-2.5 rounded-xl transition-colors">
                                Browse Doctors
                             </Link>
                          )}
                       </div>
                    )}
                 </div>
              </div>
           </div>

           <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200 text-center shadow-inner relative overflow-hidden group">
                 <Activity className="absolute -right-6 -bottom-6 w-32 h-32 text-emerald-500 opacity-10 group-hover:scale-110 transition-transform duration-500" />
                 <h3 className="font-bold text-emerald-900 mb-3 text-lg relative z-10 tracking-tight">Health Records</h3>
                 <p className="text-sm text-emerald-800/80 mb-6 leading-relaxed relative z-10 font-medium">Keep your medical history and test reports up to date for better diagnosis.</p>
                 <Link to="/medical-history" className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all text-center relative z-10 hover:-translate-y-0.5">
                    View History
                 </Link>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
