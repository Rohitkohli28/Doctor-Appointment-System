import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Stethoscope, Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react';

const DoctorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { doctorLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await doctorLogin(email, password);
      navigate('/doctor/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-100 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-emerald-50 relative z-10 transition-all hover:shadow-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 mb-6 group">
             <Stethoscope className="h-8 w-8 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full border border-emerald-100">
            Doctor Portal
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-4">Welcome back, Doctor</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">Please verify your credentials to access the portal.</p>
        </div>
        
        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-gray-400 font-medium text-gray-900"
                  placeholder="doctor.demo@medicare.test"
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                 <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Password</label>
                 <a href="#" className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors">Forgot password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-gray-400 font-medium text-gray-900"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-medium leading-relaxed">
              <strong>Security Notice:</strong> Logging in here requires a database-verified doctor profile. Unauthorized access attempts are logged.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-500/20 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Authenticate'}
          </button>
          
          <div className="text-center pt-2">
             <p className="text-xs text-gray-400 font-medium">
               Need authorization? Please contact the administrator to register or approve your credentials.
             </p>
             <p className="text-sm mt-3 text-gray-500 font-medium">
               Are you a patient?{' '}
               <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-800 transition-colors">
                 Log in here
               </Link>
             </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorLogin;
