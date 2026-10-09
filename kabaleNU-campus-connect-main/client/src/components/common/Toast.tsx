import { useEffect } from 'react';
import type { ToastMessage, ToastType } from '../../types/toast';

const TOAST_DURATION_MS = 4000;

const toastClasses: Record<ToastType, string> = {
  success: 'border-nu-gold bg-nu-blue text-white',
  error: 'border-red-600 bg-white text-red-700',
};

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto w-full max-w-sm rounded-lg border-l-4 px-4 py-3 text-sm font-medium shadow-lg ${toastClasses[toast.type]}`}
    >
      {toast.message}
    </div>
  );
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:items-end">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
