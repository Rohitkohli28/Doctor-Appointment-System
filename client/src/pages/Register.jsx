import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Stethoscope, Eye, EyeOff, User, Mail, Lock, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'patient'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await registerUser(formData);
      navigate('/login');
    } catch (error) {
       console.error(error);
      // errors handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 flex flex-col justify-center items-center bg-gray-50 bg-[url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center bg-fixed relative">
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gray-50 to-transparent"></div>
      
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-10 border border-white/50 relative z-10 transition-transform duration-500 hover:scale-[1.01]">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-md border border-gray-100 mb-6 group cursor-pointer transition-transform duration-300">
             <Stethoscope className="w-8 h-8 text-primary-600 group-hover:scale-110 transition-transform" />
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create an account</h2>
          <p className="mt-3 text-sm text-gray-600 font-medium">Join MediCare to manage your health seamlessly.</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
             <label className={`w-full flex items-center justify-center p-4 rounded-xl border-2 font-bold uppercase tracking-wider text-xs cursor-pointer transition-all ${formData.role === 'patient' ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-inner' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                <input type="radio" name="role" value="patient" checked={formData.role === 'patient'} onChange={handleInputChange} className="hidden" />
                I am a Patient
             </label>
             <label className={`w-full flex items-center justify-center p-4 rounded-xl border-2 font-bold uppercase tracking-wider text-xs cursor-pointer transition-all ${formData.role === 'doctor' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-inner' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                <input type="radio" name="role" value="doctor" checked={formData.role === 'doctor'} onChange={handleInputChange} className="hidden" />
                I am a Doctor
             </label>
          </div>

          <div className="space-y-5">
            <div>
               <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                 </div>
                 <input
                   type="text"
                   name="name"
                   required
                   value={formData.name}
                   onChange={handleInputChange}
                   className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder-gray-400 font-medium"
                   placeholder="John Doe"
                 />
               </div>
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                 </div>
                 <input
                   type="email"
                   name="email"
                   required
                   value={formData.email}
                   onChange={handleInputChange}
                   className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder-gray-400 font-medium"
                   placeholder="name@example.com"
                 />
               </div>
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number</label>
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                 </div>
                 <input
                   type="tel"
                   name="phone"
                   required
                   value={formData.phone}
                   onChange={handleInputChange}
                   className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder-gray-400 font-medium"
                   placeholder="+1 (555) 000-0000"
                 />
               </div>
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                 </div>
                 <input
                   type={showPassword ? "text" : "password"}
                   name="password"
                   required
                   value={formData.password}
                   onChange={handleInputChange}
                   className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder-gray-400 font-medium tracking-wide"
                   placeholder="••••••••"
                   minLength={6}
                 />
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-600 transition-colors"
                 >
                   {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                 </button>
               </div>
               <p className="mt-2 text-xs text-gray-500">Must be at least 6 characters.</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${formData.role === 'patient' ? 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/30' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30'}`}
          >
            {isLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Create Account'}
          </button>
          
          <div className="text-center pt-4">
             <p className="text-sm text-gray-600 font-medium">
               Already have an account?{' '}
               <Link to="/login" className={`font-bold hover:text-primary-800 transition-colors ${formData.role === 'patient' ? 'text-primary-600' : 'text-emerald-600'}`}>
                 Sign in
               </Link>
             </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
