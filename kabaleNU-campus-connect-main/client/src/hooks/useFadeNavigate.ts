import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FADE_MS = 200;

interface UseFadeNavigateResult {
  isLeaving: boolean;
  fadeTo: (path: string) => void;
}

export const useFadeNavigate = (): UseFadeNavigateResult => {
  const navigate = useNavigate();
  const [isLeaving, setIsLeaving] = useState<boolean>(false);
  const timer = useRef<number | undefined>(undefined);

  // Clears a pending navigation if the page unmounts first.
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const fadeTo = (path: string): void => {
    setIsLeaving(true);
    timer.current = window.setTimeout(() => navigate(path), FADE_MS);
  };

  return { isLeaving, fadeTo };
};
