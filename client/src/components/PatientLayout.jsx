import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ThemeContext } from '../context/ThemeContext';
import { 
  LayoutDashboard, Search, Calendar, Shield, Bell, User, LogOut, 
  Menu, X, Sun, Moon, Stethoscope, ChevronRight, Activity, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIAssistant from './AIAssistant';

import { useNotifications } from '../hooks/useNotifications';

const PatientLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { unreadCount, markAllRead } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (location.pathname === '/notifications' && unreadCount > 0) {
      markAllRead();
    }
  }, [location.pathname, unreadCount, markAllRead]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Find Doctors', path: '/find-doctors', icon: Search },
    { name: 'My Appointments', path: '/appointments', icon: Calendar },
    { name: 'Medical History', path: '/history', icon: Shield },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  const getPageTitle = () => {
    const item = navItems.find(i => i.path === location.pathname);
    if (item) return item.name;
    if (location.pathname.startsWith('/doctors/')) return 'Doctor Profile';
    if (location.pathname.startsWith('/book/')) return 'Book Appointment';
    if (location.pathname.startsWith('/payment')) return 'Checkout Payment';
    if (location.pathname.startsWith('/appointment-success')) return 'Booking Confirmed';
    return 'Patient Portal';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300">
      
      {/* Top Application Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-darkcard/90 backdrop-blur-md border-b border-slate-200/80 dark:border-darkborder z-40 flex items-center justify-between px-4 sm:px-6">
        
        {/* Left: Brand & Mobile Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-darksurface transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-md transition-all group-hover:scale-105">
              <Stethoscope className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-primary-700 to-primary-600 dark:from-white dark:via-primary-400 dark:to-cyan-400 bg-clip-text text-transparent hidden sm:inline">
              MediCare
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary-50 dark:bg-cyan-950/60 text-primary-700 dark:text-cyan-400 border border-primary-100 dark:border-cyan-800/50 uppercase tracking-wide">
              Patient
            </span>
          </Link>

          {/* Breadcrumb Title */}
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-400 pl-4 border-l border-slate-200 dark:border-darkborder">
            <span>Portal</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 dark:text-white font-extrabold">{getPageTitle()}</span>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Shortcut */}
          <button 
            onClick={() => navigate('/find-doctors')}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-darksurface text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold border border-slate-200/60 dark:border-darkborder transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-primary-500 dark:text-cyan-400" />
            <span>Search doctors...</span>
          </button>

          {/* Notifications Shortcut */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darksurface transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-darkcard animate-pulse"></span>
            )}
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darksurface transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User Profile Info & Logout */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200/80 dark:border-darkborder">
            <Link to="/profile" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-cyan-950/40 text-primary-600 dark:text-cyan-400 flex items-center justify-center font-extrabold text-xs border border-primary-100 dark:border-cyan-900/50 shadow-sm group-hover:scale-105 transition-transform">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="user" className="w-full h-full rounded-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'P'
                )}
              </div>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 hidden lg:inline group-hover:text-primary-600 dark:group-hover:text-cyan-400 transition-colors">
                {user?.name?.split(' ')[0]}
              </span>
            </Link>

            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex flex-1 pt-16">
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-16 bottom-0 bg-white dark:bg-darkcard border-r border-slate-200/80 dark:border-darkborder p-4 justify-between z-30">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Navigation Menu
            </div>
            
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                    active 
                      ? 'bg-primary-600 dark:bg-cyan-600 text-white shadow-md shadow-primary-500/20 dark:shadow-cyan-500/10' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-darksurface hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && !active && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom Sidebar Promo */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-500/10 via-cyan-500/10 to-emerald-500/10 dark:from-cyan-950/40 dark:to-emerald-950/40 border border-primary-100 dark:border-cyan-900/50 space-y-2 text-center">
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-darkcard text-primary-600 dark:text-cyan-400 flex items-center justify-center mx-auto shadow-sm">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white">Need Quick Advice?</div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Use 24/7 Gemini AI Assistant</p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-16 left-0 bottom-0 w-72 bg-white dark:bg-darkcard border-r border-slate-200 dark:border-darkborder p-4 z-50 flex flex-col justify-between lg:hidden"
              >
                <div className="space-y-1">
                  <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Patient Navigation
                  </div>

                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                          active 
                            ? 'bg-primary-600 dark:bg-cyan-600 text-white shadow-md' 
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-darksurface'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                <button
                  onClick={() => { logout(); setSidebarOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs font-extrabold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 min-w-0 transition-all duration-300">
          {children}
        </main>
      </div>

      <AIAssistant />
    </div>
  );
};

export default PatientLayout;
