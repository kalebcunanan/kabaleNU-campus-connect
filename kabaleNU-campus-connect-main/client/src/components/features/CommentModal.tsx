import React, { useEffect } from 'react';
import { useAxiosFetch } from '../../hooks/useAxiosFetch';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { MediaGrid } from './MediaGrid';
import Loader from '../common/Loader';
import { Avatar } from '../common/Avatar';
import { ErrorState } from '../common/ErrorState';
import { formatRelativeTime } from '../../lib/formatRelativeTime';
import type { PostComment } from '../../types/comment';
import type { Post } from '../../types/post';

interface CommentModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onCommentChanged: (delta: number) => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({ post, isOpen, onClose, onCommentChanged }) => {
  const { data: comments, loading, error, refetch } = useAxiosFetch<PostComment[]>(`/posts/${post._id}/comments`);

  // Pigilan ang pag-scroll ng main feed kapag nakabukas ang modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      void refetch();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, refetch]);

  if (!isOpen) return null;

  const handleCommentAdded = (): void => {
    void refetch();
    onCommentChanged(1);
  };

  const handleCommentDeleted = (): void => {
    void refetch();
    onCommentChanged(-1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Click sa labas para mag-close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">

        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center bg-white z-10">
          <h3 className="font-bold text-nu-blue text-lg">Comments</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto bg-white">

          {/* 1. ORIGINAL POST CONTENT */}
          <div className="p-4 border-b border-gray-100">
            <div className="mb-3 flex items-start gap-3">
              <Avatar src={post.author.profilePicture} name={post.author.name} className="h-10 w-10" />
              <div className="flex flex-col">
                <h4 className="font-bold text-nu-blue">{post.author.name}</h4>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                  {post.author.program && (
                    <>
                      <span className="font-medium">{post.author.program}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{formatRelativeTime(post.createdAt)}</span>
                </div>
              </div>
            </div>
            {post.content && (
              <p className="mb-3 whitespace-pre-wrap break-words text-gray-800">{post.content}</p>
            )}
            <MediaGrid media={post.media ?? []} />
          </div>

          {/* 2. COMMENTS LIST */}
          <div className="pt-2 pb-4">
            {loading ? (
              <div className="py-8"><Loader label="Loading comments..." /></div>
            ) : error ? (
              <ErrorState message={error} onRetry={() => void refetch()} />
            ) : (
              <CommentList comments={comments ?? []} onDeleted={handleCommentDeleted} />
            )}
          </div>

        </div>

        {/* 3. INPUT FORM SA IBABA */}
        <CommentForm postId={post._id} onCommentAdded={handleCommentAdded} />
      </div>
    </div>
  );
};