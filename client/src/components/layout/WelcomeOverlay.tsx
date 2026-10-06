import logo from '../../assets/logo/kabalenu-logo.png';
import { useAuth } from '../../hooks/useAuth';
import { useWelcomeTransition } from '../../hooks/useWelcomeTransition';
import AuthBackdrop from './AuthBackdrop';

export default function WelcomeOverlay() {
  const { user } = useAuth();
  const { phase, variant } = useWelcomeTransition();

  if (phase !== 'splash' && phase !== 'swipe') return null;

  const firstName = user?.name.split(' ')[0] ?? '';
  const greeting = variant === 'register' ? `Welcome to the pack, ${firstName}!` : `Welcome back, ${firstName}!`;

  return (
    <AuthBackdrop className={`fixed inset-0 z-50 ${phase === 'swipe' ? 'animate-swipe-up' : ''}`}>
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <img src={logo} alt="KabaleNU" className="h-36 w-auto animate-splash-logo object-contain sm:h-52" />
        <p role="status" className="mt-6 animate-fade-in text-2xl font-bold text-white sm:text-3xl">
          {greeting}
        </p>
        <span className="mt-3 block h-1 w-12 animate-fade-in rounded-full bg-nu-gold" aria-hidden="true" />
      </div>
    </AuthBackdrop>
  );
}
