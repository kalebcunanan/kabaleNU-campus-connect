import { useContext } from 'react';
import { WelcomeContext } from '../context/WelcomeContext';
import type { WelcomeContextValue } from '../types/welcome';

export const useWelcomeTransition = (): WelcomeContextValue => {
  const context = useContext(WelcomeContext);
  if (!context) throw new Error('useWelcomeTransition must be used inside WelcomeProvider');
  return context;
};
