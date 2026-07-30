import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import AIAssistant from './AIAssistant';

const PublicLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen relative font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
      <AIAssistant />
    </div>
  );
};

export default PublicLayout;
