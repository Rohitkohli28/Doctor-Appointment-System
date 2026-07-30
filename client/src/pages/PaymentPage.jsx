import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  CreditCard, 
  Wallet, 
  Building2, 
  CheckCircle2, 
  Loader2, 
  IndianRupee, 
  Calendar, 
  Clock, 
  User,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const navigate = useNavigate();
  
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await api.get(`/appointments/${appointmentId}`);
        setAppointment(res.data.data);
      } catch (error) {
        toast.error('Failed to load appointment details');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointment();
    } else {
      navigate('/dashboard');
    }
  }, [appointmentId, navigate]);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const res = await api.post('/payments/demo', { appointmentId });
      
      if (res.data.success) {
        toast.success('Payment Successful 🎉', {
          duration: 4000,
          icon: '✅',
        });
        navigate(`/appointment-success?appointmentId=${appointmentId}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary-600 dark:text-cyan-400 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Securing session...</p>
        </div>
      </div>
    );
  }

  const paymentMethods = [
    { id: 'upi', name: 'UPI (GPay/PhonePe)', icon: Wallet, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40' },
    { id: 'card', name: 'Credit / Debit Card', icon: CreditCard, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { id: 'netbanking', name: 'Net Banking', icon: Building2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-4 h-4" /> Secure Checkout
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Complete Payment</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Simulation Environment &bull; Demo Mode</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Payment Methods */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-darkcard rounded-3xl p-8 border border-slate-200/80 dark:border-darkborder shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                Select Payment Method
              </h3>
              
              <div className="space-y-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all group ${
                        paymentMethod === method.id 
                        ? 'border-primary-500 dark:border-cyan-500 bg-primary-50/40 dark:bg-cyan-950/30' 
                        : 'border-slate-100 dark:border-darkborder hover:border-slate-200 bg-white dark:bg-darksurface'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method.bg} ${method.color} group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className={`font-bold text-base ${paymentMethod === method.id ? 'text-primary-900 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-200'}`}>
                          {method.name}
                        </span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === method.id ? 'border-primary-500 dark:border-cyan-400' : 'border-slate-200 dark:border-darkborder'
                      }`}>
                        {paymentMethod === method.id && <div className="w-3 h-3 bg-primary-500 dark:bg-cyan-400 rounded-full"></div>}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-5 border border-amber-100 dark:border-amber-900/50 flex gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white dark:bg-darkcard flex items-center justify-center flex-shrink-0 shadow-sm text-amber-600 dark:text-amber-400">
                    <ShieldCheck className="w-6 h-6" />
                 </div>
                 <p className="text-xs text-amber-800 dark:text-amber-200 font-medium leading-relaxed">
                    This is a <strong className="font-black uppercase tracking-wider">Demo System</strong>. No real money will be debited from your account. Click "Pay Now" to simulate a successful transaction.
                 </p>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-slate-900 dark:bg-darkcard rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group border border-slate-800 dark:border-darkborder">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary-500 opacity-20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Order Summary
                </h4>

                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-800 dark:border-darkborder">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-slate-800 shadow-xl shrink-0">
                        <img 
                            src={appointment.doctorId?.userId?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.doctorId?.userId?.name || 'Dr')}&background=0D8ABC&color=fff`} 
                            alt="dr" 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                    <div>
                        <h5 className="font-black text-lg text-white">Dr. {appointment.doctorId?.userId?.name}</h5>
                        <p className="text-primary-400 dark:text-cyan-400 text-xs font-bold uppercase tracking-widest">{appointment.doctorId?.specialization || 'MediCare Specialist'}</p>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center bg-slate-800/50 dark:bg-darksurface/50 p-3 rounded-xl border border-slate-700/50 dark:border-darkborder">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Date</span>
                        </div>
                        <span className="font-bold text-sm">{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-800/50 dark:bg-darksurface/50 p-3 rounded-xl border border-slate-700/50 dark:border-darkborder">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Time</span>
                        </div>
                        <span className="font-bold text-sm tracking-tighter">{appointment.timeSlot}</span>
                    </div>
                </div>

                <div className="space-y-4 border-t border-slate-800 dark:border-darkborder pt-8 mt-8">
                    <div className="flex justify-between text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                        <span>Consultation Fee</span>
                        <span className="text-slate-200">₹{appointment.consultationFee || 500}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                        <span>Platform Tax</span>
                        <span className="text-slate-100">₹0.00</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-800 dark:border-darkborder">
                        <span className="text-xl font-black">Total</span>
                        <div className="flex items-center text-2xl font-black text-primary-400 dark:text-cyan-400">
                           <IndianRupee className="w-5 h-5" /> {appointment.consultationFee || 500}
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full mt-10 bg-primary-600 hover:bg-primary-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 disabled:bg-slate-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                >
                    {processing ? (
                       <>
                         <Loader2 className="w-5 h-5 animate-spin" />
                         Processing Payment...
                       </>
                    ) : (
                       <>
                         Pay Now <ArrowRight className="w-5 h-5" />
                       </>
                    )}
                </button>
             </div>
             
             <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                Secure 256-bit SSL encrypted simulation
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
