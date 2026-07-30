import { useState, useEffect } from 'react';
import { Filter, Star, IndianRupee } from 'lucide-react';
import api from '../utils/api';

const SearchFilters = ({ filters, setFilters }) => {
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const res = await api.get('/doctors/specializations');
        setSpecializations(res.data.data);
      } catch (error) {
        console.error("Failed fetching specializations", error);
      }
    };
    fetchSpecializations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  return (
    <div className="bg-white dark:bg-darkcard rounded-3xl shadow-sm border border-slate-200/80 dark:border-darkborder p-6 sticky top-24 space-y-6 transition-colors duration-300">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-darkborder">
        <Filter className="w-5 h-5 text-primary-600 dark:text-cyan-400" />
        <h3 className="font-black text-lg text-slate-900 dark:text-white tracking-tight">Filters</h3>
      </div>

      <div className="space-y-6">
        {/* Specialization Filter */}
        <div>
          <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Specialization</label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="specialization" 
                value="" 
                checked={filters.specialization === ''} 
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 dark:text-cyan-400 border-slate-300 dark:border-darkborder focus:ring-primary-500 dark:focus:ring-cyan-500"
              />
              <span className={`text-xs font-bold transition-colors ${filters.specialization === '' ? 'text-primary-600 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-cyan-400'}`}>
                All Specialties
              </span>
            </label>
            {specializations.map((spec, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="specialization" 
                  value={spec} 
                  checked={filters.specialization === spec} 
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 dark:text-cyan-400 border-slate-300 dark:border-darkborder focus:ring-primary-500 dark:focus:ring-cyan-500"
                />
                <span className={`text-xs font-bold transition-colors ${filters.specialization === spec ? 'text-primary-600 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-cyan-400'}`}>
                  {spec}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Minimum Rating</label>
          <div className="space-y-2">
            {[4, 3, 2, 0].map(star => (
              <label key={star} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="rating" 
                  value={star} 
                  checked={filters.rating == star} 
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 dark:text-cyan-400 border-slate-300 dark:border-darkborder focus:ring-primary-500 dark:focus:ring-cyan-500"
                />
                <div className="flex items-center gap-1 text-xs font-bold">
                  {star === 0 ? (
                    <span className={`transition-colors ${filters.rating == 0 ? 'text-primary-600 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-cyan-400'}`}>Any Rating</span>
                  ) : (
                    <>
                      {Array.from({length: star}).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                      <span className="text-slate-600 dark:text-slate-300 ml-1 group-hover:text-primary-600 dark:group-hover:text-cyan-400 transition-colors">& up</span>
                    </>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div>
          <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Fee Range (INR)</label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <IndianRupee className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="number" 
                name="minFee" 
                placeholder="Min" 
                value={filters.minFee}
                onChange={handleChange}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-darksurface border border-slate-200 dark:border-darkborder rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 dark:focus:ring-cyan-500 outline-none transition-all"
              />
            </div>
            <span className="text-slate-400 font-bold text-xs">-</span>
            <div className="relative flex-1">
              <IndianRupee className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="number" 
                name="maxFee" 
                placeholder="Max" 
                value={filters.maxFee}
                onChange={handleChange}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-darksurface border border-slate-200 dark:border-darkborder rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 dark:focus:ring-cyan-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
