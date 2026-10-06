import React from 'react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-red-500 text-center">
    <p className="text-lg font-medium mb-4">{message}</p>
    {onRetry && (
      <button 
        onClick={onRetry} 
        className="px-4 py-2 bg-red-100 text-red-700 rounded-md font-semibold hover:bg-red-200"
      >
        Retry
      </button>
    )}
  </div>
);