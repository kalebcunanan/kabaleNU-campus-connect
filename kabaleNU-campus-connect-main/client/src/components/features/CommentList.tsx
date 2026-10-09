import { useState } from 'react';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import api, { getErrorMessage } from '../../lib/axios';
import { canManage } from '../../lib/permissions';
import type { PostComment } from '../../types/comment';
import { formatRelativeTime } from '../../lib/formatRelativeTime';

interface CommentListProps {
  comments: PostComment[];
  onDeleted: () => void;
}

export default function CommentList({ comments, onDeleted }: CommentListProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    const commentId = pendingDeleteId;
    setPendingDeleteId(null);

    try {
      setError(null);
      await api.delete(`/comments/${commentId}`);
      showToast('Comment deleted');
      onDeleted();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  if (comments.length === 0) {
    return <div className="py-4"><EmptyState message="No comments yet. Be the first to comment." /></div>;
  }

  return (
    <>
      {error && (
        <p role="alert" className="mb-2 px-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <ul className="space-y-4 px-4 pb-4">
        {comments.map((comment) => (
          <li key={comment._id} className="flex gap-2">
            <Avatar src={comment.author.profilePicture} name={comment.author.name} className="mt-1 h-8 w-8" />
            <div className="flex flex-col items-start max-w-[85%]">
              {/* Chat Bubble Style */}
              <div className="bg-gray-100 rounded-2xl px-3 py-2">
                <span className="font-bold text-nu-blue text-sm mr-2">{comment.author.name}</span>
                <span className="text-gray-800 text-sm whitespace-pre-wrap break-words">{comment.content}</span>
              </div>

              {/* Footer ng Comment (Time at Delete) */}
              <div className="flex gap-4 text-xs text-gray-500 mt-1 ml-2 font-medium">
                <span>{formatRelativeTime(comment.createdAt)}</span>
                {canManage(user, comment.author._id) && (
                  <button
                    onClick={() => setPendingDeleteId(comment._id)}
                    className="hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        title="Delete comment"
        message="Are you sure you want to delete this comment? This cannot be undone."
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDeleteId(null)}
      />
    </>
  );
}