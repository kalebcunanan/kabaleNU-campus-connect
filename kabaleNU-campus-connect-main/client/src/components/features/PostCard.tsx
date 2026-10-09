import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Avatar } from '../common/Avatar';
import { MediaGrid } from './MediaGrid';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import api, { getErrorMessage } from '../../lib/axios';
import { formatRelativeTime } from '../../lib/formatRelativeTime';
import { canManage } from '../../lib/permissions';
import type { Post } from '../../types/post';
import likeIcon from '../../assets/icons/Like.png';
import commentIcon from '../../assets/icons/Comment.png';
import { CommentModal } from './CommentModal';

interface PostCardProps {
  post: Post;
  onDeleted: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onDeleted }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [localReacts, setLocalReacts] = useState(post.bulldogReacts);
  const [localHasReacted, setLocalHasReacted] = useState(post.hasReacted || false);
  const [isReacting, setIsReacting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isReported, setIsReported] = useState(false);

  // Menu, Dialog, and Modal states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(post.commentCount);
  const [error, setError] = useState<string | null>(null);

  const canDelete = canManage(user, post.author._id);
  const canReport = user !== null && user._id !== post.author._id;

  const handleReact = async () => {
    const previousReacts = localReacts;
    const previousHasReacted = localHasReacted;

    setLocalHasReacted(!previousHasReacted);
    setLocalReacts(previousHasReacted ? previousReacts - 1 : previousReacts + 1);

    try {
      setIsReacting(true);
      setError(null);
      await api.post(`/posts/${post._id}/react`);
    } catch (err: unknown) {
      setLocalHasReacted(previousHasReacted);
      setLocalReacts(previousReacts);
      setError(getErrorMessage(err));
    } finally {
      setIsReacting(false);
    }
  };

  const handleReport = async () => {
    try {
      setIsReporting(true);
      setError(null);
      await api.post(`/posts/${post._id}/report`);
      setIsReported(true);
      showToast('Post reported');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsReporting(false);
    }
  };

  const handleDelete = async () => {
    setIsConfirmOpen(false);

    try {
      setError(null);
      await api.delete(`/posts/${post._id}`);
      showToast('Post deleted');
      onDeleted();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="rounded-2xl border-2 border-nu-blue bg-white p-5 shadow-sm">
      {/* HEADER: Profile, Info, and 3-Dot Menu */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex gap-3 min-w-0 flex-1">
          <Link to={`/profile/${post.author._id}`} aria-label={`View ${post.author.name}'s profile`} className="shrink-0">
            <Avatar src={post.author.profilePicture} name={post.author.name} className="h-10 w-10" />
          </Link>
          <div className="flex flex-col min-w-0">
            <h4 className="truncate font-bold text-nu-blue">
              <Link to={`/profile/${post.author._id}`} className="hover:underline">
                {post.author.name}
              </Link>
            </h4>
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

        {/* 3-Dot Menu Button */}
        <div className="relative shrink-0 ml-2">
          {(canReport || canDelete) && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-nu-blue text-lg pb-1"
              aria-label="Options"
            >
              ⋮
            </button>
          )}

          {/* Dropdown Menu Items */}
          {isMenuOpen && (canReport || canDelete) && (
            <div className="absolute right-0 top-8 z-10 w-32 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
              {canReport && (
                <button
                  onClick={() => { setIsMenuOpen(false); handleReport(); }}
                  disabled={isReported || isReporting}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  {isReported ? 'Reported' : 'Report'}
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => { setIsMenuOpen(false); setIsConfirmOpen(true); }}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* POST CONTENT AND MEDIA */}
      {post.content && <p className="mb-4 whitespace-pre-wrap break-words text-gray-800">{post.content}</p>}
      <MediaGrid media={post.media ?? []} />

      {/* ERRORS */}
      {error && (
        <p role="alert" className="mb-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* FOOTER: Facebook-style Icons + Counters */}
      <div className="flex items-center gap-6 border-t border-nu-blue/30 pt-4">
        <button
          onClick={handleReact}
          disabled={isReacting}
          className={`group flex items-center space-x-1.5 transition-colors disabled:opacity-50 ${
            localHasReacted ? 'text-nu-blue' : 'text-gray-500 hover:text-nu-blue/80'
          }`}
        >
          <img
            src={likeIcon}
            alt="React"
            className={`h-6 w-6 transition-transform duration-200 ease-out group-active:scale-150 ${
              localHasReacted ? 'scale-110 grayscale-0' : 'grayscale opacity-60'
            }`}
          />
          <span className="text-sm font-semibold">
            {localReacts}
          </span>
        </button>

        <button
          onClick={() => setIsCommentModalOpen(true)}
          className="group flex items-center space-x-1.5 text-gray-500 hover:text-nu-blue transition-colors"
        >
          <img
            src={commentIcon}
            alt="Comment"
            className="h-6 w-6 grayscale opacity-60 transition-transform duration-200 ease-out group-active:scale-125 group-hover:grayscale-0 group-hover:opacity-100"
          />
          <span className="text-sm font-semibold">
            {localCommentCount}
          </span>
        </button>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete post"
        message="Are you sure you want to delete this post? Its comments and reactions will also be removed. This cannot be undone."
        onConfirm={() => void handleDelete()}
        onCancel={() => setIsConfirmOpen(false)}
      />

      <CommentModal
        post={post}
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        onCommentChanged={(delta) => setLocalCommentCount((count) => Math.max(0, count + delta))}
      />
    </div>
  );
};