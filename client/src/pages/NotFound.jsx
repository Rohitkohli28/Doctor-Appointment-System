import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-16 transition-colors duration-300">
      <div className="max-w-md w-full text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-24 h-24 bg-primary-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary-100 dark:border-slate-800 shadow-lg text-primary-600 dark:text-cyan-400"
        >
          <Stethoscope className="w-12 h-12" />
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-6xl font-black text-slate-900 dark:text-white tracking-tight"
        >
          404
        </motion.h1>

        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-2 mb-3"
        >
          Page Not Found
        </motion.h2>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8 max-w-xs mx-auto"
        >
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            to="/"
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Home className="w-4 h-4" /> Go to Homepage
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
