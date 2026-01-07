'use client';

import React from 'react';
import { useDataContext } from '@/contexts/DataContext';

const DataLoader = ({ children }) => {
  const { loading, error, data } = useDataContext();

  // Show error only if critical data is missing
  if (error && !data?.products && !data?.categories) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Failed to Load Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gold text-white px-6 py-2 rounded-lg hover:bg-gold-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Don't block - show content immediately, data will load progressively
  // This provides a much better user experience
  return children;
};

export default DataLoader;
