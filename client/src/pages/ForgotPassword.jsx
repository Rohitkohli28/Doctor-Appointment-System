import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Stethoscope, Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, ExternalLink } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [devResetLink, setDevResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
      toast.success(res.data?.message || 'Reset link sent to your email!');
      if (res.data?.resetLink) {
        setDevResetLink(res.data.resetLink);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request password reset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary-200/50 dark:bg-primary-900/20 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-200/50 dark:bg-cyan-900/20 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 bg-white dark:bg-darksurface p-8 sm:p-10 rounded-3xl shadow-xl dark:shadow-none border border-gray-100 dark:border-darkborder relative z-10">
        
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900/50 mb-4 group shadow-sm">
             <KeyRound className="h-8 w-8 text-primary-600 dark:text-cyan-400 group-hover:rotate-12 transition-transform" />
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Enter your account email address and we'll send you a link to reset your password.
          </p>
        </div>

        {!isSubmitted ? (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Registered Email Address
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/25 dark:shadow-cyan-500/10 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Sending Reset Link...</span>
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-5 pt-2 text-center">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl flex flex-col items-center gap-2 text-emerald-900 dark:text-emerald-200">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm font-bold">Password Reset Link Sent!</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Check your email inbox for <strong>{email}</strong> for instructions to reset your password.
              </p>
            </div>

            {devResetLink && (
              <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 rounded-xl text-left">
                <p className="text-[11px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ExternalLink className="h-3.5 w-3.5" /> Direct Reset Link (Quick Access)
                </p>
                <a
                  href={devResetLink}
                  className="text-xs text-sky-600 dark:text-cyan-400 font-semibold underline break-all hover:text-sky-800 dark:hover:text-cyan-300"
                >
                  {devResetLink}
                </a>
              </div>
            )}

            <button
              onClick={() => setIsSubmitted(false)}
              className="text-xs text-primary-600 dark:text-cyan-400 font-semibold hover:underline"
            >
              Didn't receive an email? Click here to retry
            </button>
          </div>
        )}

        <div className="border-t border-gray-100 dark:border-darkborder pt-5 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
