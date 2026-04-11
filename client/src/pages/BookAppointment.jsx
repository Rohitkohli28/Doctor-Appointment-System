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
    { title: 'Date & Time', active: step >= 1 },
    { title: 'Details', active: step >= 2 },
    { title: 'Payment', active: step >= 3 }
  ];

  if (!doctor) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 z-0 rounded-full"></div>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary-500 z-0 transition-all duration-500 rounded-full" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
            
            {steps.map((s, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center gap-2 group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${s.active ? 'bg-primary-600 border-4 border-primary-100' : 'bg-white border-4 border-gray-100'}`}>
                  {step > i + 1 ? <CheckCircle2 className="w-5 h-5 text-white" /> : <div className={`w-3 h-3 rounded-full ${s.active ? 'bg-white' : 'bg-gray-300'}`}></div>}
                </div>
                <span className={`text-sm font-bold uppercase tracking-wider ${s.active ? 'text-primary-700' : 'text-gray-400'}`}>{s.title}</span>
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
                    className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/30"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                  <Stethoscope className="w-5 h-5 text-primary-500" /> Appointment Details
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Consultation Type</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${details.type === 'in-person' ? 'border-primary-500 bg-primary-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                        <input type="radio" name="type" value="in-person" checked={details.type === 'in-person'} onChange={(e) => setDetails({...details, type: e.target.value})} className="hidden" />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${details.type === 'in-person' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                           <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                           <div className="font-bold text-gray-900">In-Person Clinic</div>
                           <div className="text-xs text-gray-500 mt-1 font-medium">{doctor.hospitalName}</div>
                        </div>
                      </label>
                      <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${details.type === 'online' ? 'border-primary-500 bg-primary-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                        <input type="radio" name="type" value="online" checked={details.type === 'online'} onChange={(e) => setDetails({...details, type: e.target.value})} className="hidden" />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${details.type === 'online' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                           <Video className="w-5 h-5" />
                        </div>
                        <div>
                           <div className="font-bold text-gray-900">Video Consultation</div>
                           <div className="text-xs text-gray-500 mt-1 font-medium">Link provided before joining</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Symptoms / Reason for visit</label>
                    <textarea 
                      value={details.symptoms}
                      onChange={(e) => setDetails({...details, symptoms: e.target.value})}
                      rows={4}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-gray-50 hover:bg-white resize-none"
                      placeholder="Briefly describe what you're experiencing..."
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button onClick={() => setStep(1)} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Back</button>
                  <button onClick={() => setStep(3)} disabled={!details.symptoms.trim()} className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/30 disabled:opacity-50">Continue to Payment</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto flex items-center justify-center mb-6">
                   <IndianRupee className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete Payment</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">You will be redirected to our secure payment gateway to complete your booking.</p>
                
                <div className="bg-gray-50 p-6 rounded-2xl max-w-sm mx-auto mb-8 border border-gray-100 text-left">
                  <div className="flex justify-between items-center mb-3 text-sm border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-medium">Consultation Fee</span>
                    <span className="font-semibold text-gray-900">₹{doctor.consultationFee}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3 text-sm border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-medium">Platform Fee</span>
                    <span className="font-semibold text-gray-900">₹0</span>
                  </div>
                  <div className="flex justify-between items-center text-lg mt-4 font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-primary-600">₹{doctor.consultationFee}</span>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                   <button onClick={() => setStep(2)} disabled={loading} className="px-6 py-3 border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-50">Back</button>
                   <button onClick={initiatePaymentAndBook} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-2">
                     {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Pay Now & Book'}
                   </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">Booking Summary</h4>
              
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <img src={doctor.userId?.profilePhoto || 'https://via.placeholder.com/100'} alt="dr" className="w-16 h-16 rounded-xl object-cover ring-2 ring-primary-50" />
                <div>
                  <h5 className="font-bold text-gray-900 line-clamp-1">Dr. {doctor.userId?.name}</h5>
                  <p className="text-primary-600 text-xs font-semibold">{doctor.specialization}</p>
                </div>
              </div>

              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-500 font-medium">Date</span>
                  <span className="font-semibold text-gray-900">{selectedDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-500 font-medium">Time</span>
                  <span className="font-semibold text-gray-900">{selectedSlot || 'Not selected'}</span>
                </div>
                {step >= 2 && (
                   <div className="flex justify-between border-b border-gray-100 pb-3">
                     <span className="text-gray-500 font-medium">Type</span>
                     <span className="font-semibold text-gray-900 capitalize text-right max-w-[120px]">{details.type}</span>
                   </div>
                )}
              </div>
              
              <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 flex items-start gap-3">
                 <div className="text-primary-600 font-medium text-xs leading-relaxed">
                    By confirming this booking, you agree to our terms of service and cancellation policy.
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
