import React, { useEffect, useMemo, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../common/Button';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import api, { getErrorMessage } from '../../lib/axios';
import { postSchema, type PostFormData } from '../../schemas/post';
import type { Post } from '../../types/post';
import postIcon from '../../assets/icons/post.png';

const MAX_FILES = 4;
const NO_FILES: File[] = [];

interface CreatePostModalProps {
  openPicker: boolean;
  onClose: () => void;
  onCreated: (post: Post) => void;
}

interface MediaPreview {
  key: string;
  file: File;
  url: string;
  isVideo: boolean;
}

const getFileKey = (file: File): string => `${file.name}-${file.size}-${file.lastModified}`;

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ openPicker, onClose, onCreated }) => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    setFocus,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: { content: '', media: [] },
  });

  const content = useWatch({ control, name: 'content' });
  const media = useWatch({ control, name: 'media' }) ?? NO_FILES;

  // Everything below is derived from the watched values during render.
  const canPost = (content ?? '').trim().length > 0 || media.length > 0;
  const hasDraft = canPost;

  const previews = useMemo<MediaPreview[]>(
    () =>
      media.map((file) => ({
        key: getFileKey(file),
        file,
        url: URL.createObjectURL(file),
        isVideo: file.type.startsWith('video/'),
      })),
    [media],
  );

  useEffect(
    () => () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    },
    [previews],
  );

  useEffect(() => {
    setFocus('content');
    if (openPicker) fileInputRef.current?.click();
  }, [openPicker, setFocus]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, onClose]);

  const handleBackdropClick = (): void => {
    if (!isSubmitting && !hasDraft) onClose();
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const known = new Set(media.map(getFileKey));
    const picked = Array.from(event.target.files ?? []).filter((file) => !known.has(getFileKey(file)));
    setValue('media', [...media, ...picked], { shouldValidate: true });
    event.target.value = '';
  };

  const removeFile = (target: File): void => {
    setValue(
      'media',
      media.filter((file) => file !== target),
      { shouldValidate: true },
    );
  };

  const onSubmit = async (data: PostFormData): Promise<void> => {
    const formData = new FormData();
    formData.append('content', data.content);
    data.media.forEach((file) => formData.append('media', file));

    try {
      const { data: created } = await api.post<Post>('/posts', formData);
      showToast('Post published! +5 Bulldog Score');
      void refreshUser();
      onCreated(created);
      onClose();
    } catch (error) {
      setError('root.server', { message: getErrorMessage(error) });
    }
  };

  const { ref: contentRef, ...contentField } = register('content');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-post-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div className="absolute inset-0" onClick={handleBackdropClick} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="relative flex items-center justify-center border-b border-gray-200 px-4 py-3">
          <h3 id="create-post-title" className="text-lg font-bold text-nu-blue">
            Create post
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 disabled:opacity-50"
          >
            X
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-4">
          <div className="mb-3 flex items-center gap-3">
            <Avatar src={user?.profilePicture} name={user?.name ?? 'You'} className="h-11 w-11" />
            <div className="min-w-0">
              <p className="truncate font-bold text-nu-blue">{user?.name}</p>
              <p className="text-xs font-medium text-gray-500">{user?.program ?? user?.role}</p>
            </div>
          </div>

          <textarea
            {...contentField}
            ref={(element) => {
              contentRef(element);
            }}
            aria-label="Write a post"
            placeholder="What's happening on campus?"
            rows={4}
            disabled={isSubmitting}
            className="block max-h-60 min-h-[112px] w-full resize-none bg-transparent text-lg text-gray-800 placeholder:text-gray-500 focus:outline-none"
          />

          {previews.length > 0 && (
            <ul className={`mb-3 grid gap-1 ${previews.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {previews.map((preview) => (
                <li key={preview.key} className="relative overflow-hidden rounded-lg bg-gray-100">
                  {preview.isVideo ? (
                    <video src={preview.url} muted className="max-h-72 w-full bg-black object-contain" />
                  ) : (
                    <img src={preview.url} alt="Selected attachment" className="max-h-72 w-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(preview.file)}
                    disabled={isSubmitting}
                    aria-label="Remove attachment"
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white hover:bg-black/80 disabled:opacity-50"
                  >
                    X
                  </button>
                </li>
              ))}
            </ul>
          )}

          {errors.content?.message && <p className="mb-2 text-sm text-red-600">{errors.content.message}</p>}
          {errors.media?.message && <p className="mb-2 text-sm text-red-600">{errors.media.message}</p>}
          {errors.root?.server && (
            <p role="alert" className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors.root.server.message}
            </p>
          )}
          {isSubmitting && media.length > 0 && (
            <p className="mb-2 text-sm text-gray-500">Uploading your files, this may take a moment...</p>
          )}
        </div>

        <div className="space-y-3 px-4 pb-4 pt-2">
          <div className="flex items-center justify-between rounded-xl border border-gray-300 px-4 py-2">
            <span className="text-sm font-semibold text-gray-700">Add to your post</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting || media.length >= MAX_FILES}
              aria-label="Add photos or videos"
              className="rounded-lg p-1 transition hover:bg-nu-blue/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <img src={postIcon} alt="" className="h-8 w-8" />
            </button>
          </div>

          <Button type="submit" variant="gold" disabled={!canPost} isLoading={isSubmitting} className="w-full">
            Post
          </Button>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple hidden onChange={handleFilesChange} />
      </form>
    </div>
  );
};
