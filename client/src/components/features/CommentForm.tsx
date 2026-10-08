import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { JSX } from 'react';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import api, { getErrorMessage } from '../../lib/axios';
import { commentSchema } from '../../schemas/comment';
import type { CommentFormData } from '../../schemas/comment';

interface CommentFormProps {
  postId: string;
  onCommentAdded: () => void;
}

export default function CommentForm({ postId, onCommentAdded }: CommentFormProps): JSX.Element {
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '' },
  });

  const onSubmit = async (values: CommentFormData): Promise<void> => {
    try {
      await api.post(`/posts/${postId}/comments`, values);
      reset();
      showToast('Comment added');
      onCommentAdded();
    } catch (error: unknown) {
      setError('root.server', { message: getErrorMessage(error) });
    }
  };

  // The field error from Zod takes priority over a server error.
  const errorMessage: string | undefined = errors.content?.message ?? errors.root?.server?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="border-t border-gray-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <Avatar src={user?.profilePicture} name={user?.name ?? 'You'} className="h-8 w-8" />

        <div className="flex flex-1 items-center rounded-full border border-transparent bg-gray-100 px-4 py-2 transition-colors focus-within:border-nu-blue/30">
          <input
            type="text"
            placeholder="Write a comment..."
            aria-label="Write a comment"
            aria-invalid={errors.content ? true : undefined}
            autoComplete="off"
            className="w-full bg-transparent text-sm text-gray-800 outline-none"
            {...register('content')}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-2 text-sm font-bold text-nu-blue hover:text-nu-blue/80 disabled:opacity-50"
          >
            Post
          </button>
        </div>
      </div>

      {errorMessage && (
        <p role="alert" className="mt-1 pl-10 text-xs text-red-600">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
