import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-nu-blue px-4 py-8">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 block text-center text-3xl font-extrabold tracking-tight text-nu-gold">
          KabeleNU
        </Link>
        <section className="rounded-2xl border-t-4 border-nu-gold bg-white p-6 shadow-xl sm:p-8">
          <h1 className="text-2xl font-bold text-nu-blue">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-gray-600">{subtitle}</p>
          {children}
        </section>
        <p className="mt-6 text-center text-sm text-white/80">{footer}</p>
      </div>
    </main>
  );
}
