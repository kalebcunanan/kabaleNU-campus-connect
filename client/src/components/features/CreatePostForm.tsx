import React, { useState } from 'react';
import { Avatar } from '../common/Avatar';
import { CreatePostModal } from './CreatePostModal';
import { useAuth } from '../../hooks/useAuth';
import type { Post } from '../../types/post';
import postIcon from '../../assets/icons/post.png';

interface CreatePostFormProps {
  onPostCreated: (post: Post) => void;
}

// Shows a closed composer pill and opens the post modal on tap.
export const CreatePostForm: React.FC<CreatePostFormProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openPicker, setOpenPicker] = useState<boolean>(false);

  const openComposer = (withPicker: boolean): void => {
    setOpenPicker(withPicker);
    setIsOpen(true);
  };

  return (
    <div className="mb-6 flex items-center gap-3">
      <Avatar src={user?.profilePicture} name={user?.name ?? 'You'} className="h-12 w-12" />

      <button
        type="button"
        onClick={() => openComposer(false)}
        aria-label="Create a post"
        className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-full bg-nu-blue py-3 pl-5 pr-4 text-left text-white transition hover:bg-nu-blue/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-nu-gold focus-visible:ring-offset-2"
      >
        <span className="truncate">What&apos;s happening on campus?</span>
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 20h9" strokeLinecap="round" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => openComposer(true)}
        aria-label="Add photos or videos"
        className="shrink-0 rounded-lg p-1 transition hover:bg-nu-blue/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-nu-gold"
      >
        <img src={postIcon} alt="" className="h-9 w-9" />
      </button>

      {isOpen && (
        <CreatePostModal
          openPicker={openPicker}
          onClose={() => setIsOpen(false)}
          onCreated={onPostCreated}
        />
      )}
    </div>
  );
};
