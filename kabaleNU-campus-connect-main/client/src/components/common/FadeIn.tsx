import React from 'react';

interface FadeInProps {
  index: number;
  children: React.ReactNode;
}

const STAGGER_MS = 80;
const MAX_STAGGER_STEPS = 8;

// Fades its children in with a delay based on the list index so items appear one after another.
const FadeIn: React.FC<FadeInProps> = ({ index, children }) => (
  <div
    className="animate-rise-in motion-reduce:animate-none"
    style={{ animationDelay: `${Math.min(index, MAX_STAGGER_STEPS) * STAGGER_MS}ms` }}
  >
    {children}
  </div>
);

export default FadeIn;
