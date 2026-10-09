export type WelcomePhase = 'idle' | 'cardExit' | 'splash' | 'swipe';

export type WelcomeVariant = 'login' | 'register';

export interface WelcomeContextValue {
  phase: WelcomePhase;
  variant: WelcomeVariant;
  startWelcome: (variant: WelcomeVariant, target: string) => void;
}
