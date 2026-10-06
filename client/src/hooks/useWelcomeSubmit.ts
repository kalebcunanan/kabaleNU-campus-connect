import { useState } from 'react';
import type { WelcomeVariant } from '../types/welcome';
import { useWelcomeTransition } from './useWelcomeTransition';

interface UseWelcomeSubmitResult {
  run: (action: () => Promise<unknown>) => Promise<void>;
  isPending: boolean;
  isLeaving: boolean;
}

export const useWelcomeSubmit = (variant: WelcomeVariant, target: string): UseWelcomeSubmitResult => {
  const { phase, startWelcome } = useWelcomeTransition();
  const [isPending, setIsPending] = useState<boolean>(false);

  // Pending stays true after success so the page neither redirects early nor re-enables submit.
  const run = async (action: () => Promise<unknown>): Promise<void> => {
    setIsPending(true);
    try {
      await action();
    } catch (error) {
      setIsPending(false);
      throw error;
    }
    startWelcome(variant, target);
  };

  return { run, isPending, isLeaving: phase !== 'idle' };
};
