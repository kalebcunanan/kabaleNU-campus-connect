import React, { useMemo, useRef, useState } from 'react';
import { Avatar } from '../common/Avatar';
import { ErrorState } from '../common/ErrorState';
import { CreateStoryModal } from './CreateStoryModal';
import { StoryViewer } from './StoryViewer';
import { useAuth } from '../../hooks/useAuth';
import { useAxiosFetch } from '../../hooks/useAxiosFetch';
import type { StoryGroup } from '../../types/story';
import createStoryIcon from '../../assets/icons/create-story.png';
import nextStoryIcon from '../../assets/icons/next-story.png';

const CARD_CLASS = 'relative h-44 w-32 shrink-0 overflow-hidden rounded-2xl border-2 border-nu-gold';
const SCROLL_STEP = 280;
const ARROW_MIN_GROUPS = 3;

export const StoryBar: React.FC = () => {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useAxiosFetch<StoryGroup[]>('/stories');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  // The logged-in user's own story always comes first and the rest keep the server order.
  const orderedGroups = useMemo<StoryGroup[]>(
    () =>
      [...(data ?? [])].sort(
        (a, b) => Number(b.author._id === user?._id) - Number(a.author._id === user?._id),
      ),
    [data, user?._id],
  );

  // Scrolls the row forward and jumps back to the start once the end is reached.
  const handleNext = (): void => {
    const row = scrollRef.current;
    if (!row) return;
    const atEnd = row.scrollLeft + row.clientWidth >= row.scrollWidth - 8;
    row.scrollTo({ left: atEnd ? 0 : row.scrollLeft + SCROLL_STEP, behavior: 'smooth' });
  };

  const handleRefresh = (): void => {
    void refetch();
  };

  return (
    <section aria-label="Stories" className="mb-6">
      {error ? (
        <ErrorState message={error} onRetry={handleRefresh} />
      ) : (
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className={`${CARD_CLASS} flex flex-col items-center justify-center gap-2 bg-white transition-colors hover:bg-nu-gold/10`}
            >
              <img src={createStoryIcon} alt="" className="h-10 w-10" />
              <span className="text-sm font-medium text-gray-800">Create Story</span>
            </button>

            {loading
              ? [0, 1, 2].map((placeholder) => (
                  <div key={placeholder} className={`${CARD_CLASS} animate-pulse bg-gray-200`} />
                ))
              : orderedGroups.map((group, index) => {
                  const preview = group.stories[group.stories.length - 1];
                  const isOwn = group.author._id === user?._id;
                  return (
                    <button
                      key={group.author._id}
                      type="button"
                      onClick={() => setViewerIndex(index)}
                      className={`${CARD_CLASS} bg-gray-200 text-left`}
                      aria-label={`View ${group.author.name}'s story`}
                    >
                      {preview.media.type === 'video' ? (
                        <video
                          src={`${preview.media.url}#t=0.1`}
                          muted
                          playsInline
                          preload="metadata"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={preview.media.url}
                          alt=""
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      )}
                      <span className="absolute left-2 top-2 rounded-full bg-white ring-2 ring-nu-blue">
                        <Avatar src={group.author.profilePicture} name={group.author.name} className="h-9 w-9" />
                      </span>
                      <span className="absolute inset-x-0 bottom-0 line-clamp-2 bg-black/50 px-2 py-1.5 text-xs font-semibold text-white">
                        {isOwn ? 'Your Story' : group.author.name}
                      </span>
                    </button>
                  );
                })}
          </div>

          {orderedGroups.length > ARROW_MIN_GROUPS && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Show more stories"
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 transition-transform hover:scale-110"
            >
              <img src={nextStoryIcon} alt="" className="h-full w-full" />
            </button>
          )}
        </div>
      )}

      {!loading && !error && orderedGroups.length === 0 && (
        <p className="mt-2 text-sm text-gray-500">No stories yet. Share yours!</p>
      )}

      {isCreateOpen && <CreateStoryModal onClose={() => setIsCreateOpen(false)} onCreated={handleRefresh} />}

      {viewerIndex !== null && (
        <StoryViewer
          groups={orderedGroups}
          startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onChanged={handleRefresh}
        />
      )}
    </section>
  );
};