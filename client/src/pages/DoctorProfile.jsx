import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Building2, Clock, IndianRupee, Languages, Info, Award } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

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
        setReviews(reviewRes.data.data);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>;
  if (!doctor) return <div className="min-h-screen flex items-center justify-center text-red-500 font-medium">Doctor not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header Profile Section */}
      <div className="bg-white border-b border-gray-100 pt-10 pb-8 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
             <div className="w-32 h-32 md:w-40 md:h-40 relative group">
                <img 
                  src={doctor.userId?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.userId?.name || 'Dr')}&background=0D8ABC&color=fff&size=200`} 
                  alt={doctor.userId?.name} 
                  className="w-full h-full object-cover rounded-2xl shadow-md border-4 border-white group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -bottom-3 -right-3 bg-white px-3 py-1.5 rounded-xl text-sm font-bold text-yellow-600 flex items-center gap-1.5 border border-yellow-100 shadow-sm">
                   <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                   {doctor.rating}
                </div>
             </div>

             <div className="flex-1 space-y-4 w-full">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 w-full">
                   <div>
                      <div className="inline-block bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1 rounded-full mb-2 uppercase tracking-wide">
                        {doctor.specialization}
                      </div>
                      <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Dr. {doctor.userId?.name}</h1>
                      <p className="text-gray-500 font-medium">{doctor.qualifications?.join(', ')}</p>
                   </div>
                   
                   <div className="flex flex-col gap-3 min-w-[200px]">
                      <button 
                         onClick={handleBook}
                         className="w-full bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 hover:-translate-y-0.5"
                      >
                         Book Appointment
                      </button>
                      <div className="text-center text-sm font-semibold text-gray-700">
                         <IndianRupee className="w-4 h-4 inline-block relative -top-[1px] text-gray-400" />
                         {doctor.consultationFee} <span className="font-medium text-gray-500 text-xs">/ consultation</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-50">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                         <Clock className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                         <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Experience</p>
                         <p className="font-semibold text-gray-900">{doctor.experience} Years+</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                         <Building2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                         <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Hospital</p>
                         <p className="font-semibold text-gray-900 truncate max-w-[150px]">{doctor.hospitalName}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                         <MapPin className="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                         <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Location</p>
                         <p className="font-semibold text-gray-900 truncate max-w-[150px]">{doctor.hospitalAddress}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                         <Languages className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                         <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Languages</p>
                         <p className="font-semibold text-gray-900 truncate max-w-[150px]">{doctor.languages?.join(', ') || 'English'}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
           
           {/* Left Content */}
           <div className="lg:col-span-2 space-y-6 fade-in">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="flex border-b border-gray-100">
                    {['overview', 'reviews'].map(tab => (
                       <button 
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`flex-1 py-4 px-6 text-sm font-bold uppercase tracking-wider transition-colors border-b-2
                             ${activeTab === tab 
                                ? 'border-primary-600 text-primary-600 bg-primary-50/30' 
                                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                             }`
                          }
                       >
                          {tab}
                       </button>
                    ))}
                 </div>

                 <div className="p-8">
                    {activeTab === 'overview' && (
                       <div className="space-y-8 animate-in fade-in">
                          <div>
                             <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Info className="w-5 h-5 text-primary-500" /> About Doctor
                             </h3>
                             <p className="text-gray-600 leading-relaxed max-w-3xl">
                                {doctor.about || `Dr. ${doctor.userId?.name} is a renowned ${doctor.specialization} with over ${doctor.experience} years of experience in the medical field. Recognized for comprehensive care and advanced treatment methodologies.`}
                             </p>
                          </div>

                          <div>
                             <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-primary-500" /> Education & Qualifications
                             </h3>
                             <ul className="space-y-3">
                                {doctor.qualifications?.map((q, i) => (
                                   <li key={i} className="flex items-center gap-3 text-gray-700">
                                      <div className="w-2 h-2 rounded-full bg-primary-400"></div>
                                      <span className="font-medium bg-gray-50 py-1.5 px-3 rounded-lg border border-gray-100">{q}</span>
                                   </li>
                                ))}
                             </ul>
                          </div>
                          
                          <div>
                             <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary-500" /> Clinic Details
                             </h3>
                             <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-1">{doctor.hospitalName}</h4>
                                <p className="text-gray-600 flex items-start gap-2 mt-2">
                                   <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                   {doctor.hospitalAddress}
                                </p>
                             </div>
                          </div>
                       </div>
                    )}

                    {activeTab === 'reviews' && (
                       <div className="space-y-6 animate-in fade-in">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                             Patient Reviews ({reviews.length})
                          </h3>
                          {reviews.length > 0 ? (
                             <div className="space-y-4">
                                {reviews.map(review => (
                                   <div key={review._id} className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all">
                                      <div className="flex justify-between items-start mb-3">
                                         <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-100 border border-primary-200">
                                               {review.patientId?.profilePhoto ? (
                                                  <img src={review.patientId.profilePhoto} alt="patient" className="w-full h-full object-cover" />
                                               ) : (
                                                  <div className="w-full h-full flex items-center justify-center font-bold text-primary-600">
                                                     {review.patientId?.name?.charAt(0)}
                                                  </div>
                                               )}
                                            </div>
                                            <div>
                                               <h4 className="font-semibold text-gray-900 text-sm">{review.patientId?.name}</h4>
                                               <div className="text-xs text-gray-400 font-medium">{new Date(review.createdAt).toLocaleDateString()}</div>
                                            </div>
                                         </div>
                                         <div className="flex items-center gap-0.5 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">
                                            {Array.from({length: review.rating}).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                                            {Array.from({length: 5 - review.rating}).map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-gray-300" />)}
                                         </div>
                                      </div>
                                      <p className="text-gray-600 text-sm leading-relaxed pl-13">"{review.comment}"</p>
                                   </div>
                                ))}
                             </div>
                          ) : (
                             <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 font-medium">No reviews yet for this doctor.</div>
                          )}
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Right Sidebar - Booking CTA & Hours */}
           <div className="lg:col-span-1 space-y-6 sticky top-[300px]">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                 <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-500" /> Available Days
                 </h3>
                 <div className="space-y-3">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                       const slot = doctor.availableSlots?.find(s => s.day === day);
                       const isAvail = slot && slot.isAvailable;
                       return (
                          <div key={day} className="flex justify-between items-center text-sm p-3 rounded-lg bg-gray-50 border border-gray-100 flex-wrap gap-2">
                             <span className={`font-semibold ${isAvail ? 'text-gray-800' : 'text-gray-400'}`}>{day}</span>
                             {isAvail ? (
                                <span className="text-primary-600 font-medium bg-primary-50 px-2 py-0.5 rounded flex items-center gap-1">
                                   {slot.startTime} - {slot.endTime}
                                </span>
                             ) : (
                                <span className="text-red-400 font-medium text-xs px-2 py-0.5 bg-red-50 rounded border border-red-100">Not Available</span>
                             )}
                          </div>
                       )
                    })}
                 </div>
              </div>

              <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100 text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl -mt-10 -mr-10"></div>
                 <h3 className="font-bold text-gray-900 mb-2 relative z-10">Ready to consult?</h3>
                 <p className="text-sm text-gray-600 mb-6 relative z-10">Securely book your appointment and avoid long waiting queues at the clinic.</p>
                 <button 
                    onClick={handleBook}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-1 relative z-10"
                 >
                    Book Consultation
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
