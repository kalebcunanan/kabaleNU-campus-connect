import React from 'react';
import { NavIcon } from '../layout/NavIcon';
import profileIcon from '../../assets/icons/profile.png';

interface AvatarProps {
  src?: string;
  name: string;
  className?: string;
}

// Shows the uploaded picture and falls back to the default profile icon when there is none.
export const Avatar: React.FC<AvatarProps> = ({ src, name, className = 'h-10 w-10' }) =>
  src ? (
    <img
      src={src}
      alt={name}
      loading="lazy"
      className={`shrink-0 rounded-full border border-nu-blue/20 object-cover ${className}`}
    />
  ) : (
    <NavIcon src={profileIcon} className={`shrink-0 text-nu-blue ${className}`} />
  );