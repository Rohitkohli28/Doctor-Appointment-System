import { Star, MapPin, Building2, Clock, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';

const DoctorCard = ({ doctor }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="flex flex-col sm:flex-row p-6 gap-6">
        <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 mx-auto sm:mx-0 relative">
          <img 
            src={doctor.userId?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.userId?.name || 'Dr')}&background=0D8ABC&color=fff&size=150`} 
            alt={doctor.userId?.name} 
            className="w-full h-full object-cover rounded-full sm:rounded-2xl shadow-sm group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute -bottom-2 -right-2 bg-white px-2 py-1 rounded-lg text-xs font-bold text-yellow-600 shadow flex items-center gap-1 border border-gray-100">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            {doctor.rating}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
            {doctor.specialization}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-1">Dr. {doctor.userId?.name}</h3>
          <p className="text-gray-500 text-sm mb-4 line-clamp-1">{doctor.qualifications?.join(', ')}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 w-full">
            <div className="flex items-center gap-2 text-sm text-gray-600 justify-center sm:justify-start">
              <Clock className="w-4 h-4 text-primary-500" />
              <span>{doctor.experience} Years Exp.</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 justify-center sm:justify-start">
              <Building2 className="w-4 h-4 text-emerald-500" />
              <span className="truncate">{doctor.hospitalName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 justify-center sm:justify-start">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span className="truncate">{doctor.hospitalAddress}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-900 font-semibold justify-center sm:justify-start">
              <IndianRupee className="w-4 h-4 text-gray-700" />
              <span>{doctor.consultationFee} </span>
              <span className="font-normal text-gray-500 text-xs ml-1">/ session</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center sm:flex-row flex-col gap-4">
        <div className="text-xs text-gray-500 font-medium">
          <span className="text-primary-600">{doctor.totalReviews} </span>
          Patient stories
        </div>
        <Link 
          to={`/doctors/${doctor._id}`}
          className="w-full sm:w-auto text-center bg-primary-600 hover:bg-primary-700 text-white px-8 py-2.5 rounded-xl font-medium shadow-md shadow-primary-500/20 transition-all hover:-translate-y-0.5"
        >
          Book Appointment
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;
