import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ThemeContext } from '../context/ThemeContext';
import { 
  LayoutDashboard, Calendar, Users, Clock, User, LogOut, 
  Menu, X, Sun, Moon, Stethoscope, ArrowLeft, ChevronRight, Search, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIAssistant from './AIAssistant';

const DoctorLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { name: 'My Patients', path: '/doctor/patients', icon: Users },
    { name: 'Manage Availability', path: '/doctor/availability', icon: Clock },
    { name: 'Doctor Profile', path: '/doctor/profile', icon: User },
  ];

  const getPageTitle = () => {
    const item = navItems.find(i => i.path === location.pathname);
    if (item) return item.name;
    return 'Doctor Portal';
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

          <Link to="/doctor/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center text-white shadow-md transition-all group-hover:scale-105">
              <Stethoscope className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-primary-700 to-cyan-600 dark:from-white dark:via-cyan-400 dark:to-teal-400 bg-clip-text text-transparent hidden sm:inline">
              MediCare <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 ml-1 font-black uppercase">Doctor</span>
            </span>
          </Link>

          {/* Breadcrumb & Navigation Back Button */}
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-darkborder text-xs font-semibold text-slate-500 dark:text-slate-400">
            {location.pathname !== '/doctor/dashboard' && (
              <button 
                onClick={() => navigate('/doctor/dashboard')}
                className="flex items-center gap-1 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-darksurface border border-slate-200/60 dark:border-darkborder text-slate-700 dark:text-slate-300 font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
              </button>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
            <span className="text-slate-900 dark:text-white font-extrabold">{getPageTitle()}</span>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Back to Dashboard Shortcut for Mobile/Tablet */}
          {location.pathname !== '/doctor/dashboard' && (
            <button 
              onClick={() => navigate('/doctor/dashboard')}
              className="md:hidden flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-darksurface text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-darkborder"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darksurface transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Doctor Profile Info & Logout */}
          <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200/80 dark:border-darkborder">
            <Link to="/doctor/profile" className="flex items-center gap-2.5 group">
              <img 
                src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Dr')}&background=0D8ABC&color=fff`} 
                alt={user?.name} 
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-darkborder group-hover:ring-cyan-500 transition-all shadow-sm"
              />
              <div className="hidden xl:block text-left">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight group-hover:text-cyan-500 transition-colors">
                  Dr. {user?.name || 'Doctor'}
                </p>
                <p className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 truncate">
                  Verified Practitioner
                </p>
              </div>
            </Link>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Container below Header */}
      <div className="flex pt-16 flex-1 min-h-screen">
        
        {/* Desktop Left Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-16 bottom-0 bg-white dark:bg-darkcard border-r border-slate-200/80 dark:border-darkborder z-30 p-4 justify-between">
          <div className="space-y-6">
            <div className="px-3 pt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Doctor Menu
              </span>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-extrabold transition-all group ${
                      active 
                        ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-lg shadow-cyan-600/20' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darksurface hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400 group-hover:text-cyan-500'}`} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Badge */}
          <div className="p-4 bg-slate-50 dark:bg-darksurface rounded-2xl border border-slate-100 dark:border-darkborder space-y-2">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" /> HIPAA Compliant
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Real-time patient scheduling & digital prescriptions.
            </p>
          </div>
        </aside>

        {/* Mobile Backdrop Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
            />
          )}
        </AnimatePresence>

        {/* Mobile Slide-out Drawer Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-darkcard border-r border-slate-200 dark:border-darkborder z-50 p-6 flex flex-col justify-between"
            >
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">Doctor Portal</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-extrabold transition-all ${
                          active 
                            ? 'bg-cyan-600 text-white shadow-md' 
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darksurface'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-darkborder">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-extrabold text-xs"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 min-w-0 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>

      {/* Global MediBot AI Floating Assistant */}
      <AIAssistant />
    </div>
  );
};

export default DoctorLayout;
