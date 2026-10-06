import { useState } from 'react';
import type { ComponentProps } from 'react';
import Input from './Input';

type PasswordInputProps = Omit<ComponentProps<typeof Input>, 'type'>;

export default function PasswordInput(props: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  return (
    <div className="relative">
      <Input {...props} type={isVisible ? 'text' : 'password'} />
      <button
        type="button"
        onClick={() => setIsVisible((current) => !current)}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        aria-pressed={isVisible}
        className="absolute right-1 top-6 flex h-11 w-11 items-center justify-center text-gray-500 hover:text-nu-blue"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
          {isVisible && <path d="M4 4l16 16" />}
        </svg>
      </button>
    </div>
  );
}
