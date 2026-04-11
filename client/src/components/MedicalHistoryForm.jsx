import { useState } from 'react';
import { useForm as useRHForm } from 'react-hook-form';
import { Plus, X, UploadCloud, FileText, Activity, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const MedicalHistoryForm = ({ initialData, onSaveSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useRHForm({
    defaultValues: {
      bloodGroup: initialData?.bloodGroup || '',
      familyHistory: initialData?.familyHistory || ''
    }
  });

  const [allergies, setAllergies] = useState(initialData?.allergies || []);
  const [allergyInput, setAllergyInput] = useState('');
  
  const [chronicConditions, setChronicConditions] = useState(initialData?.chronicConditions || []);
  const [chronicInput, setChronicInput] = useState('');

  const [medications, setMedications] = useState(initialData?.currentMedications || []);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '' });

  const [surgeries, setSurgeries] = useState(initialData?.pastSurgeries || []);
  const [newSurgery, setNewSurgery] = useState({ name: '', date: '', hospital: '' });

  const [uploading, setUploading] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docFile, setDocFile] = useState(null);

  const handleAddTag = (e, stateUpdater, inputState, setInputState) => {
    e.preventDefault();
    if (inputState.trim() && !stateUpdater.includes(inputState.trim())) {
      stateUpdater(prev => [...prev, inputState.trim()]);
      setInputState('');
    }
  };

  const handleRemoveTag = (index, stateUpdater) => {
    stateUpdater(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddMedication = () => {
    if (newMed.name && newMed.dosage) {
      setMedications(prev => [...prev, newMed]);
      setNewMed({ name: '', dosage: '', frequency: '' });
    }
  };

  const handleAddSurgery = () => {
    if (newSurgery.name && newSurgery.date) {
      setSurgeries(prev => [...prev, newSurgery]);
      setNewSurgery({ name: '', date: '', hospital: '' });
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        allergies,
        chronicConditions,
        currentMedications: medications,
        pastSurgeries: surgeries
      };
      
      const res = await api.post('/medical-history/me', payload);
      toast.success('Medical history updated successfully');
      if (onSaveSuccess) onSaveSuccess(res.data.data);
    } catch (err) {
      toast.error('Failed to update medical history');
      console.error(err);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!docTitle || !docFile) {
      return toast.error("Please provide both title and file");
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', docTitle);
    formData.append('file', docFile);

    try {
      const res = await api.post('/medical-history/me/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Document uploaded successfully");
      setDocTitle('');
      setDocFile(null);
      if (onSaveSuccess) onSaveSuccess(res.data.data);
    } catch (err) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
             <Activity className="w-5 h-5 text-primary-500" /> General Health
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Blood Group</label>
              <select {...register('bloodGroup')} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none">
                <option value="">Select Blood Group</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Family Health History</label>
              <textarea 
                {...register('familyHistory')} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none min-h-[100px]"
                placeholder="Mention any significant hereditary conditions..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* Tags Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Allergies</label>
            <div className="flex gap-2 mb-3">
              <input 
                type="text" 
                value={allergyInput} 
                onChange={e => setAllergyInput(e.target.value)} 
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="E.g., Penicillin, Peanuts"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag(e, setAllergies, allergyInput, setAllergyInput)}
              />
              <button 
                type="button" 
                onClick={(e) => handleAddTag(e, setAllergies, allergyInput, setAllergyInput)} 
                className="p-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors"
                aria-label="Add Allergy"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-medium border border-red-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                  {allergy}
                  <button type="button" onClick={() => handleRemoveTag(i, setAllergies)} className="hover:text-red-800 focus:outline-none"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>

          <div>
             <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Chronic Conditions</label>
             <div className="flex gap-2 mb-3">
               <input 
                 type="text" 
                 value={chronicInput} 
                 onChange={e => setChronicInput(e.target.value)} 
                 className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                 placeholder="E.g., Asthma, Diabetes"
                 onKeyDown={(e) => e.key === 'Enter' && handleAddTag(e, setChronicConditions, chronicInput, setChronicInput)}
               />
               <button 
                type="button" 
                onClick={(e) => handleAddTag(e, setChronicConditions, chronicInput, setChronicInput)} 
                className="p-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors"
                aria-label="Add Condition"
               >
                 <Plus className="w-5 h-5" />
               </button>
             </div>
             <div className="flex flex-wrap gap-2">
               {chronicConditions.map((condition, i) => (
                 <span key={i} className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium border border-amber-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                   {condition}
                   <button type="button" onClick={() => handleRemoveTag(i, setChronicConditions)} className="hover:text-amber-900 focus:outline-none"><X className="w-3 h-3" /></button>
                 </span>
               ))}
             </div>
          </div>
        </div>

        {/* Medications */}
        <div className="pt-4 border-t border-gray-100">
           <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
             <AlertCircle className="w-5 h-5 text-primary-500" /> Current Medications
           </h3>
           <div className="flex flex-col md:flex-row gap-3 mb-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
             <input type="text" placeholder="Medication Name" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
             <input type="text" placeholder="Dosage (e.g. 500mg)" value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} className="w-full md:w-32 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
             <input type="text" placeholder="Frequency (e.g. 2x Day)" value={newMed.frequency} onChange={e => setNewMed({...newMed, frequency: e.target.value})} className="w-full md:w-40 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
             <button type="button" onClick={handleAddMedication} className="w-full md:w-auto px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 whitespace-nowrap"><Plus className="w-4 h-4"/> Add</button>
           </div>
           
           {medications.length > 0 && (
             <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dosage</th>
                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Frequency</th>
                     <th className="px-6 py-3 text-right"></th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {medications.map((med, i) => (
                     <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.name}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{med.dosage}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{med.frequency}</td>
                       <td className="px-6 py-4 text-right">
                         <button type="button" onClick={() => setMedications(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
        </div>

        <div className="pt-8 border-t border-gray-100 flex justify-end">
          <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all hover:-translate-y-0.5">
            Save Medical History
          </button>
        </div>
      </form>

      {/* Documents Upload Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
           <FileText className="w-5 h-5 text-primary-500" /> Medical Documents
        </h3>
        
        <form onSubmit={handleUploadDocument} className="flex flex-col sm:flex-row gap-4 items-end p-5 bg-gray-50/50 border border-gray-200 border-dashed rounded-xl">
          <div className="w-full flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Document Title</label>
            <input type="text" value={docTitle} onChange={e => setDocTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white" placeholder="e.g. Blood Test Report 2025" />
          </div>
          <div className="w-full flex-1 relative Group">
             <input type="file" id="file_upload" onChange={e => setDocFile(e.target.files[0])} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
             <label htmlFor="file_upload" className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 text-gray-600 font-medium transition-colors">
               <UploadCloud className="w-5 h-5" /> 
               {docFile ? <span className="truncate max-w-[150px]">{docFile.name}</span> : 'Select File'}
             </label>
          </div>
          <button type="submit" disabled={uploading || !docFile} className="w-full sm:w-auto px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>

        {initialData?.documents?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
            {initialData.documents.map(doc => (
              <div key={doc._id} className="relative group p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md hover:shadow-primary-500/10 transition-all bg-white flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="font-medium text-gray-900 line-clamp-2" title={doc.title}>{doc.title}</div>
                <div className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-full uppercase tracking-wider w-full truncate">
                   {new Date(doc.uploadedAt).toLocaleDateString()}
                </div>
                
                <div className="absolute inset-0 bg-gray-900/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                   <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-white bg-primary-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-500 transition-colors">View</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalHistoryForm;
