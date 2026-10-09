import React, { useCallback, useEffect, useState } from 'react';
import { Avatar } from '../common/Avatar';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import api, { getErrorMessage } from '../../lib/axios';
import { formatRelativeTime } from '../../lib/formatRelativeTime';
import { canManage } from '../../lib/permissions';
import type { StoryGroup } from '../../types/story';

const IMAGE_DURATION_MS = 5000;

interface StoryViewerProps {
  groups: StoryGroup[];
  startIndex: number;
  onClose: () => void;
  onChanged: () => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ groups, startIndex, onClose, onChanged }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [groupIndex, setGroupIndex] = useState<number>(startIndex);
  const [storyIndex, setStoryIndex] = useState<number>(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const group = groups[groupIndex];
  const story = group?.stories[storyIndex];
  const storyCount = group?.stories.length ?? 0;

  const goNext = useCallback((): void => {
    if (storyIndex < storyCount - 1) {
      setStoryIndex(storyIndex + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex(groupIndex + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  }, [storyIndex, storyCount, groupIndex, groups.length, onClose]);

  const goPrev = useCallback((): void => {
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1);
    } else if (groupIndex > 0) {
      setGroupIndex(groupIndex - 1);
      setStoryIndex(groups[groupIndex - 1].stories.length - 1);
    }
  }, [storyIndex, groupIndex, groups]);

  // Locks the page scroll while the viewer is open.
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Adds keyboard shortcuts for closing and moving between stories.
  useEffect(() => {
    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') goNext();
      if (event.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, onClose]);

  // Photos advance on a timer while videos advance when they finish playing.
  useEffect(() => {
    if (!story || story.media.type === 'video' || isConfirmOpen) return;
    const timer = setTimeout(goNext, IMAGE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [story, isConfirmOpen, goNext]);

  if (!group || !story) return null;

  const canDelete = canManage(user, group.author._id);

  const handleDelete = async (): Promise<void> => {
    setIsConfirmOpen(false);
    try {
      setError(null);
      await api.delete(`/stories/${story._id}`);
      showToast('Story deleted');
      onChanged();
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black">
      <div className="relative h-full w-full max-w-md overflow-hidden bg-black sm:h-[92vh] sm:rounded-2xl">
        {story.media.type === 'video' ? (
          <video
            key={story._id}
            src={story.media.url}
            autoPlay
            playsInline
            onEnded={goNext}
            className="h-full w-full object-contain"
          />
        ) : (
          <img key={story._id} src={story.media.url} alt="Story" className="h-full w-full object-contain" />
        )}

        <button type="button" aria-label="Previous story" onClick={goPrev} className="absolute inset-y-0 left-0 w-1/3" />
        <button type="button" aria-label="Next story" onClick={goNext} className="absolute inset-y-0 right-0 w-2/3" />

        <div className="absolute inset-x-0 top-0 z-10 bg-black/40 p-3">
          <div className="mb-3 flex gap-1">
            {group.stories.map((item, index) => (
              <span
                key={item._id}
                className={`h-1 flex-1 rounded-full ${index <= storyIndex ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="rounded-full bg-white">
                <Avatar src={group.author.profilePicture} name={group.author.name} className="h-10 w-10" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{group.author.name}</p>
                <p className="text-xs text-white/80">{formatRelativeTime(story.createdAt)}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {canDelete && (
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(true)}
                  className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white hover:bg-white/40"
              >
                X
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-2 rounded bg-red-600 px-2 py-1 text-xs text-white">
              {error}
            </p>
          )}
        </div>

        {story.caption && (
          <p className="absolute inset-x-0 bottom-0 z-10 break-words bg-black/50 p-4 text-center text-sm text-white">
            {story.caption}
          </p>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete story"
        message="Are you sure you want to delete this story? This cannot be undone."
        onConfirm={() => void handleDelete()}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};