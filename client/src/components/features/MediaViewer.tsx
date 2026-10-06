import React, { useEffect, useState } from 'react';
import type { PostMedia } from '../../types/post';

interface MediaViewerProps {
  images: PostMedia[];
  startIndex: number;
  onClose: () => void;
}

interface ViewerButtonProps {
  label: string;
  className: string;
  onClick: () => void;
  children: React.ReactNode;
}

const ViewerButton: React.FC<ViewerButtonProps> = ({ label, className, onClick, children }) => (
  <button
    type="button"
    aria-label={label}
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
    className={`absolute flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-nu-gold ${className}`}
  >
    {children}
  </button>
);

const iconProps = { viewBox: '0 0 24 24', className: 'h-5 w-5', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const MediaViewer: React.FC<MediaViewerProps> = ({ images, startIndex, onClose }) => {
  const [index, setIndex] = useState<number>(startIndex);

  const hasMany = images.length > 1;
  const current = images[index];

  const showPrevious = (): void => setIndex((value) => (value - 1 + images.length) % images.length);
  const showNext = (): void => setIndex((value) => (value + 1) % images.length);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft' && images.length > 1) setIndex((value) => (value - 1 + images.length) % images.length);
      if (event.key === 'ArrowRight' && images.length > 1) setIndex((value) => (value + 1) % images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
    >
      <img
        src={current.url}
        alt="Post attachment"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] max-w-full select-none object-contain"
      />

      <ViewerButton label="Close" className="right-4 top-4" onClick={onClose}>
        <svg {...iconProps}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </ViewerButton>

      {hasMany && (
        <>
          <ViewerButton label="Previous photo" className="left-4 top-1/2 -translate-y-1/2" onClick={showPrevious}>
            <svg {...iconProps}>
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </ViewerButton>
          <ViewerButton label="Next photo" className="right-4 top-1/2 -translate-y-1/2" onClick={showNext}>
            <svg {...iconProps}>
              <path d="M9 5l7 7-7 7" />
            </svg>
          </ViewerButton>
          <p className="absolute bottom-4 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
            {index + 1} / {images.length}
          </p>
        </>
      )}
    </div>
  );
};
