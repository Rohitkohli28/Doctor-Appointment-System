import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Stethoscope, UserCircle, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 glass-panel border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-primary-600">
              <Stethoscope className="h-8 w-8 text-primary-500" />
              <span className="font-bold text-xl tracking-tight text-gray-900">MediCare</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Home</Link>
            <Link to="/search" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Find Doctors</Link>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4 border-l pl-4">
                <Link to={user?.role === 'doctor' ? '/doctor/dashboard' : '/dashboard'} className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors">
                  {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt="profile" className="w-8 h-8 rounded-full object-cover shadow-sm" />
                  ) : (
                    <UserCircle className="w-6 h-6" />
                  )}
                  <span className="font-medium text-sm">{user?.name}</span>
                </Link>
                <button onClick={logout} className="text-gray-500 hover:text-red-500 transition-colors" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-primary-600 font-medium px-4 py-2 border border-primary-200 rounded-full hover:bg-primary-50 transition-colors">Login</Link>
                <Link to="/register" className="bg-primary-600 text-white font-medium px-5 py-2 rounded-full shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-colors">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-gray-100 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md font-medium text-gray-900 hover:bg-gray-50">Home</Link>
            <Link to="/search" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md font-medium text-gray-900 hover:bg-gray-50">Find Doctors</Link>
            {isAuthenticated ? (
              <>
                <Link to={user?.role === 'doctor' ? '/doctor/dashboard' : '/dashboard'} onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md font-medium text-primary-600 bg-primary-50">Dashboard</Link>
                <button onClick={() => { logout(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md font-medium text-red-600 hover:bg-red-50">Logout</button>
              </>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                <Link to="/login" onClick={() => setIsOpen(false)} className="block text-center w-full text-primary-600 border border-primary-200 px-4 py-2 rounded-lg font-medium">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="block text-center w-full bg-primary-600 text-white px-4 py-2 rounded-lg font-medium shadow-md">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
