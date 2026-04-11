import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import useDebounce from '../hooks/useDebounce';
import DoctorCard from '../components/DoctorCard';
import SearchFilters from '../components/SearchFilters';
import { Search } from 'lucide-react';

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
    limit: 10
  });

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  const debouncedFilters = useDebounce(filters, 500);

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
        setDoctors(res.data.data);
        setPagination({
           page: res.data.page,
           pages: res.data.pages,
           total: res.data.total
        });
      } catch (error) {
        console.error("Error fetching doctors", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [debouncedFilters]);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center lg:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Find your specialist</h1>
          <p className="text-gray-500 text-lg max-w-2xl">Browse through thousands of trusted doctors and book your appointment instantly.</p>
        </div>

        {/* Global Search Bar */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 relative z-10 mb-10">
           <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl relative group focus-within:ring-2 focus-within:ring-primary-500 transition-all">
             <Search className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500" />
             <input 
               type="text" 
               placeholder="Search doctor by name..." 
               value={filters.name}
               onChange={(e) => setFilters({...filters, name: e.target.value, page: 1})}
               className="w-full bg-transparent border-none outline-none text-gray-900 focus:ring-0 placeholder-gray-400"
             />
           </div>
           
           <input 
             type="text" 
             placeholder="City, State" 
             value={filters.city}
             onChange={(e) => setFilters({...filters, city: e.target.value, page: 1})}
             className="flex-1 px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder-gray-400 text-gray-900"
           />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <SearchFilters filters={filters} setFilters={setFilters} />
          </div>

          {/* Main Content */}
          <div className="w-full lg:w-3/4">
            <div className="mb-6 flex justify-between items-center text-sm font-medium text-gray-500 px-2 rounded-lg py-2 bg-white border border-gray-100 shadow-sm">
                <span>Showing {doctors.length} of {pagination.total || 0} doctors</span>
                <span className="flex items-center gap-2">Sort by <select className="bg-transparent border-none focus:ring-0 outline-none text-gray-900 font-semibold cursor-pointer"><option>Relevance</option><option>Rating</option><option>Experience</option></select></span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                 {[1,2,3].map(i => (
                    <div key={i} className="animate-pulse bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6">
                       <div className="w-32 h-32 bg-gray-200 rounded-2xl"></div>
                       <div className="flex-1 space-y-4">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                       </div>
                    </div>
                 ))}
              </div>
            ) : doctors.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-6">
                {doctors.map(doctor => (
                  <DoctorCard key={doctor._id} doctor={doctor} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-6 border border-primary-100 shadow-sm">
                  <Search className="w-10 h-10 text-primary-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">No doctors found</h3>
                <p className="text-gray-500 max-w-md mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                <button 
                  onClick={() => setFilters({ name: '', city: '', specialization: '', minFee: '', maxFee: '', rating: 0, page: 1, limit: 10 })}
                  className="mt-8 text-primary-600 font-bold hover:bg-primary-50 px-6 py-2 rounded-xl transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
               <div className="mt-12 flex justify-center gap-2">
                 <button 
                   disabled={filters.page === 1}
                   onClick={() => setFilters(prev => ({...prev, page: prev.page - 1}))}
                   className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-gray-700 transition-colors"
                 >
                   Previous
                 </button>
                 <span className="px-5 py-2.5 rounded-xl bg-primary-50 text-primary-700 font-bold border border-primary-100 shadow-sm text-sm flex items-center">
                   Page {filters.page} of {pagination.pages}
                 </span>
                 <button 
                   disabled={filters.page === pagination.pages}
                   onClick={() => setFilters(prev => ({...prev, page: prev.page + 1}))}
                   className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-gray-700 transition-colors"
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
