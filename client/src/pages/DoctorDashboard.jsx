import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import toast from 'react-hot-toast';
import AppointmentCard from '../components/AppointmentCard';
import { Users, CalendarCheck, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [completeModal, setCompleteModal] = useState({ isOpen: false, appointmentId: null });
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Assuming doctor's ID is tied to userId
      const profileRes = await api.get('/auth/me'); // Just to get full user or need specific doctor endpoint? 
      // We don't have a specific GET /doctors/me, so we can fetch all appointments and calculate stats
      const apptRes = await api.get('/appointments/doctor');
      setAppointments(apptRes.data.data);
      
      // For doctor profile, since we don't have an exact endpoint, we can rely on user details 
      // or find by user ID in doctors list. Let's assume we fetch all doctors and find this one.
      const docListRes = await api.get('/doctors');
      const myProfile = docListRes.data.data.find(d => d.userId._id === user._id);
      setDoctorProfile(myProfile);

    } catch (error) {
      toast.error('Failed to load dashboard');
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

  const handleCompleteClick = (appointment) => {
    setCompleteModal({ isOpen: true, appointmentId: appointment._id });
  };

  const submitComplete = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/appointments/${completeModal.appointmentId}/complete`, {
        prescription,
        notes
      });
      toast.success('Appointment marked as completed');
      setCompleteModal({ isOpen: false, appointmentId: null });
      setPrescription('');
      setNotes('');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to complete appointment');
    }
  };

  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
  const todayAppointments = appointments.filter(app => new Date(app.appointmentDate).toLocaleDateString('en-CA') === today);
  const pendingAppointments = appointments.filter(app => app.status === 'pending' || app.status === 'confirmed');

  const stats = [
    { label: "Today's Schedule", value: todayAppointments.length, icon: CalendarCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Pending', value: pendingAppointments.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Patients', value: new Set(appointments.map(a => a.patientId?._id)).size, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Rating', value: doctorProfile?.rating || 0, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Doctor Dashboard</h1>
            <p className="text-gray-500 font-medium text-lg mt-2">Manage your schedule and patients</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-xl border border-gray-100 shadow-sm font-semibold tracking-wider text-primary-600">
             {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-all group">
                 <div className={`w-14 h-14 rounded-full ${stat.bg} flex justify-center items-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                 </div>
                 <div>
                    <h3 className="text-gray-500 font-medium text-sm tracking-wider uppercase mb-1">{stat.label}</h3>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                 </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
               Today's Schedule <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">{todayAppointments.length}</span>
            </h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               {loading ? (
                  <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div></div>
               ) : todayAppointments.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                     {todayAppointments.sort((a,b) => a.timeSlot.localeCompare(b.timeSlot)).map(app => (
                        <div key={app._id} className="p-6">
                           <AppointmentCard 
                              appointment={app} 
                              onCancel={handleCancel}
                              onComplete={() => handleCompleteClick(app)}
                              isDoctor={true}
                           />
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="p-12 text-center bg-gray-50 border-t border-gray-100">
                     <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center border border-gray-100 mb-4 shadow-sm">
                        <CalendarCheck className="w-8 h-8 text-primary-400" />
                     </div>
                     <p className="text-gray-500 font-medium">No appointments scheduled for today.</p>
                  </div>
               )}
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-6 pt-4 border-t-2 border-dashed border-gray-200 mt-10">Upcoming Appointments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
               {pendingAppointments.filter(app => new Date(app.appointmentDate).toLocaleDateString('en-CA') !== today).slice(0, 4).map(app => (
                  <AppointmentCard 
                     key={app._id} 
                     appointment={app} 
                     onCancel={handleCancel}
                     onComplete={() => handleCompleteClick(app)}
                     isDoctor={true}
                  />
               ))}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
             {/* Doctor Profile Summary */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <div className="flex flex-col items-center border-b border-gray-100 pb-6 mb-6">
                   <img src={user?.profilePhoto || 'https://via.placeholder.com/150'} alt="profile" className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-primary-50" />
                   <h3 className="text-lg font-bold text-gray-900">Dr. {user?.name}</h3>
                   <p className="text-primary-600 text-sm font-semibold">{doctorProfile?.specialization || 'Specialization'}</p>
                </div>
                
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Status</span>
                      <span className={`px-2 py-1 rounded capitalize font-medium ${doctorProfile?.isApproved ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                         {doctorProfile?.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Experience</span>
                      <span className="font-semibold text-gray-900">{doctorProfile?.experience || 0} Years</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Total Reviews</span>
                      <span className="font-semibold text-gray-900">{doctorProfile?.totalReviews || 0}</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Complete Appointment Modal */}
      {completeModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-primary-600 p-4 shrink-0 flex items-center justify-between">
               <h3 className="text-lg font-bold text-white">Complete Consultation</h3>
               <button onClick={() => setCompleteModal({isOpen: false, appointmentId: null})} className="text-white hover:text-gray-200 transition-colors">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            <form onSubmit={submitComplete} className="p-6 space-y-5 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Prescription</label>
                <textarea 
                  required
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  rows="4" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder-gray-400 font-medium"
                  placeholder="Medication names, dosage, duration..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Doctor's Notes</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder-gray-400 font-medium"
                  placeholder="Diagnosis, dietary advice, follow-up instructions..."
                ></textarea>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setCompleteModal({isOpen: false, appointmentId: null})} className="px-6 py-2.5 font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5">Save & Complete</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
