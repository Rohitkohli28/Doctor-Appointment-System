import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Heart, AlertCircle, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PatientProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || 'Male',
    age: '26',
    bloodGroup: 'O+',
    allergies: 'Penicillin, Dust',
    chronicConditions: 'None',
    emergencyContact: '+91 9876543210'
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate profile save delay / api call
      await new Promise(r => setTimeout(r, 800));
      toast.success('Patient profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Patient Profile Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          Manage your personal details, emergency contacts, and clinical health preferences.
        </p>
      </div>

      {/* Main Profile Card */}
      <form onSubmit={handleSave} className="bg-white dark:bg-darkcard rounded-3xl p-8 border border-slate-200/80 dark:border-darkborder shadow-sm space-y-8">
        
        {/* User Identity Avatar */}
        <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-darkborder">
          <div className="w-20 h-20 rounded-3xl bg-primary-100 dark:bg-cyan-950/60 text-primary-600 dark:text-cyan-400 flex items-center justify-center font-black text-2xl border-2 border-primary-200 dark:border-cyan-800 shadow-md">
            {user?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-1 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3" /> Verified Member
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-xs text-slate-400 font-semibold">{user?.email}</p>
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-darksurface border border-slate-200 dark:border-darkborder rounded-2xl outline-none font-bold text-xs text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                readOnly
                value={profile.email}
                className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-darksurface/50 border border-slate-200 dark:border-darkborder rounded-2xl outline-none font-bold text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Gender</label>
            <select
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-darksurface border border-slate-200 dark:border-darkborder rounded-2xl outline-none font-bold text-xs text-slate-800 dark:text-white cursor-pointer capitalize"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Age (Years)</label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-darksurface border border-slate-200 dark:border-darkborder rounded-2xl outline-none font-bold text-xs text-slate-800 dark:text-white"
              placeholder="e.g. 28"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Blood Group</label>
            <div className="relative">
              <Heart className="w-4 h-4 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={profile.bloodGroup}
                onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-darksurface border border-slate-200 dark:border-darkborder rounded-2xl outline-none font-bold text-xs text-slate-800 dark:text-white cursor-pointer"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Known Allergies</label>
            <input
              type="text"
              value={profile.allergies}
              onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-darksurface border border-slate-200 dark:border-darkborder rounded-2xl outline-none font-bold text-xs text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Emergency Contact</label>
            <input
              type="text"
              value={profile.emergencyContact}
              onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-darksurface border border-slate-200 dark:border-darkborder rounded-2xl outline-none font-bold text-xs text-slate-800 dark:text-white"
            />
          </div>

        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-darkborder flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white font-extrabold text-xs px-8 py-3.5 rounded-2xl shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>

      </form>

    </div>
  );
};

export default PatientProfilePage;
