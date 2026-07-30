import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Bell, Calendar, ShieldCheck, CreditCard, Sparkles, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const NotificationsPage = () => {
  const { 
    notifications, 
    loading, 
    markAllRead, 
    deleteNotification, 
    clearAll 
  } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'appointment': return Calendar;
      case 'payment': return CreditCard;
      case 'medical': return ShieldCheck;
      default: return Sparkles;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-600 dark:text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Notifications Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Real-time appointment updates, payment receipts, and health reports.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={markAllRead}
              className="px-4 py-2 bg-white dark:bg-darkcard border border-slate-200 dark:border-darkborder rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-darksurface transition-colors"
            >
              Mark All Read
            </button>
            <button
              onClick={clearAll}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
              title="Clear all notifications"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Notifications Feed */}
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((n) => {
            const Icon = getIcon(n.type);
            return (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-3xl border transition-all flex items-start gap-4 ${
                  !n.isRead
                    ? 'bg-white dark:bg-darkcard border-primary-200 dark:border-cyan-800/50 shadow-md'
                    : 'bg-slate-50/60 dark:bg-darksurface/50 border-slate-200/60 dark:border-darkborder opacity-80'
                }`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  n.type === 'appointment' ? 'bg-primary-50 dark:bg-cyan-950/40 text-primary-600 dark:text-cyan-400' :
                  n.type === 'payment' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
                  n.type === 'medical' ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400' :
                  'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      {n.title}
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-600 dark:bg-cyan-400 inline-block" />}
                    </h4>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => deleteNotification(n._id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{n.message}</p>
                  
                  {n.type === 'medical' && (
                    <div className="pt-2">
                      <a
                        href="/history"
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-violet-600 dark:text-violet-400 hover:underline"
                      >
                        View & Download PDF Medical Report &rarr;
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-darkcard p-12 rounded-3xl border border-slate-200/80 dark:border-darkborder text-center flex flex-col items-center justify-center min-h-[350px]">
          <div className="w-20 h-20 bg-slate-50 dark:bg-darksurface text-slate-400 rounded-3xl flex items-center justify-center mb-4 border border-slate-100 dark:border-darkborder shadow-inner">
            <Bell className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1">No notifications</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium max-w-xs mx-auto">
            You're all caught up! Important reminders and health updates will appear here.
          </p>
        </div>
      )}

    </div>
  );
};

export default NotificationsPage;
