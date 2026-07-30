import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

import PublicLayout from './components/PublicLayout';
import PatientLayout from './components/PatientLayout';
import DoctorLayout from './components/DoctorLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Code Splitting / Lazy Loading for Page Routes
const Home = lazy(() => import('./pages/Home'));
const SearchDoctors = lazy(() => import('./pages/SearchDoctors'));
const DoctorProfile = lazy(() => import('./pages/DoctorProfile'));
const BookAppointment = lazy(() => import('./pages/BookAppointment'));
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'));
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const PatientProfilePage = lazy(() => import('./pages/PatientProfilePage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const AppointmentSuccess = lazy(() => import('./pages/AppointmentSuccess'));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard'));
const MedicalHistory = lazy(() => import('./pages/MedicalHistory'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const DoctorLogin = lazy(() => import('./pages/DoctorLogin'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.25, ease: 'easeIn' } }
};

const AnimatedPage = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    {children}
  </motion.div>
);

const PageLoadingFallback = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
    <div className="w-12 h-12 border-4 border-primary-100 dark:border-slate-800 border-t-primary-600 dark:border-t-cyan-400 rounded-full animate-spin mb-4"></div>
    <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px]">Loading page content...</p>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <PageLoadingFallback />;
  }

  if (!isAuthenticated) {
    if (allowedRoles && allowedRoles.includes('doctor')) {
      return <Navigate to="/doctor/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'patient' && location.pathname.startsWith('/doctor/')) {
      toast.error('Access restricted: Doctor portal is for verified medical practitioners only.');
      return <Navigate to="/dashboard" replace />;
    }
    if (user?.role === 'doctor' && !location.pathname.startsWith('/doctor/')) {
      return <Navigate to="/doctor/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Animated route switch
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes location={location} key={location.pathname}>
          
          {/* Public Marketing & Auth Routes */}
          <Route path="/" element={<PublicLayout><AnimatedPage><Home /></AnimatedPage></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><AnimatedPage><Login /></AnimatedPage></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><AnimatedPage><Register /></AnimatedPage></PublicLayout>} />
          <Route path="/doctor/login" element={<PublicLayout><AnimatedPage><DoctorLogin /></AnimatedPage></PublicLayout>} />
          <Route path="/forgot-password" element={<PublicLayout><AnimatedPage><ForgotPassword /></AnimatedPage></PublicLayout>} />
          <Route path="/reset-password/:token" element={<PublicLayout><AnimatedPage><ResetPassword /></AnimatedPage></PublicLayout>} />

          {/* Protected Patient Portal Routes (PatientLayout with Sidebar & Topbar) */}
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout><AnimatedPage><PatientDashboard /></AnimatedPage></PatientLayout></ProtectedRoute>} 
          />
          <Route 
            path="/find-doctors" 
            element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout><AnimatedPage><SearchDoctors /></AnimatedPage></PatientLayout></ProtectedRoute>} 
          />
          <Route 
            path="/search" 
            element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout><AnimatedPage><SearchDoctors /></AnimatedPage></PatientLayout></ProtectedRoute>} 
          />
          <Route 
            path="/doctors/:id" 
            element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout><AnimatedPage><DoctorProfile /></AnimatedPage></PatientLayout></ProtectedRoute>} 
          />
          <Route 
            path="/book/:doctorId" 
            element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout><AnimatedPage><BookAppointment /></AnimatedPage></PatientLayout></ProtectedRoute>} 
          />
          <Route 
            path="/appointments" 
            element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout><AnimatedPage><AppointmentsPage /></AnimatedPage></PatientLayout></ProtectedRoute>} 
          />
          <Route 
            path="/history" 
            element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout><AnimatedPage><MedicalHistory /></AnimatedPage></PatientLayout></ProtectedRoute>} 
          />
          <Route 
            path="/medical-history" 
            element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout><AnimatedPage><MedicalHistory /></AnimatedPage></PatientLayout></ProtectedRoute>} 
          />
          <Route 
            path="/notifications" 
            element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout><AnimatedPage><NotificationsPage /></AnimatedPage></PatientLayout></ProtectedRoute>} 
          />
          <Route 
            path="/profile" 
            element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout><AnimatedPage><PatientProfilePage /></AnimatedPage></PatientLayout></ProtectedRoute>} 
          />
          <Route 
            path="/payment" 
            element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout><AnimatedPage><PaymentPage /></AnimatedPage></PatientLayout></ProtectedRoute>} 
          />
          <Route 
            path="/appointment-success" 
            element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout><AnimatedPage><AppointmentSuccess /></AnimatedPage></PatientLayout></ProtectedRoute>} 
          />

          {/* Doctor Portal Routes */}
          <Route 
            path="/doctor/dashboard" 
            element={<ProtectedRoute allowedRoles={['doctor']}><DoctorLayout><AnimatedPage><DoctorDashboard view="dashboard" /></AnimatedPage></DoctorLayout></ProtectedRoute>} 
          />
          <Route 
            path="/doctor/appointments" 
            element={<ProtectedRoute allowedRoles={['doctor']}><DoctorLayout><AnimatedPage><DoctorDashboard view="appointments" /></AnimatedPage></DoctorLayout></ProtectedRoute>} 
          />
          <Route 
            path="/doctor/patients" 
            element={<ProtectedRoute allowedRoles={['doctor']}><DoctorLayout><AnimatedPage><DoctorDashboard view="patients" /></AnimatedPage></DoctorLayout></ProtectedRoute>} 
          />
          <Route 
            path="/doctor/availability" 
            element={<ProtectedRoute allowedRoles={['doctor']}><DoctorLayout><AnimatedPage><DoctorDashboard view="availability" /></AnimatedPage></DoctorLayout></ProtectedRoute>} 
          />
          <Route 
            path="/doctor/profile" 
            element={<ProtectedRoute allowedRoles={['doctor']}><DoctorLayout><AnimatedPage><DoctorDashboard view="profile" /></AnimatedPage></DoctorLayout></ProtectedRoute>} 
          />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<PublicLayout><AnimatedPage><NotFound /></AnimatedPage></PublicLayout>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
          <Toaster position="top-center" />
          <AnimatedRoutes />
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
