import { useCallback, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Toast from '../components/common/Toast';
import type { ToastContextValue, ToastMessage, ToastType } from '../types/toast';
import { ToastContext } from './ToastContext';

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    nextId.current += 1;
    const id = nextId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}
