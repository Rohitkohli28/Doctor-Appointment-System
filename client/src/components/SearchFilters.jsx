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
    }
    fetchSpecializations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
        <Filter className="w-5 h-5 text-primary-600" />
        <h3 className="font-bold text-lg text-gray-900">Filters</h3>
      </div>

      <div className="space-y-6">
        {/* Specialization Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Specialization</label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="specialization" 
                value="" 
                checked={filters.specialization === ''} 
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="text-gray-600 group-hover:text-primary-600 transition-colors">All Specialties</span>
            </label>
            {specializations.map((spec, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="specialization" 
                  value={spec} 
                  checked={filters.specialization === spec} 
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="text-gray-600 group-hover:text-primary-600 transition-colors">{spec}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Minimum Rating</label>
          <div className="space-y-2">
            {[4, 3, 2, 0].map(star => (
              <label key={star} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="rating" 
                  value={star} 
                  checked={filters.rating == star} 
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <div className="flex items-center gap-1">
                  {star === 0 ? <span className="text-gray-600 group-hover:text-primary-600 transition-colors">Any Rating</span> : (
                     <>
                        {Array.from({length: star}).map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                        <span className="text-gray-600 text-sm ml-1 group-hover:text-primary-600 transition-colors">& up</span>
                     </>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Fee Range (INR)</label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <IndianRupee className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input 
                type="number" 
                name="minFee" 
                placeholder="Min" 
                value={filters.minFee}
                onChange={handleChange}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
            </div>
            <span className="text-gray-400">-</span>
            <div className="relative">
              <IndianRupee className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input 
                type="number" 
                name="maxFee" 
                placeholder="Max" 
                value={filters.maxFee}
                onChange={handleChange}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
