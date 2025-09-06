import React from 'react';

const LoadingSpinner = ({ variant = "default" }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-white/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div className="text-white text-center">
        <p className="font-medium mb-1">Finding delicious meals near you...</p>
        <p className="text-sm text-gray-300">Detecting your location</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;