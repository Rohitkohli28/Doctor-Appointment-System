import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import useDebounce from '../hooks/useDebounce';
import DoctorCard from '../components/DoctorCard';
import SearchFilters from '../components/SearchFilters';
import { Search, MapPin, SlidersHorizontal, Stethoscope, RefreshCw } from 'lucide-react';
import { SkeletonCard } from '../components/SkeletonLoader';
import { motion } from 'framer-motion';

const SearchDoctors = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [filters, setFilters] = useState({
    name: queryParams.get('name') || '',
    city: queryParams.get('city') || '',
    specialization: queryParams.get('specialization') || '',
    minFee: '',
    maxFee: '',
    rating: 0,
    page: 1,
    limit: 12
  });

  const [sortBy, setSortBy] = useState('rating');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  const debouncedFilters = useDebounce(filters, 400);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(debouncedFilters).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== 0) {
             params.append(key, value);
          }
        });

        const res = await api.get(`/doctors?${params.toString()}`);
        setDoctors(res.data.data || []);
        setPagination({
           page: res.data.page || 1,
           pages: res.data.pages || 1,
           total: res.data.total || 0
        });
      } catch (error) {
        console.error("Error fetching doctors", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [debouncedFilters]);

  // Client-side sort application
  const sortedDoctors = [...doctors].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'fee-low') return (a.consultationFee || 0) - (b.consultationFee || 0);
    if (sortBy === 'experience') return (b.experience || 0) - (a.experience || 0);
    return 0;
  });

  const handleResetFilters = () => {
    setFilters({
      name: '',
      city: '',
      specialization: '',
      minFee: '',
      maxFee: '',
      rating: 0,
      page: 1,
      limit: 12
    });
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Find Your Doctor
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Search verified board-certified practitioners and book real-time appointments.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="bg-white dark:bg-darkcard p-3 rounded-3xl shadow-sm border border-slate-200/80 dark:border-darkborder flex flex-col sm:flex-row gap-3 mb-8">
           <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-darksurface rounded-2xl border border-slate-100 dark:border-darkborder">
             <Search className="w-5 h-5 text-primary-600 dark:text-cyan-400 shrink-0" />
             <input 
               type="text" 
               placeholder="Search doctor by name..." 
               value={filters.name}
               onChange={(e) => setFilters({...filters, name: e.target.value, page: 1})}
               className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium"
             />
           </div>
           
           <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-darksurface rounded-2xl border border-slate-100 dark:border-darkborder">
             <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
             <input 
               type="text" 
               placeholder="City, locality or hospital..." 
               value={filters.city}
               onChange={(e) => setFilters({...filters, city: e.target.value, page: 1})}
               className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium"
             />
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-1/4 shrink-0">
            <SearchFilters filters={filters} setFilters={setFilters} />
          </div>

          {/* Doctors Grid Container */}
          <div className="w-full lg:w-3/4">
            
            {/* Sorting Header Bar */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 bg-white dark:bg-darkcard rounded-2xl border border-slate-200/80 dark:border-darkborder shadow-sm text-xs font-bold text-slate-600 dark:text-slate-300">
                <span>Found <strong className="text-slate-900 dark:text-white font-extrabold">{pagination.total || doctors.length}</strong> verified doctors</span>
                
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase text-[10px]">Sort By:</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 dark:bg-darksurface border border-slate-200 dark:border-darkborder rounded-xl px-3 py-1.5 outline-none font-bold text-slate-800 dark:text-white cursor-pointer text-xs"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="fee-low">Lowest Consultation Fee</option>
                    <option value="experience">Most Experienced</option>
                  </select>
                </div>
            </div>

            {/* Main Doctor Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {[1, 2, 3, 4].map(i => (
                    <SkeletonCard key={i} />
                 ))}
              </div>
            ) : sortedDoctors.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {sortedDoctors.map(doctor => (
                  <DoctorCard key={doctor._id} doctor={doctor} />
                ))}
              </div>
            ) : (
              /* Requirement 10: Empty State Illustration & Message */
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-darkcard p-12 rounded-3xl shadow-sm border border-slate-200/80 dark:border-darkborder text-center flex flex-col items-center justify-center min-h-[420px]"
              >
                <div className="w-24 h-24 bg-primary-50 dark:bg-cyan-950/40 rounded-3xl flex items-center justify-center mb-6 border border-primary-100 dark:border-cyan-900/50 shadow-md text-primary-600 dark:text-cyan-400">
                  <Stethoscope className="w-12 h-12" />
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                  No doctors found matching your filters.
                </h3>
                
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-md mx-auto mb-6">
                  We couldn't find any medical specialists matching your exact criteria. Try one of these suggestions:
                </p>

                <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-md">
                  <button 
                    onClick={() => setFilters({ ...filters, specialization: 'General Physician', name: '', city: '', page: 1 })}
                    className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-darksurface hover:bg-primary-50 dark:hover:bg-cyan-950/40 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-cyan-400 text-xs font-bold transition-all border border-slate-200 dark:border-darkborder"
                  >
                    🩺 General Physician
                  </button>
                  <button 
                    onClick={() => setFilters({ ...filters, specialization: 'Cardiology', name: '', city: '', page: 1 })}
                    className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-darksurface hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 text-xs font-bold transition-all border border-slate-200 dark:border-darkborder"
                  >
                    💓 Cardiology
                  </button>
                  <button 
                    onClick={() => setFilters({ ...filters, city: 'Mumbai', page: 1 })}
                    className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-darksurface hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-xs font-bold transition-all border border-slate-200 dark:border-darkborder"
                  >
                    📍 Search Mumbai
                  </button>
                </div>

                <button 
                  onClick={handleResetFilters}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2 active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" /> Reset All Filters
                </button>
              </motion.div>
            )}

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
               <div className="mt-10 flex justify-center items-center gap-3">
                 <button 
                   disabled={filters.page === 1}
                   onClick={() => setFilters(prev => ({...prev, page: prev.page - 1}))}
                   className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-darkborder bg-white dark:bg-darkcard shadow-sm hover:bg-slate-50 dark:hover:bg-darksurface disabled:opacity-40 disabled:cursor-not-allowed text-xs font-extrabold text-slate-700 dark:text-slate-300 transition-colors"
                 >
                   Previous
                 </button>

                 <span className="px-5 py-2.5 rounded-xl bg-primary-50 dark:bg-cyan-950/40 text-primary-700 dark:text-cyan-400 font-extrabold border border-primary-100 dark:border-cyan-900/50 shadow-sm text-xs">
                   Page {filters.page} of {pagination.pages}
                 </span>

                 <button 
                   disabled={filters.page === pagination.pages}
                   onClick={() => setFilters(prev => ({...prev, page: prev.page + 1}))}
                   className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-darkborder bg-white dark:bg-darkcard shadow-sm hover:bg-slate-50 dark:hover:bg-darksurface disabled:opacity-40 disabled:cursor-not-allowed text-xs font-extrabold text-slate-700 dark:text-slate-300 transition-colors"
                 >
                   Next
                 </button>
               </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SearchDoctors;
