import { createContext } from 'react';
import type { WelcomeContextValue } from '../types/welcome';

export const WelcomeContext = createContext<WelcomeContextValue | undefined>(undefined);
