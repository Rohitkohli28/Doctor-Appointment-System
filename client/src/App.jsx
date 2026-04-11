import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';

// Layout & Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';

// Pages
import Home from './pages/Home';
import SearchDoctors from './pages/SearchDoctors';
import DoctorProfile from './pages/DoctorProfile';
import BookAppointment from './pages/BookAppointment';
import PatientDashboard from './pages/PatientDashboard';
import PaymentPage from './pages/PaymentPage';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import MedicalHistory from './pages/MedicalHistory';
import Login from './pages/Login';
import Register from './pages/Register';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen relative font-sans">
        <Toaster position="top-center" />
        <Navbar />
        
        <main className="flex-grow pt-16">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchDoctors />} />
            <Route path="/doctors/:id" element={<DoctorProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Patient Routes */}
            <Route 
              path="/book/:doctorId" 
              element={<ProtectedRoute allowedRoles={['patient']}><BookAppointment /></ProtectedRoute>} 
            />
            <Route 
              path="/dashboard" 
              element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} 
            />
            <Route 
              path="/payment" 
              element={<ProtectedRoute allowedRoles={['patient']}><PaymentPage /></ProtectedRoute>} 
            />
            <Route 
              path="/medical-history" 
              element={<ProtectedRoute allowedRoles={['patient']}><MedicalHistory /></ProtectedRoute>} 
            />

            {/* Doctor Routes */}
            <Route 
              path="/doctor/dashboard" 
              element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} 
            />
          </Routes>
        </main>

        <Footer />
        <AIAssistant />
      </div>
    </Router>
  );
}

export default App;
