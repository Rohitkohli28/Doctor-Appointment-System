import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import api from '../utils/api';
import { io } from 'socket.io-client';

const SlotPicker = ({ doctorId, selectedDate, setSelectedDate, selectedSlot, setSelectedSlot }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Generate next 7 days
  const nextDays = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const res = await api.get(`/doctors/${doctorId}/available-slots?date=${formattedDate}`);
        setAvailableSlots(res.data.data);
      } catch (err) {
        console.error('Error fetching slots:', err);
        setAvailableSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();

    // Socket Setup for Real-time slot booking updates
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    
    socket.on('slot-booked', (data) => {
      if (data.doctorId === doctorId && format(new Date(data.appointmentDate), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) {
        setAvailableSlots(prev => prev.filter(slot => slot !== data.timeSlot));
        if (selectedSlot === data.timeSlot) {
          setSelectedSlot('');
          alert("Sorry, this slot was just booked by another user.");
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [doctorId, selectedDate]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Select Schedule</h3>
      
      {/* Date Carousel */}
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
        {nextDays.map((date, i) => {
          const isSelected = format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
          return (
            <button
              key={i}
              onClick={() => { setSelectedDate(date); setSelectedSlot(''); }}
              className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-all ${
                isSelected 
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 ring-2 ring-primary-500 ring-offset-2' 
                : 'bg-gray-50 text-gray-600 hover:bg-primary-50 hover:text-primary-600 border border-gray-100'
              }`}
            >
              <span className="text-xs uppercase font-medium">{format(date, 'EEE')}</span>
              <span className={`text-xl font-bold mt-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>{format(date, 'd')}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          Available Time
          {loading && <span className="flex gap-1 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{animationDelay: '100ms'}}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{animationDelay: '200ms'}}></span>
          </span>}
        </h4>

        {availableSlots.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {availableSlots.map((slot, i) => (
              <button
                key={i}
                onClick={() => setSelectedSlot(slot)}
                className={`py-2 px-3 text-sm font-medium rounded-xl transition-all ${
                  selectedSlot === slot
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20 ring-1 ring-primary-500'
                  : 'bg-gray-50 text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        ) : (
          !loading && <div className="text-center py-8 text-sm text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            No slots available for this date. Please select another day.
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotPicker;
