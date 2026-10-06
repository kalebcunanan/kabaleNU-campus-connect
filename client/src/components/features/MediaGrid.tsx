import React, { useState } from 'react';
import { MediaViewer } from './MediaViewer';
import type { PostMedia } from '../../types/post';

interface MediaGridProps {
  media: PostMedia[];
}

export const MediaGrid: React.FC<MediaGridProps> = ({ media }) => {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  if (media.length === 0) return null;

  const images = media.filter((item) => item.type === 'image');
  const isSingle = media.length === 1;

  // The first of three items spans the full row so the grid stays balanced.
  const tileClass = (position: number): string =>
    media.length === 3 && position === 0 ? 'col-span-2 aspect-video' : 'aspect-square';

  const renderImageButton = (item: PostMedia, className: string): React.ReactNode => (
    <button
      type="button"
      onClick={() => setViewerIndex(images.findIndex((image) => image._id === item._id))}
      aria-label="View photo"
      className="block h-full w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-nu-gold"
    >
      <img src={item.url} alt="Post attachment" loading="lazy" className={className} />
    </button>
  );

  return (
    <>
      {isSingle ? (
        <div className="mb-4 flex justify-center overflow-hidden rounded-xl bg-gray-100">
          {media[0].type === 'video' ? (
            <video src={media[0].url} controls preload="metadata" className="max-h-[32rem] w-full bg-black object-contain" />
          ) : (
            renderImageButton(media[0], 'mx-auto max-h-[32rem] w-auto max-w-full object-contain')
          )}
        </div>
      ) : (
        <div className="mb-4 grid grid-cols-2 gap-1 overflow-hidden rounded-xl">
          {media.map((item, position) => (
            <div key={item._id} className={`overflow-hidden bg-gray-100 ${tileClass(position)}`}>
              {item.type === 'video' ? (
                <video src={item.url} controls preload="metadata" className="h-full w-full bg-black object-contain" />
              ) : (
                renderImageButton(item, 'h-full w-full object-cover')
              )}
            </div>
          ))}
        </div>
      )}

      {viewerIndex !== null && viewerIndex >= 0 && (
        <MediaViewer images={images} startIndex={viewerIndex} onClose={() => setViewerIndex(null)} />
      )}
    </>
  );
};
