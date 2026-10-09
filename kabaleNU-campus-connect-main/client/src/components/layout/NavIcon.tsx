import React from 'react';

interface NavIconProps {
  src: string;
  className?: string;
}

// The icon is a mask over a currentColor background so text color controls it.
export const NavIcon: React.FC<NavIconProps> = ({ src, className = 'h-7 w-7' }) => (
  <span
    aria-hidden="true"
    className={`inline-block bg-current ${className}`}
    style={{
      WebkitMaskImage: `url(${src})`,
      maskImage: `url(${src})`,
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      maskPosition: 'center',
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
    }}
  />
);