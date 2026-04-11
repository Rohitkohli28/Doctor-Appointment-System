import { Heart, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Heart className="h-6 w-6 text-primary-500" />
              <span className="font-bold text-xl text-white tracking-tight">MediCare</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Premium healthcare appointment scheduling and AI assistant platform. Find the best doctors near you with ease.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/search" className="hover:text-primary-400 transition-colors">Find a Doctor</Link></li>
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">Book Appointment</Link></li>
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">Patient Login</Link></li>
              <li><Link to="/register" className="hover:text-primary-400 transition-colors">Register as Patient</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Specialties</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/search?specialization=Cardiologist" className="hover:text-primary-400 transition-colors">Cardiology</Link></li>
              <li><Link to="/search?specialization=Neurologist" className="hover:text-primary-400 transition-colors">Neurology</Link></li>
              <li><Link to="/search?specialization=Pediatrician" className="hover:text-primary-400 transition-colors">Pediatrics</Link></li>
              <li><Link to="/search?specialization=Dermatologist" className="hover:text-primary-400 transition-colors">Dermatology</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span>123 Health Ave, Medical District, NY 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span>+1 (800) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span>support@medicare.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} MediCare. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
