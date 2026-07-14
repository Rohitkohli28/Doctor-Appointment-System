import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Stethoscope, UserCircle, LogOut, Menu, X, Calendar, Activity, Search, Shield, User, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const getPatientLinks = () => [
    { name: 'Home', path: '/', icon: Activity },
    { name: 'Find Doctors', path: '/search', icon: Search },
    { name: 'My Appointments', path: '/dashboard', icon: Calendar },
    { name: 'Medical History', path: '/medical-history', icon: Shield },
  ];

  const getDoctorLinks = () => [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: Activity },
    { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { name: 'Patients', path: '/doctor/patients', icon: User },
    { name: 'Availability', path: '/doctor/availability', icon: Clock },
    { name: 'Profile', path: '/doctor/profile', icon: UserCircle },
  ];

  const isDoctor = isAuthenticated && user?.role === 'doctor';

  const links = isAuthenticated 
    ? (isDoctor ? getDoctorLinks() : getPatientLinks())
    : [
        { name: 'Home', path: '/', icon: Activity },
        { name: 'Find Doctors', path: '/search', icon: Search },
      ];

  const navBrandColor = isDoctor 
    ? 'from-gray-900 via-emerald-700 to-emerald-600' 
    : 'from-gray-900 via-primary-700 to-primary-600';

  const activeLinkStyle = isDoctor 
    ? 'text-emerald-600 bg-emerald-50/50' 
    : 'text-primary-600 bg-primary-50/50';

  const hoverLinkStyle = isDoctor 
    ? 'text-gray-600 hover:text-emerald-500 hover:bg-gray-50' 
    : 'text-gray-600 hover:text-primary-500 hover:bg-gray-50';

  const activeIndicatorColor = isDoctor ? 'bg-emerald-600' : 'bg-primary-600';

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur-md shadow-lg shadow-gray-100/50 border-b border-gray-100' 
        : 'bg-white/70 backdrop-blur-sm border-b border-gray-100/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={isDoctor ? "/doctor/dashboard" : "/"} className="flex items-center gap-2 group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${isDoctor ? 'from-emerald-500 to-emerald-600' : 'from-primary-500 to-primary-600'} flex items-center justify-center text-white shadow-md transition-all group-hover:scale-105`}>
                <Stethoscope className="h-6 w-6" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className={`font-extrabold text-xl tracking-tight bg-gradient-to-r ${navBrandColor} bg-clip-text text-transparent ml-1`}>
                  MediCare
                </span>
                {isDoctor && (
                  <span className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 tracking-wide uppercase self-start sm:self-center">
                    Doctor Portal
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1.5">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive(link.path) ? activeLinkStyle : hoverLinkStyle
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className={`absolute bottom-0 left-4 right-4 h-0.5 ${activeIndicatorColor} rounded-full`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center gap-4 border-l border-gray-100 pl-4 ml-2">
                <Link 
                  to={isDoctor ? '/doctor/dashboard' : '/dashboard'} 
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt="profile" className={`w-8 h-8 rounded-full object-cover ring-2 ${isDoctor ? 'ring-emerald-100' : 'ring-primary-100'}`} />
                  ) : (
                    <div className={`w-8 h-8 rounded-full ${isDoctor ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-primary-50 text-primary-600 border-primary-100'} flex items-center justify-center font-bold text-sm border`}>
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                  <span className="font-semibold text-sm text-gray-800 hidden lg:inline">{user?.name?.split(' ')[0]}</span>
                </Link>
                <button 
                  onClick={logout} 
                  className="text-gray-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all active:scale-95" 
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-4">
                <Link to="/login" className="text-primary-600 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors">Login</Link>
                <Link to="/register" className="bg-primary-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-primary-500/20 hover:bg-primary-700 hover:shadow-primary-500/30 transition-all active:scale-95">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-gray-600 p-2 rounded-xl hover:bg-gray-50 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-xl overflow-hidden"
          >
            <div className="px-4 pt-3 pb-6 space-y-2">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                      isActive(link.path)
                        ? (isDoctor ? 'text-emerald-600 bg-emerald-50/70' : 'text-primary-600 bg-primary-50/70')
                        : 'text-gray-600 hover:text-primary-500 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                );
              })}

              {isAuthenticated ? (
                <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
                  <div className="flex items-center gap-3 px-4 py-2">
                    {user?.profilePhoto ? (
                      <img src={user.profilePhoto} alt="profile" className={`w-10 h-10 rounded-full object-cover ring-2 ${isDoctor ? 'ring-emerald-100' : 'ring-primary-100'}`} />
                    ) : (
                      <div className={`w-10 h-10 rounded-full ${isDoctor ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-primary-50 text-primary-600 border-primary-100'} flex items-center justify-center font-bold text-lg border`}>
                        {user?.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-gray-900">{user?.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                    </div>
                  </div>
                  <Link
                    to={isDoctor ? '/doctor/dashboard' : '/dashboard'}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold ${isDoctor ? 'text-emerald-600 hover:bg-emerald-50' : 'text-primary-600 hover:bg-primary-50'}`}
                  >
                    <User className="w-5 h-5" />
                    My Dashboard
                  </Link>
                  <button 
                    onClick={() => { logout(); setIsOpen(false); }} 
                    className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col gap-2.5">
                  <Link 
                    to="/login" 
                    onClick={() => setIsOpen(false)} 
                    className="text-center w-full text-primary-600 border border-primary-100 px-4 py-3 rounded-xl font-bold hover:bg-primary-50 transition-all"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsOpen(false)} 
                    className="text-center w-full bg-primary-600 text-white px-4 py-3 rounded-xl font-bold shadow-md shadow-primary-500/10 hover:bg-primary-700 transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
