import React from 'react';

interface EmptyStateProps {
  message: string;
  hideIcon?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, hideIcon = false }) => (
  <div className="flex flex-col items-center justify-center p-8 text-gray-500 text-center">
    {!hideIcon && <span className="text-4xl mb-2">📦</span>}
    <p className="text-lg font-medium">{message}</p>
  </div>
);