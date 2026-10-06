import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo/kabalenu-logo.png';
import AuthBackdrop from './AuthBackdrop';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  isLeaving?: boolean;
}

export default function AuthLayout({ title, subtitle, children, footer, isLeaving = false }: AuthLayoutProps) {
  const fade = `transition-opacity duration-200 ${isLeaving ? 'opacity-0' : ''}`;

  return (
    <AuthBackdrop className="relative min-h-dvh">
      <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-8">
        <Link to="/" aria-label="KabaleNU home" className={`mb-4 ${fade}`}>
          <img src={logo} alt="KabaleNU" className="h-36 w-auto object-contain sm:h-52" />
        </Link>

        <section
          className={`w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8 ${isLeaving ? 'pointer-events-none animate-card-exit' : ''}`}
        >
          <h1 className="text-center text-3xl font-bold tracking-tight text-nu-blue">{title}</h1>
          <span className="mx-auto mt-3 block h-1 w-12 rounded-full bg-nu-gold" aria-hidden="true" />
          <p className="mb-6 mt-3 text-center text-sm text-gray-600">{subtitle}</p>
          {children}
        </section>

        <p className={`mt-6 text-center text-sm text-white/90 ${fade}`}>{footer}</p>
      </main>
    </AuthBackdrop>
  );
}
