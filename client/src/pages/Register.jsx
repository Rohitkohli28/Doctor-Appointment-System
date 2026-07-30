import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const [errorMessage, setErrorMessage] = useState(null);
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) {
      setErrorMessage(null);
      setIsDuplicateEmail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setIsDuplicateEmail(false);
    try {
      await registerUser(formData);
      navigate('/login', { state: { from: location.state?.from } });
    } catch (error) {
      const code = error.response?.data?.code;
      const msg = error.response?.data?.message;
      if (code === 'USER_EXISTS') {
        setIsDuplicateEmail(true);
        setErrorMessage('An account with this email already exists — try signing in instead.');
      } else if (!error.response || error.message === 'Network Error') {
        setErrorMessage('Network Error: Unable to connect to the backend server. Please check your connection.');
      } else {
        setErrorMessage(msg || 'Registration failed. Please check your inputs.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 flex flex-col justify-center items-center bg-gray-50 dark:bg-darkbg bg-[url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center bg-fixed relative transition-colors duration-300">
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gray-50 dark:from-darkbg to-transparent"></div>
      
      <div className="w-full max-w-lg bg-white/95 dark:bg-darksurface/95 backdrop-blur-md rounded-3xl shadow-2xl dark:shadow-none p-10 border border-white/50 dark:border-darkborder/55 relative z-10 transition-transform duration-500 hover:scale-[1.01]">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-darkcard shadow-md border border-gray-100 dark:border-darkborder mb-6 group cursor-pointer transition-transform duration-300">
             <Stethoscope className="w-8 h-8 text-primary-600 dark:text-cyan-405 group-hover:scale-110 transition-transform" />
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Create an account</h2>
          <p className="mt-3 text-sm text-gray-605 dark:text-gray-400 font-medium">Join MediCare to manage your health seamlessly.</p>
        </div>

        {errorMessage && (
          <div className={`p-4 mb-6 rounded-2xl border text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-medium ${isDuplicateEmail ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/50 text-amber-900 dark:text-amber-200' : 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700/50 text-red-900 dark:text-red-200'}`}>
            <span>{errorMessage}</span>
            {isDuplicateEmail && (
              <Link to="/login" className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0">
                Sign in Now →
              </Link>
            )}
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
             <label className={`w-full flex items-center justify-center p-4 rounded-xl border-2 font-bold uppercase tracking-wider text-xs cursor-pointer transition-all ${formData.role === 'patient' ? 'bg-primary-50 dark:bg-primary-950/20 border-primary-500 dark:border-cyan-500 text-primary-700 dark:text-cyan-400 shadow-inner' : 'bg-gray-50 dark:bg-darkcard border-gray-200 dark:border-darkborder text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                <input type="radio" name="role" value="patient" checked={formData.role === 'patient'} onChange={handleInputChange} className="hidden" />
                I am a Patient
             </label>
             <label className={`w-full flex items-center justify-center p-4 rounded-xl border-2 font-bold uppercase tracking-wider text-xs cursor-pointer transition-all ${formData.role === 'doctor' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-inner' : 'bg-gray-50 dark:bg-darkcard border-gray-200 dark:border-darkborder text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                <input type="radio" name="role" value="doctor" checked={formData.role === 'doctor'} onChange={handleInputChange} className="hidden" />
                I am a Doctor
             </label>
          </div>

          <div className="space-y-5">
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Full Name</label>
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 dark:group-focus-within:text-cyan-400 transition-colors" />
                 </div>
                 <input
                   type="text"
                   name="name"
                   required
                   value={formData.name}
                   onChange={handleInputChange}
                   className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-darkcard border border-gray-200 dark:border-darkborder rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-cyan-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 font-medium text-gray-900 dark:text-white"
                   placeholder="John Doe"
                 />
               </div>
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Email Address</label>
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 dark:group-focus-within:text-cyan-400 transition-colors" />
                 </div>
                 <input
                   type="email"
                   name="email"
                   required
                   value={formData.email}
                   onChange={handleInputChange}
                   className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-darkcard border border-gray-200 dark:border-darkborder rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-cyan-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 font-medium text-gray-900 dark:text-white"
                   placeholder="name@example.com"
                 />
               </div>
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Phone Number</label>
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 dark:group-focus-within:text-cyan-400 transition-colors" />
                 </div>
                 <input
                   type="tel"
                   name="phone"
                   required
                   value={formData.phone}
                   onChange={handleInputChange}
                   className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-darkcard border border-gray-200 dark:border-darkborder rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-cyan-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 font-medium text-gray-900 dark:text-white"
                   placeholder="+1 (555) 000-0000"
                 />
               </div>
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Password</label>
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 dark:group-focus-within:text-cyan-400 transition-colors" />
                 </div>
                 <input
                   type={showPassword ? "text" : "password"}
                   name="password"
                   required
                   value={formData.password}
                   onChange={handleInputChange}
                   className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-darkcard border border-gray-200 dark:border-darkborder rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-cyan-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 font-medium text-gray-900 dark:text-white tracking-wide"
                   placeholder="••••••••"
                   minLength={6}
                 />
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-cyan-400 transition-colors"
                 >
                   {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                 </button>
               </div>
               <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Must be at least 6 characters.</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white shadow-lg dark:shadow-none transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${formData.role === 'patient' ? 'bg-primary-600 hover:bg-primary-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 shadow-primary-500/30' : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 shadow-emerald-500/30'}`}
          >
            {isLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Create Account'}
          </button>
          
          <div className="text-center pt-4">
             <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
               Already have an account?{' '}
               <Link to="/login" className={`font-bold hover:text-primary-800 dark:hover:text-cyan-300 transition-colors ${formData.role === 'patient' ? 'text-primary-600 dark:text-cyan-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
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
