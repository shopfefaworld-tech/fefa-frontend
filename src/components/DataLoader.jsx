'use client';

import React from 'react';
import { useDataContext } from '@/contexts/DataContext';

const DataLoader = ({ children }) => {
  const { loading, error, data } = useDataContext();

  // Show error only if critical data is missing
  if (error && !data?.products && !data?.categories) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-soft-pink-100 via-white to-soft-pink-200">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Failed to Load Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-amber-400 hover:bg-amber-500 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show loading banner only while data is loading (fast)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-soft-pink-100 via-white to-soft-pink-200">
        <div className="text-center">
          {/* Logo */}
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-pink-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <span className="text-3xl font-cormorant text-primary font-bold">F</span>
              </div>
            </div>
          </div>
          
          {/* Loading spinner */}
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          
          {/* Loading text */}
          <p className="text-primary font-medium text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default DataLoader;
