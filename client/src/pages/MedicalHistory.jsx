import { useState, useEffect } from 'react';
import api from '../utils/api';
import MedicalHistoryForm from '../components/MedicalHistoryForm';
import { Activity } from 'lucide-react';

const MedicalHistory = () => {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/medical-history/me');
        setHistoryData(res.data.data);
      } catch (error) {
        console.error('No existing history found or error', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-200 border-dashed">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-inner">
             <Activity className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">Medical Profile</h1>
            <p className="text-gray-500 font-medium">Keep your health information updated for better medical care.</p>
          </div>
        </div>

        <MedicalHistoryForm initialData={historyData} onSaveSuccess={(data) => setHistoryData(data)} />
      </div>
    </div>
  );
};

export default MedicalHistory;
