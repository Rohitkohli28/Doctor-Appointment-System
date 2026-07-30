import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import toast from 'react-hot-toast';
import SlotPicker from '../components/SlotPicker';
import { CheckCircle2, Circle, Stethoscope, Video, MapPin, IndianRupee } from 'lucide-react';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [doctor, setDoctor] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState('');
  
  const [details, setDetails] = useState({
    type: 'in-person',
    symptoms: ''
  });

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/doctors/${doctorId}`);
        setDoctor(res.data.data);
      } catch (error) {
        toast.error('Failed to load doctor details');
        navigate('/search');
      }
    };
    fetchDoctor();
  }, [doctorId, navigate]);

  const initiatePaymentAndBook = async () => {
    setLoading(true);
    try {
      // 1. Create Pending Appointment
      const apptRes = await api.post('/appointments', {
        doctorId,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        type: details.type,
        symptoms: details.symptoms
      });

      const appointmentId = apptRes.data.data._id;
      
      toast.success('Booking initiated! Redirecting to payment...');
      
      // 2. Redirect to Payment Page
      navigate(`/payment?appointmentId=${appointmentId}`);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: 'Doctor Info', active: step >= 1 },
    { title: 'Date & Time', active: step >= 1 },
    { title: 'Patient Details', active: step >= 2 },
    { title: 'Review Summary', active: step >= 3 },
    { title: 'Payment', active: step >= 3 }
  ];

  if (!doctor) return null;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 z-0 rounded-full"></div>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary-600 dark:bg-cyan-500 z-0 transition-all duration-500 rounded-full" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
            
            {steps.map((s, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center gap-2 group">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-md ${s.active ? 'bg-primary-600 dark:bg-cyan-600 text-white border-4 border-primary-100 dark:border-cyan-950' : 'bg-white dark:bg-darkcard border-4 border-slate-200 dark:border-darkborder text-slate-400'}`}>
                  {step > i + 1 ? <CheckCircle2 className="w-5 h-5 text-white" /> : <span className="text-xs font-bold">{i + 1}</span>}
                </div>
                <span className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider hidden sm:block ${s.active ? 'text-primary-700 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`}>{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SlotPicker 
                  doctorId={doctorId} 
                  selectedDate={selectedDate} 
                  setSelectedDate={setSelectedDate} 
                  selectedSlot={selectedSlot} 
                  setSelectedSlot={setSelectedSlot} 
                />
                
                <div className="mt-8 flex justify-end">
                  <button 
                    disabled={!selectedSlot}
                    onClick={() => setStep(2)}
                    className="bg-primary-600 hover:bg-primary-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/20"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white dark:bg-darkcard rounded-3xl shadow-sm border border-slate-200/80 dark:border-darkborder p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-darkborder pb-4">
                  <Stethoscope className="w-5 h-5 text-primary-600 dark:text-cyan-400" /> Appointment Details
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Consultation Type</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${details.type === 'in-person' ? 'border-primary-500 bg-primary-50/50 dark:bg-cyan-950/40 dark:border-cyan-500' : 'border-slate-100 dark:border-darkborder hover:border-slate-200 bg-white dark:bg-darksurface'}`}>
                        <input type="radio" name="type" value="in-person" checked={details.type === 'in-person'} onChange={(e) => setDetails({...details, type: e.target.value})} className="hidden" />
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${details.type === 'in-person' ? 'bg-primary-100 dark:bg-cyan-900/60 text-primary-600 dark:text-cyan-400' : 'bg-slate-100 dark:bg-darkcard text-slate-400'}`}>
                           <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                           <div className="font-extrabold text-slate-900 dark:text-white text-sm">In-Person Clinic</div>
                           <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{doctor.hospitalName}</div>
                        </div>
                      </label>

                      <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${details.type === 'online' ? 'border-primary-500 bg-primary-50/50 dark:bg-cyan-950/40 dark:border-cyan-500' : 'border-slate-100 dark:border-darkborder hover:border-slate-200 bg-white dark:bg-darksurface'}`}>
                        <input type="radio" name="type" value="online" checked={details.type === 'online'} onChange={(e) => setDetails({...details, type: e.target.value})} className="hidden" />
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${details.type === 'online' ? 'bg-primary-100 dark:bg-cyan-900/60 text-primary-600 dark:text-cyan-400' : 'bg-slate-100 dark:bg-darkcard text-slate-400'}`}>
                           <Video className="w-5 h-5" />
                        </div>
                        <div>
                           <div className="font-extrabold text-slate-900 dark:text-white text-sm">Video Consultation</div>
                           <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Link provided before joining</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Symptoms / Reason for visit</label>
                    <textarea 
                      value={details.symptoms}
                      onChange={(e) => setDetails({...details, symptoms: e.target.value})}
                      rows={4}
                      className="w-full p-4 border border-slate-200 dark:border-darkborder rounded-2xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-cyan-500 outline-none transition-all bg-slate-50 dark:bg-darksurface text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium text-xs resize-none"
                      placeholder="Briefly describe what you're experiencing..."
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-darkborder flex justify-between">
                  <button onClick={() => setStep(1)} className="px-6 py-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-darksurface rounded-xl transition-colors text-xs">Back</button>
                  <button onClick={() => setStep(3)} disabled={!details.symptoms.trim()} className="bg-primary-600 hover:bg-primary-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 text-xs">Continue to Payment</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white dark:bg-darkcard rounded-3xl shadow-sm border border-slate-200/80 dark:border-darkborder p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 rounded-full mx-auto flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                   <IndianRupee className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Complete Payment</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium max-w-sm mx-auto">You will be redirected to our secure payment gateway to complete your booking.</p>
                </div>
                
                <div className="bg-slate-50 dark:bg-darksurface p-6 rounded-2xl max-w-sm mx-auto border border-slate-100 dark:border-darkborder text-left space-y-3">
                  <div className="flex justify-between items-center text-xs border-b border-slate-200 dark:border-darkborder pb-2">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">Consultation Fee</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">₹{doctor.consultationFee || 500}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-slate-200 dark:border-darkborder pb-2">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">Platform Fee</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">₹0</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 font-black">
                    <span className="text-slate-900 dark:text-white">Total Amount</span>
                    <span className="text-primary-600 dark:text-cyan-400 text-base">₹{doctor.consultationFee || 500}</span>
                  </div>
                </div>

                <div className="flex gap-4 justify-center pt-2">
                   <button onClick={() => setStep(2)} disabled={loading} className="px-6 py-3 border border-slate-200 dark:border-darkborder text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-darksurface rounded-xl transition-colors text-xs disabled:opacity-50">Back</button>
                   <button onClick={initiatePaymentAndBook} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-extrabold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 text-xs">
                     {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Pay Now & Book'}
                   </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-darkcard rounded-3xl shadow-sm border border-slate-200/80 dark:border-darkborder p-6 sticky top-24 space-y-6">
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">Booking Summary</h4>
              
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-darkborder">
                <img src={doctor.userId?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.userId?.name || 'Dr')}&background=0D8ABC&color=fff`} alt="dr" className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-darkbg shadow-sm" />
                <div>
                  <h5 className="font-extrabold text-slate-900 dark:text-white text-sm line-clamp-1">Dr. {doctor.userId?.name}</h5>
                  <p className="text-primary-600 dark:text-cyan-400 text-xs font-bold">{doctor.specialization}</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-100 dark:border-darkborder pb-2.5">
                  <span className="text-slate-400 font-semibold">Date</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{selectedDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-darkborder pb-2.5">
                  <span className="text-slate-400 font-semibold">Time Slot</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{selectedSlot || 'Not selected'}</span>
                </div>
                {step >= 2 && (
                   <div className="flex justify-between border-b border-slate-100 dark:border-darkborder pb-2.5">
                     <span className="text-slate-400 font-semibold">Type</span>
                     <span className="font-extrabold text-slate-900 dark:text-white capitalize">{details.type}</span>
                   </div>
                )}
              </div>
              
              <div className="bg-primary-50 dark:bg-cyan-950/40 p-4 rounded-2xl border border-primary-100 dark:border-cyan-900/50">
                 <p className="text-primary-700 dark:text-cyan-300 font-medium text-[11px] leading-relaxed">
                    By confirming this booking, you agree to our terms of service and cancellation policy.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
