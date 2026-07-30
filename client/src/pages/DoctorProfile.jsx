import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Building2, Clock, IndianRupee, Languages, Info, Award, Calendar, CheckCircle2, GraduationCap, Trophy } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const [docRes, reviewRes] = await Promise.all([
          api.get(`/doctors/${id}`),
          api.get(`/doctors/${id}/reviews`)
        ]);
        setDoctor(docRes.data.data);
        setReviews(reviewRes.data.data || []);
      } catch (error) {
        console.error("Error fetching doctor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const handleBook = () => {
    if (!isAuthenticated) return navigate('/login');
    if (user?.role === 'doctor') return alert('Doctors cannot book appointments');
    navigate(`/book/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-primary-100 dark:border-slate-800 border-t-primary-600 dark:border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold">
        Doctor profile not found
      </div>
    );
  }

  const photo = doctor.userId?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.userId?.name || 'Dr')}&background=0D8ABC&color=fff&size=200`;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-20 transition-colors duration-300">
      
      {/* Header Profile Section */}
      <div className="bg-white dark:bg-darkcard border-b border-slate-200/80 dark:border-darkborder pt-10 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
             
             {/* Doctor Avatar */}
             <div className="w-32 h-32 md:w-40 md:h-40 relative group shrink-0">
                <img 
                  src={photo} 
                  alt={doctor.userId?.name} 
                  className="w-full h-full object-cover rounded-3xl shadow-lg border-4 border-white dark:border-darkbg group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -bottom-3 -right-2 bg-white dark:bg-darksurface px-3 py-1 rounded-xl text-xs font-black text-amber-500 shadow-md flex items-center gap-1 border border-slate-100 dark:border-darkborder">
                   <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                   {doctor.rating || '4.8'}
                </div>
             </div>

             {/* Meta Header */}
             <div className="flex-1 space-y-4 w-full">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 w-full">
                   <div>
                      <div className="inline-flex items-center gap-1.5 bg-primary-50 dark:bg-cyan-950/40 text-primary-700 dark:text-cyan-400 text-xs font-extrabold px-3.5 py-1 rounded-full mb-2 uppercase tracking-wide border border-primary-100 dark:border-cyan-900/50">
                        {doctor.specialization}
                      </div>
                      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                        Dr. {doctor.userId?.name}
                      </h1>
                      <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">
                        {doctor.qualifications?.join(', ') || 'MBBS, MD'}
                      </p>
                   </div>
                   
                   <div className="flex flex-col gap-2 min-w-[200px]">
                      <button 
                         onClick={handleBook}
                         className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white px-8 py-3.5 rounded-2xl font-extrabold text-sm transition-all shadow-lg shadow-primary-500/20 hover:scale-[1.02] active:scale-95"
                      >
                         Book Appointment
                      </button>
                      <div className="text-center text-xs font-bold text-slate-700 dark:text-slate-300">
                         Consultation Fee: <span className="text-primary-600 dark:text-cyan-400 text-sm font-extrabold">₹{doctor.consultationFee || 500}</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-darkborder text-xs font-semibold">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-cyan-950/40 text-primary-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                         <Clock className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase">Experience</p>
                         <p className="font-extrabold text-slate-900 dark:text-white">{doctor.experience || 5} Years Exp.</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                         <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase">Hospital</p>
                         <p className="font-extrabold text-slate-900 dark:text-white truncate max-w-[150px]">{doctor.hospitalName || 'City Medical Center'}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                         <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase">Location</p>
                         <p className="font-extrabold text-slate-900 dark:text-white truncate max-w-[150px]">{doctor.hospitalAddress || 'Main Street'}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                         <Languages className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase">Languages</p>
                         <p className="font-extrabold text-slate-900 dark:text-white truncate max-w-[150px]">{doctor.languages?.join(', ') || 'English, Hindi'}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Profile Tabs Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
           
           {/* Left Content Column */}
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-darkcard rounded-3xl shadow-sm border border-slate-200/80 dark:border-darkborder overflow-hidden">
                 
                 {/* Tabs Navigation */}
                 <div className="flex border-b border-slate-100 dark:border-darkborder overflow-x-auto no-scrollbar">
                    {[
                      { id: 'overview', label: 'Overview & Bio', icon: Info },
                      { id: 'timeline', label: 'Education & Career', icon: GraduationCap },
                      { id: 'awards', label: 'Certifications', icon: Trophy },
                      { id: 'reviews', label: `Reviews (${reviews.length})`, icon: Star }
                    ].map(tab => {
                      const Icon = tab.icon;
                      return (
                        <button 
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex-1 py-4 px-6 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 border-b-2 ${
                            activeTab === tab.id 
                              ? 'border-primary-600 dark:border-cyan-400 text-primary-600 dark:text-cyan-400 bg-primary-50/40 dark:bg-cyan-950/20' 
                              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                 </div>

                 {/* Tab Panes */}
                 <div className="p-8">
                    {activeTab === 'overview' && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                          <div>
                             <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <Info className="w-5 h-5 text-primary-600 dark:text-cyan-400" /> Professional Biography
                             </h3>
                             <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                                {doctor.about || `Dr. ${doctor.userId?.name} is a board-certified ${doctor.specialization} with over ${doctor.experience} years of clinical expertise. Specialized in comprehensive diagnostic evaluation, patient-centered consultation, and advanced treatment management.`}
                             </p>
                          </div>

                          <div>
                             <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-emerald-500" /> Hospital & Clinic Affiliation
                             </h3>
                             <div className="bg-slate-50 dark:bg-darksurface p-5 rounded-2xl border border-slate-100 dark:border-darkborder space-y-2">
                                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{doctor.hospitalName || 'MediCare Health Center'}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-start gap-2">
                                   <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                   {doctor.hospitalAddress || 'Central Medical District'}
                                </p>
                             </div>
                          </div>
                       </motion.div>
                    )}

                    {activeTab === 'timeline' && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                             <GraduationCap className="w-5 h-5 text-primary-600 dark:text-cyan-400" /> Education & Career Timeline
                          </h3>
                          <div className="space-y-4 pl-4 border-l-2 border-primary-200 dark:border-cyan-900">
                             {doctor.qualifications?.map((q, i) => (
                                <div key={i} className="relative pl-6">
                                   <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-primary-600 dark:bg-cyan-400 border-2 border-white dark:border-darkbg" />
                                   <div className="font-extrabold text-slate-900 dark:text-white text-sm">{q}</div>
                                   <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Board Certified & Verified Degree</div>
                                </div>
                             ))}
                          </div>
                       </motion.div>
                    )}

                    {activeTab === 'awards' && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                             <Trophy className="w-5 h-5 text-amber-500" /> Verified Accreditations
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {['Medical Council Registration Verified', 'Excellence in Patient Care Award', 'Fellow of Medical College'].map((award, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-darksurface border border-slate-100 dark:border-darkborder flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-slate-200">
                                   <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> {award}
                                </div>
                             ))}
                          </div>
                       </motion.div>
                    )}

                    {activeTab === 'reviews' && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                             Patient Reviews ({reviews.length})
                          </h3>
                          {reviews.length > 0 ? (
                             <div className="space-y-4">
                                {reviews.map(review => (
                                   <div key={review._id} className="p-6 rounded-2xl border border-slate-100 dark:border-darkborder bg-slate-50/50 dark:bg-darksurface/50">
                                      <div className="flex justify-between items-start mb-3">
                                         <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                                               {review.patientId?.name?.charAt(0) || 'P'}
                                            </div>
                                            <div>
                                               <h4 className="font-bold text-slate-900 dark:text-white text-sm">{review.patientId?.name || 'Verified Patient'}</h4>
                                               <div className="text-[10px] text-slate-400 font-semibold">{new Date(review.createdAt).toLocaleDateString()}</div>
                                            </div>
                                         </div>
                                         <div className="flex items-center gap-0.5 text-amber-400">
                                            {Array.from({length: review.rating || 5}).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
                                         </div>
                                      </div>
                                      <p className="text-slate-600 dark:text-slate-300 text-xs font-medium italic leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
                                   </div>
                                ))}
                             </div>
                          ) : (
                             <div className="text-slate-400 text-center py-10 bg-slate-50 dark:bg-darksurface rounded-2xl font-medium text-xs">
                                No reviews recorded yet for this practitioner.
                             </div>
                          )}
                       </motion.div>
                    )}
                 </div>
              </div>
           </div>

           {/* Right Sidebar - Availability Hours */}
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-darkcard rounded-3xl shadow-sm border border-slate-200/80 dark:border-darkborder p-6 space-y-4">
                 <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-primary-600 dark:text-cyan-400" /> Weekly Availability
                 </h3>
                 <div className="space-y-2 text-xs">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                       const slot = doctor.availableSlots?.find(s => s.day === day);
                       const isAvail = slot && slot.isAvailable;
                       return (
                          <div key={day} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-darksurface border border-slate-100 dark:border-darkborder font-semibold">
                             <span className={isAvail ? 'text-slate-800 dark:text-slate-200 font-bold' : 'text-slate-400'}>{day}</span>
                             {isAvail ? (
                                <span className="text-emerald-600 dark:text-cyan-400 font-extrabold bg-emerald-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded text-[10px]">
                                   {slot.startTime} - {slot.endTime}
                                </span>
                             ) : (
                                <span className="text-slate-400 text-[10px] font-medium">Off</span>
                             )}
                          </div>
                       )
                    })}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
