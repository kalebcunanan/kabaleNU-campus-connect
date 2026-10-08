import React from 'react';
import Button from './Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  variant?: 'block' | 'inline';
}

// The inline variant is a compact banner for screens that already show data and only need to report a failed refresh.
export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry, variant = 'block' }) => {
  const isInline: boolean = variant === 'inline';

  return (
    <div
      role="alert"
      className={
        isInline
          ? 'mb-4 flex items-center justify-between gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700'
          : 'flex flex-col items-center justify-center p-8 text-center text-red-700'
      }
    >
      <p className={isInline ? 'min-w-0 break-words' : 'mb-4 text-lg font-medium'}>{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className={isInline ? 'shrink-0' : ''}>
          Retry
        </Button>
      )}
    </div>
  );
};
