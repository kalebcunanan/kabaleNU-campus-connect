import type { ComponentPropsWithRef } from 'react';

type ButtonVariant = 'primary' | 'gold' | 'outline';
type ButtonSize = 'md' | 'sm';

interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-nu-blue text-white hover:bg-nu-blue/90',
  gold: 'bg-nu-gold text-nu-blue hover:bg-nu-gold/90',
  outline: 'border border-nu-blue text-nu-blue hover:bg-nu-blue/5',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'px-4 py-2.5',
  sm: 'px-3 py-1.5 text-sm',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  type = 'button',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center rounded-lg font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-nu-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {isLoading ? 'Please wait...' : children}
    </button>
  );
}
