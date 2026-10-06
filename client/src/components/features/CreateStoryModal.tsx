import React, { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../common/Button';
import Input from '../common/Input';
import { useToast } from '../../hooks/useToast';
import api, { getErrorMessage } from '../../lib/axios';
import { storySchema } from '../../schemas/story';
import type { StoryFormValues } from '../../schemas/story';

interface CreateStoryModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ onClose, onCreated }) => {
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StoryFormValues>({
    resolver: zodResolver(storySchema),
    defaultValues: { caption: '' },
  });

  const files = useWatch({ control, name: 'media' });
  const file = files?.[0];
  const isVideo = file?.type.startsWith('video/') ?? false;

  // The preview URL is derived from the selected file during render.
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const onSubmit = async (values: StoryFormValues): Promise<void> => {
    const formData = new FormData();
    formData.append('media', values.media[0]);
    formData.append('caption', values.caption);

    try {
      await api.post('/stories', formData);
      showToast('Story posted');
      onCreated();
      onClose();
    } catch (error) {
      setError('root.server', { message: getErrorMessage(error) });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-lg font-bold text-nu-blue">Create Story</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          >
            X
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 overflow-y-auto p-4">
          {errors.root?.server && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors.root.server.message}
            </p>
          )}

          <div>
            <label htmlFor="storyMedia" className="mb-1 block text-sm font-medium text-gray-700">
              Photo or video
            </label>
            <input
              id="storyMedia"
              type="file"
              accept="image/*,video/*"
              className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-nu-gold file:px-3 file:py-2 file:text-sm file:font-semibold"
              {...register('media')}
            />
            {errors.media && (
              <p role="alert" className="mt-1 text-sm text-red-700">
                {errors.media.message}
              </p>
            )}
          </div>

          {previewUrl && (
            <div className="overflow-hidden rounded-xl bg-black">
              {isVideo ? (
                <video src={previewUrl} controls className="max-h-64 w-full object-contain" />
              ) : (
                <img src={previewUrl} alt="Story preview" className="max-h-64 w-full object-contain" />
              )}
            </div>
          )}

          <Input label="Caption (optional)" error={errors.caption?.message} {...register('caption')} />

          {isSubmitting && <p className="text-sm text-gray-500">Uploading your story, this may take a moment...</p>}

          <div className="flex gap-2">
            <Button type="submit" variant="gold" isLoading={isSubmitting} className="flex-1">
              Share story
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};