import type { ReactNode } from 'react';
import { useWelcomeEntrance } from '../../hooks/useWelcomeEntrance';

interface WelcomeEntranceProps {
  index: number;
  children: ReactNode;
}

export default function WelcomeEntrance({ index, children }: WelcomeEntranceProps) {
  const entrance = useWelcomeEntrance('animate-rise-in', index);

  return (
    <div className={entrance.className} style={entrance.style}>
      {children}
    </div>
  );
}
