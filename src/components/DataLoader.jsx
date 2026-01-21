'use client';

import React from 'react';
import { useDataContext } from '@/contexts/DataContext';

const DataLoader = ({ children }) => {
  const { loading, error, data } = useDataContext();

  // Show error only if critical data is missing AND we've tried loading
  // Don't block the page - let it render and show individual loading states
  if (error && !data?.products && !data?.categories && !loading) {
    // Only show error if we've finished loading and still have no critical data
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

  // Render children immediately - don't block on loading
  // Individual sections will handle their own loading states
  return children;
};

export default DataLoader;
