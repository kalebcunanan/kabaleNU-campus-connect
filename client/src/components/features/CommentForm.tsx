import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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

export default function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
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

  const onSubmit = async (values: CommentFormData) => {
    try {
      await api.post(`/posts/${postId}/comments`, values);
      reset();
      showToast('Comment added');
      onCommentAdded();
    } catch (error: unknown) {
      setError('root.server', { message: getErrorMessage(error) });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex items-center gap-2 border-t border-gray-200 p-3 bg-white"
    >
      <Avatar src={user?.profilePicture} name={user?.name ?? 'You'} className="h-8 w-8" />

      <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center border border-transparent focus-within:border-nu-blue/30 transition-colors">
        <input
          type="text"
          placeholder="Write a comment..."
          autoComplete="off"
          className="bg-transparent outline-none w-full text-sm text-gray-800"
          {...register('content')}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="text-nu-blue font-bold text-sm ml-2 disabled:opacity-50 hover:text-nu-blue/80"
        >
          Post
        </button>
      </div>

      {errors.root?.server && (
        <span role="alert" className="absolute bottom-14 left-4 text-xs text-red-600">
          {errors.root.server.message}
        </span>
      )}
    </form>
  );
}