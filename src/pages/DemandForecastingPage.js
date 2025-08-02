import React from 'react';
import { DrugForecasting } from '../components/DrugForecasting';

const DemandForecastingPage = () => {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
      }}
    >
      {/* Floating Pills Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large Pills */}
        <div className="absolute top-20 left-10 w-32 h-16 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full opacity-20 blur-sm transform rotate-45 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-25 blur-sm transform -rotate-12 animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-28 h-14 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 blur-sm transform rotate-12 animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-1/3 w-20 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-25 blur-sm transform rotate-45 animate-pulse delay-3000"></div>
        
        {/* Medium Pills */}
        <div className="absolute top-1/2 left-20 w-16 h-8 bg-gradient-to-r from-red-400 to-pink-400 rounded-full opacity-15 blur-sm transform -rotate-30 animate-pulse delay-500"></div>
        <div className="absolute top-60 right-40 w-20 h-10 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-20 blur-sm transform rotate-60 animate-pulse delay-1500"></div>
        
        {/* Small Pills */}
        <div className="absolute top-32 left-1/3 w-12 h-6 bg-gradient-to-r from-cyan-300 to-blue-400 rounded-full opacity-15 blur-sm transform rotate-15 animate-pulse delay-2500"></div>
        <div className="absolute bottom-20 left-40 w-14 h-7 bg-gradient-to-r from-yellow-300 to-red-400 rounded-full opacity-20 blur-sm transform -rotate-45 animate-pulse delay-4000"></div>
        <div className="absolute top-80 right-10 w-10 h-5 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full opacity-15 blur-sm transform rotate-75 animate-pulse delay-3500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <DrugForecasting />
      </div>
    </div>
  );
};

export default DemandForecastingPage;
