import React from 'react';
import Navbar from './home/Navbar';
import Footer from './home/Footer';

export default function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        {children}
      </div>
      <Footer />
    </div>
  );
}
