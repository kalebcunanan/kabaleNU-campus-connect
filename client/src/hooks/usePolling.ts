import { useEffect, useRef } from 'react';

// Calls the callback on a fixed interval while enabled, skips ticks in a hidden tab, and always uses the latest callback.
export const usePolling = (callback: () => void, intervalMs: number, enabled: boolean): void => {
  const callbackRef = useRef<() => void>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;
    const tick = (): void => {
      if (!document.hidden) callbackRef.current();
    };
    const timer = window.setInterval(tick, intervalMs);
    // Refreshes right away when the tab becomes visible again.
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [intervalMs, enabled]);
};
