import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Stethoscope, Eye, EyeOff, Lock, Mail, Info, ShieldCheck, UserCheck, ArrowRight, UserPlus, LogIn, LayoutDashboard } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from;
  const fromTarget = from ? `${from.pathname}${from.search || ''}` : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await login(email, password);
      // Redirect based on role or state target
      if (res.user?.role === 'doctor') {
        navigate(fromTarget || '/doctor/dashboard', { replace: true });
      } else {
        navigate(fromTarget || '/dashboard', { replace: true });
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message;
      if (!error.response || error.message === 'Network Error') {
        setErrorMessage('Network Error: Unable to connect to the backend server. Please check your internet connection or backend URL configuration.');
      } else {
        setErrorMessage(msg || 'Sign in failed. Please check your email and password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Glow Backgrounds */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary-200/50 dark:bg-primary-900/20 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-200/50 dark:bg-cyan-900/20 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 bg-white dark:bg-darksurface p-8 sm:p-10 rounded-3xl shadow-xl dark:shadow-none border border-gray-100 dark:border-darkborder relative z-10 transition-all hover:shadow-2xl dark:hover:border-slate-700">
        
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900/50 mb-4 group shadow-sm">
             <Stethoscope className="h-8 w-8 text-primary-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-sm font-semibold text-primary-600 dark:text-cyan-400">
            One Secure Login for Patients & Doctors
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Sign in using the email and password created during registration.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl border text-xs font-semibold bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700/50 text-red-900 dark:text-red-200">
            {errorMessage}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-sky-50/90 dark:bg-cyan-950/40 border border-sky-200/80 dark:border-cyan-800/50 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs">
          <Info className="h-5 w-5 text-sky-600 dark:text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-sky-900 dark:text-cyan-200 leading-relaxed font-medium">
            <span className="font-bold block text-sky-950 dark:text-cyan-100 mb-0.5">Patients & Doctors use the same secure login.</span>
            Your account type is automatically detected after authentication, and you will be redirected to your respective dashboard.
          </div>
        </div>

        {/* Portal Indicators */}
        <div className="bg-gray-50 dark:bg-darkcard/70 rounded-2xl p-3 border border-gray-100 dark:border-darkborder text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
              <span>👤</span> Patient Portal
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100/80 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 shadow-2xs">
              <span>👨‍⚕️</span> Doctor Portal
            </span>
          </div>
          <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary-500 dark:text-cyan-400" /> Automatically detected upon sign in
          </p>
        </div>
        
        {/* Form */}
        <form className="mt-4 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-gray-400 group-focus-within:text-primary-500 dark:group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-darkcard border border-gray-200 dark:border-darkborder rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-cyan-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm font-medium text-gray-900 dark:text-white"
                  placeholder="Enter your registered email"
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                 <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                   Password
                 </label>
                 <Link to="/forgot-password" className="text-xs font-semibold text-primary-600 dark:text-cyan-400 hover:text-primary-800 dark:hover:text-cyan-300 transition-colors">
                   Forgot password?
                 </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-gray-400 group-focus-within:text-primary-500 dark:group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 bg-gray-50 dark:bg-darkcard border border-gray-200 dark:border-darkborder rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-cyan-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm font-medium text-gray-900 dark:text-white"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>
          </div>
 
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/25 dark:shadow-cyan-500/10 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-cyan-500 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Authenticating & Redirecting...</span>
              </span>
            ) : (
              'Sign In'
            )}
          </button>
          
          {/* Footer Text */}
          <div className="text-center pt-1">
             <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
               New to MediCare?{' '}
               <Link to="/register" className="font-bold text-primary-600 dark:text-cyan-400 hover:text-primary-800 dark:hover:text-cyan-300 transition-colors">
                 Create a Patient or Doctor account
               </Link>
             </p>
          </div>
        </form>

        {/* Small Authentication Flow Diagram */}
        <div className="border-t border-gray-100 dark:border-darkborder pt-5">
          <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 text-center uppercase tracking-wider mb-2.5">
            Authentication Workflow
          </p>
          <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-semibold text-gray-600 dark:text-gray-400">
            <div className="bg-gray-50 dark:bg-darkcard p-2 rounded-lg border border-gray-100 dark:border-darkborder">
              <UserPlus className="h-3.5 w-3.5 mx-auto text-primary-500 dark:text-cyan-400 mb-1" />
              <span>1. Sign Up</span>
            </div>
            <div className="bg-gray-50 dark:bg-darkcard p-2 rounded-lg border border-gray-100 dark:border-darkborder">
              <UserCheck className="h-3.5 w-3.5 mx-auto text-emerald-500 mb-1" />
              <span>2. Pick Role</span>
            </div>
            <div className="bg-gray-50 dark:bg-darkcard p-2 rounded-lg border border-gray-100 dark:border-darkborder">
              <LogIn className="h-3.5 w-3.5 mx-auto text-sky-500 mb-1" />
              <span>3. Sign In</span>
            </div>
            <div className="bg-gray-50 dark:bg-darkcard p-2 rounded-lg border border-gray-100 dark:border-darkborder">
              <LayoutDashboard className="h-3.5 w-3.5 mx-auto text-purple-500 mb-1" />
              <span>4. Auto-Redirect</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
