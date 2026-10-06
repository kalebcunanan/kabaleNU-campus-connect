import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { WelcomePhase } from '../types/welcome';
import { useWelcomeTransition } from './useWelcomeTransition';

type EntranceAnimation = 'animate-slide-down' | 'animate-rise-in';

interface EntranceProps {
  className: string;
  style?: CSSProperties;
}

const STAGGER_MS = 60;
const STAGGER_LIMIT = 8;
const HOLD_PHASES: WelcomePhase[] = ['cardExit', 'splash'];

export const useWelcomeEntrance = (animation: EntranceAnimation, index: number = 0): EntranceProps => {
  const { phase } = useWelcomeTransition();
  // Only elements mounted during the welcome transition animate, so normal visits stay still.
  const [arrivedViaWelcome] = useState<boolean>(() => phase !== 'idle');

  if (!arrivedViaWelcome || index >= STAGGER_LIMIT) return { className: '' };
  if (HOLD_PHASES.includes(phase)) return { className: 'opacity-0' };
  return { className: animation, style: { animationDelay: `${index * STAGGER_MS}ms` } };
};
