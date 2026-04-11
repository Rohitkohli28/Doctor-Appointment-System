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
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Securing session...</p>
        </div>
      </div>
    );
  }

  const paymentMethods = [
    { id: 'upi', name: 'UPI (GPay/PhonePe)', icon: Wallet, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'card', name: 'Credit / Debit Card', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'netbanking', name: 'Net Banking', icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-emerald-200">
                <ShieldCheck className="w-4 h-4" /> Secure Checkout
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Complete Payment</h1>
            <p className="text-slate-500 mt-2 font-medium">Simulation Environment &bull; Demo Mode</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Payment Methods */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
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
                        ? 'border-primary-500 bg-primary-50/30' 
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method.bg} ${method.color} group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className={`font-bold text-lg ${paymentMethod === method.id ? 'text-primary-900' : 'text-slate-600'}`}>
                          {method.name}
                        </span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === method.id ? 'border-primary-500' : 'border-slate-200'
                      }`}>
                        {paymentMethod === method.id && <div className="w-3 h-3 bg-primary-500 rounded-full"></div>}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 bg-amber-50 rounded-2xl p-5 border border-amber-100 flex gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm text-amber-600">
                    <ShieldCheck className="w-6 h-6" />
                 </div>
                 <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    This is a <strong className="font-black uppercase tracking-wider">Demo System</strong>. No real money will be debited from your account. Click "Pay Now" to simulate a successful transaction.
                 </p>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary-500 opacity-20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Order Summary
                </h4>

                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-800">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-slate-800 shadow-xl">
                        <img 
                            src={appointment.doctorId?.userId?.profilePhoto || 'https://via.placeholder.com/100'} 
                            alt="dr" 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                    <div>
                        <h5 className="font-black text-lg text-white">Dr. {appointment.doctorId?.userId?.name}</h5>
                        <p className="text-primary-400 text-xs font-bold uppercase tracking-widest">{appointment.doctorId?.specialization || 'MediCare Specialist'}</p>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Date</span>
                        </div>
                        <span className="font-bold text-sm">{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Time</span>
                        </div>
                        <span className="font-bold text-sm tracking-tighter">{appointment.timeSlot}</span>
                    </div>
                </div>

                <div className="space-y-4 border-t border-slate-800 pt-8 mt-8">
                    <div className="flex justify-between text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                        <span>Consultation Fee</span>
                        <span className="text-slate-200">₹{appointment.consultationFee}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                        <span>Platform Tax</span>
                        <span className="text-slate-100">₹0.00</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-800">
                        <span className="text-xl font-black">Total</span>
                        <div className="flex items-center text-2xl font-black text-primary-400">
                           <IndianRupee className="w-5 h-5" /> {appointment.consultationFee}
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full mt-10 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary-500/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
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
