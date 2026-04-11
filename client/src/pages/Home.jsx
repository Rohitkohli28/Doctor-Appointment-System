import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Activity, HeartPulse, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import DoctorCard from '../components/DoctorCard';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [city, setCity] = useState('');
  const [topDoctors, setTopDoctors] = useState([]);
  const navigate = useNavigate();

  const specializations = [
    { name: 'Cardiologist', icon: HeartPulse, color: 'text-rose-500', bg: 'bg-rose-50' },
    { name: 'Neurologist', icon: Activity, color: 'text-violet-500', bg: 'bg-violet-50' },
    { name: 'Pediatrician', icon: UserCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
    { name: 'Dermatologist', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    // Add more as needed
  ];

  useEffect(() => {
    const fetchTopDoctors = async () => {
      try {
        const res = await api.get('/doctors?rating=4.0&limit=3');
        setTopDoctors(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTopDoctors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('name', searchTerm);
    if (city) params.append('city', city);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-primary-50">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-5 mix-blend-multiply"></div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-50 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="text-primary-600 font-semibold tracking-wider uppercase text-sm mb-4 block">Premium Healthcare</span>
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                Find the right doctor, right <span className="text-primary-600">now.</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed font-light">
                Book appointments with the best specialists in your area. Trusted by millions of patients.
              </p>
            </motion.div>

            <motion.form 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              onSubmit={handleSearch} 
              className="bg-white p-2 sm:p-3 rounded-2xl shadow-xl border border-gray-100 flex flex-col sm:flex-row gap-2"
            >
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl relative group focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                <Search className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Doctor name, symptoms..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl relative group focus-within:ring-2 focus-within:ring-primary-500 transition-all border-t sm:border-t-0 sm:border-l border-gray-200">
                <MapPin className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="City or location" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
              <button 
                type="submit" 
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-primary-500/30 w-full sm:w-auto flex justify-center items-center gap-2"
              >
                Search <ArrowRight className="w-4 h-4 hidden sm:block" />
              </button>
            </motion.form>
          </div>
        </div>
      </section>

      {/* Specializations Horizontal Scroll */}
      <section className="py-20 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Popular Specializations</h2>
              <p className="text-gray-500 mt-2">Find experts by their medical specialty.</p>
            </div>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar custom-scrollbar">
            {specializations.map((spec, i) => {
              const Icon = spec.icon;
              return (
                <Link 
                  key={i} 
                  to={`/search?specialization=${spec.name}`}
                  className="flex-shrink-0 w-64 p-6 rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300 group bg-gray-50 hover:bg-white cursor-pointer hover:-translate-y-1 block"
                >
                  <div className={`w-14 h-14 rounded-2xl ${spec.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${spec.color}`} />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{spec.name}</h3>
                  <div className="flex items-center text-primary-600 text-sm font-semibold group-hover:gap-2 transition-all">
                    View doctors <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Top Doctors */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Top Rated Doctors</h2>
              <p className="text-gray-500 mt-3 text-lg">Highly recommended specialists with exceptional patient reviews.</p>
            </div>
            <Link to="/search" className="hidden sm:flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-800 transition-colors">
              See all doctors <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topDoctors.map(doctor => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))}
          </div>
          
          <div className="mt-10 sm:hidden">
             <Link to="/search" className="w-full flex justify-center items-center gap-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
               See all doctors <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-50 rounded-l-[100px] -z-10 opacity-50 hidden lg:block"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-primary-600 font-bold tracking-wider uppercase text-sm mb-3 block">Process</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-16 tracking-tight">How it works?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
             <div className="hidden md:block absolute top-12 left-1/6 w-2/3 h-0.5 bg-gradient-to-r from-primary-100 via-primary-300 to-primary-100 z-0"></div>
            
            {[
              { title: 'Search Doctor', desc: 'Find the right specialist by expertise or location.', step: '1' },
              { title: 'Book Appointment', desc: 'Choose a suitable time slot and confirm your booking.', step: '2' },
              { title: 'Consult', desc: 'Visit the clinic or consult online seamlessly.', step: '3' }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center group">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-primary-50 flex items-center justify-center text-3xl font-extrabold text-primary-600 mb-6 shadow-xl shadow-primary-500/10 group-hover:scale-110 group-hover:border-primary-100 transition-all duration-300">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
