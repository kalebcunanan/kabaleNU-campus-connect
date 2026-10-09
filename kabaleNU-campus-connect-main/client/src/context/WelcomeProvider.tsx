import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { WelcomeContext } from './WelcomeContext';
import type { WelcomeContextValue, WelcomePhase, WelcomeVariant } from '../types/welcome';

const CARD_EXIT_MS = 250;
const SPLASH_MS = 600;
const SWIPE_MS = 450;

interface WelcomeProviderProps {
  children: ReactNode;
}

export function WelcomeProvider({ children }: WelcomeProviderProps) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<WelcomePhase>('idle');
  const [variant, setVariant] = useState<WelcomeVariant>('login');
  const timers = useRef<number[]>([]);

  // Timers keep running in hidden tabs, so the overlay always unmounts on schedule.
  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  const startWelcome = useCallback(
    (nextVariant: WelcomeVariant, target: string): void => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        navigate(target, { replace: true });
        return;
      }

      const schedule = (callback: () => void, delay: number): void => {
        timers.current.push(window.setTimeout(callback, delay));
      };

      setVariant(nextVariant);
      setPhase('cardExit');
      // The route changes only once the overlay fully covers the screen.
      schedule(() => {
        setPhase('splash');
        navigate(target, { replace: true });
      }, CARD_EXIT_MS);
      schedule(() => setPhase('swipe'), CARD_EXIT_MS + SPLASH_MS);
      schedule(() => setPhase('idle'), CARD_EXIT_MS + SPLASH_MS + SWIPE_MS);
    },
    [navigate],
  );

  const value = useMemo<WelcomeContextValue>(() => ({ phase, variant, startWelcome }), [phase, variant, startWelcome]);

  return <WelcomeContext.Provider value={value}>{children}</WelcomeContext.Provider>;
}
