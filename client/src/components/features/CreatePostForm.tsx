// client/src/components/features/CreatePostForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postSchema, type PostFormData } from '../../schemas/post';
import api, { getErrorMessage } from '../../lib/axios'; // Updated imports!

interface CreatePostFormProps {
  onPostCreated: () => void;
}

export const CreatePostForm: React.FC<CreatePostFormProps> = ({ onPostCreated }) => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PostFormData>({
    resolver: zodResolver(postSchema)
  });

  const onSubmit = async (data: PostFormData) => {
    try {
      setApiError(null);
      setSuccess(false);
      await api.post('/posts', data); // Updated to use 'api'
      setSuccess(true);
      reset();
      onPostCreated(); // Refresh the feed
    } catch (error: unknown) {
      // Using your handy getErrorMessage utility!
      setApiError(getErrorMessage(error));
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <textarea
          {...register('content')}
          placeholder="What's happening on campus?"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFB81C]"
          rows={3}
        />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
        )}
        
        {apiError && <p className="text-red-500 text-sm mt-2">{apiError}</p>}
        {success && <p className="text-green-600 text-sm mt-2 font-medium">Post published! +5 Bulldog Score</p>}

        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#00205B] text-white px-4 py-2 rounded-md font-bold hover:bg-blue-900 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};