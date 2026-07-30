import { useState, useEffect, useRef } from 'react';
import { format, addDays } from 'date-fns';
import api from '../utils/api';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SlotPicker = ({ doctorId, selectedDate, setSelectedDate, selectedSlot, setSelectedSlot }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const selectedSlotRef = useRef(selectedSlot);

  useEffect(() => {
    selectedSlotRef.current = selectedSlot;
  }, [selectedSlot]);

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
        if (selectedSlotRef.current === data.timeSlot) {
          setSelectedSlot('');
          toast.error("Sorry, this slot was just booked by another user.");
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [doctorId, selectedDate]);

  return (
    <div className="bg-white dark:bg-darkcard rounded-3xl shadow-sm border border-slate-200/80 dark:border-darkborder p-6 space-y-6 transition-colors duration-300">
      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Select Schedule</h3>
      
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
                ? 'bg-primary-600 dark:bg-cyan-600 text-white shadow-lg shadow-primary-500/20 ring-2 ring-primary-500 dark:ring-cyan-500 ring-offset-2 dark:ring-offset-darkcard' 
                : 'bg-slate-50 dark:bg-darksurface text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-cyan-950/40 hover:text-primary-600 dark:hover:text-cyan-400 border border-slate-100 dark:border-darkborder'
              }`}
            >
              <span className="text-xs uppercase font-extrabold">{format(date, 'EEE')}</span>
              <span className={`text-xl font-black mt-1 ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{format(date, 'd')}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
          Available Time Slots
          {loading && <span className="flex gap-1 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-cyan-400 animate-bounce"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-cyan-400 animate-bounce" style={{animationDelay: '100ms'}}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-cyan-400 animate-bounce" style={{animationDelay: '200ms'}}></span>
          </span>}
        </h4>

        {availableSlots.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {availableSlots.map((slot, i) => (
              <button
                key={i}
                onClick={() => setSelectedSlot(slot)}
                className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all ${
                  selectedSlot === slot
                  ? 'bg-primary-600 dark:bg-cyan-600 text-white shadow-md ring-1 ring-primary-500 dark:ring-cyan-400'
                  : 'bg-slate-50 dark:bg-darksurface text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-cyan-950/40 hover:text-primary-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-darkborder'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        ) : (
          !loading && <div className="text-center py-8 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-darksurface rounded-2xl border border-dashed border-slate-200 dark:border-darkborder">
            No slots available for this date. Please select another day.
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotPicker;
