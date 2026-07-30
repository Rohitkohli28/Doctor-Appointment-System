import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, ArrowRight, Stethoscope } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      toast.error('Passwords do not match. Please verify your entries.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.put(`/auth/reset-password/${token}`, { password });
      setIsSuccess(true);
      toast.success(res.data?.message || 'Password reset successful!');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired reset token. Please request a new link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary-200/50 dark:bg-primary-900/20 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-200/50 dark:bg-emerald-900/20 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 bg-white dark:bg-darksurface p-8 sm:p-10 rounded-3xl shadow-xl dark:shadow-none border border-gray-100 dark:border-darkborder relative z-10">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 mb-4 group shadow-sm">
             <ShieldCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Create New Password</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Please enter your new password below to update your MediCare account credentials.
          </p>
        </div>

        {!isSuccess ? (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4.5 w-4.5 text-gray-400 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 bg-gray-50 dark:bg-darkcard border border-gray-200 dark:border-darkborder rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm font-medium text-gray-900 dark:text-white"
                    placeholder="Enter new password (min. 6 chars)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4.5 w-4.5 text-gray-400 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 bg-gray-50 dark:bg-darkcard border border-gray-200 dark:border-darkborder rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm font-medium text-gray-900 dark:text-white"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-500/25 dark:shadow-emerald-500/10 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Updating Password...</span>
                </span>
              ) : (
                'Reset Password Now'
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-5 pt-2 text-center">
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl flex flex-col items-center gap-3 text-emerald-900 dark:text-emerald-200">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 animate-bounce" />
              <p className="text-base font-bold">Password Reset Complete!</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Your password has been successfully updated. You will be automatically redirected to the Login page in a few seconds...
              </p>
            </div>

            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all"
            >
              Go to Sign In Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResetPassword;
