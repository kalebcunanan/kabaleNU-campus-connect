import type { ReactNode } from 'react';
import sketch from '../../assets/auth/nu-building-pencil.webp';

interface AuthBackdropProps {
  className?: string;
  children: ReactNode;
}

// The caller sets the position classes so the sketch and dots anchor to the right box.
export default function AuthBackdrop({ className = '', children }: AuthBackdropProps) {
  return (
    <div className={`w-full overflow-hidden bg-gradient-to-b from-[#12295a] via-nu-blue to-[#4a82d9] font-sans ${className}`}>
      <img
        src={sketch}
        alt=""
        aria-hidden="true"
        className="sketch-fade pointer-events-none absolute inset-x-0 bottom-0 h-[65%] w-full object-cover object-center opacity-90"
      />
      <div className="halftone-gold pointer-events-none absolute right-0 top-0 h-56 w-56 sm:h-80 sm:w-80" aria-hidden="true" />
      {children}
    </div>
  );
}
