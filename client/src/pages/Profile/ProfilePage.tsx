import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import MyPosts from '../../components/features/MyPosts';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import api, { getErrorMessage } from '../../lib/axios';
import { avatarSchema } from '../../schemas/profile';
import type { AvatarFormValues } from '../../schemas/profile';

const AVATAR_CLASS = 'h-36 w-36 shadow-md ring-4 ring-white';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AvatarFormValues>({ resolver: zodResolver(avatarSchema) });

  const files = useWatch({ control, name: 'picture' });
  const selectedFile = files?.[0];

  // The preview URL is derived from the selected file during render.
  const previewUrl = useMemo(() => (selectedFile ? URL.createObjectURL(selectedFile) : null), [selectedFile]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const onSubmit = async (values: AvatarFormValues): Promise<void> => {
    if (!user) return;

    const formData = new FormData();
    formData.append('profilePicture', values.picture[0]);

    try {
      await api.put(`/users/${user._id}`, formData);
      await refreshUser();
      reset();
      showToast('Profile picture updated');
    } catch (error) {
      setError('root.server', { message: getErrorMessage(error) });
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl pt-20">
      <section className="relative animate-rise-in rounded-2xl border-t-4 border-nu-gold bg-white px-6 pb-8 pt-24 text-center shadow-lg motion-reduce:animate-none">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="New profile preview"
                  className={`${AVATAR_CLASS} rounded-full border border-nu-blue/20 object-cover`}
                />
              ) : (
                <Avatar src={user.profilePicture} name={user.name} className={AVATAR_CLASS} />
              )}

              <input id="picture" type="file" accept="image/*" className="peer sr-only" {...register('picture')} />
              <label
                htmlFor="picture"
                aria-label="Change profile picture"
                className="absolute bottom-1 right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-nu-blue shadow-md ring-1 ring-nu-blue/20 transition-transform hover:scale-105 peer-focus-visible:ring-2 peer-focus-visible:ring-nu-gold"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" className="h-5 w-5">
                  <path d="M9 3 7.17 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.17L15 3H9zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                </svg>
              </label>
            </div>
          </div>

          {selectedFile && (
            <div className="mb-4 flex justify-center gap-2">
              <Button type="submit" variant="gold" size="sm" isLoading={isSubmitting}>
                Save photo
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => reset()}>
                Cancel
              </Button>
            </div>
          )}

          {errors.picture && (
            <p role="alert" className="mb-3 text-sm text-red-700">
              {errors.picture.message}
            </p>
          )}
          {errors.root?.server && (
            <p role="alert" className="mb-3 text-sm text-red-700">
              {errors.root.server.message}
            </p>
          )}
        </form>

        <h1 className="break-words text-3xl font-bold text-nu-blue">{user.name}</h1>
        <p className="mt-1 capitalize text-gray-600">
          {user.role}
          {user.program ? `, ${user.program}` : ''}
        </p>
        <p className="break-words text-gray-500">{user.email}</p>

        <div className="mt-6">
          <p className="text-sm text-gray-500">Total Bulldog Score</p>
          <p className="text-3xl font-extrabold text-nu-gold">{user.bulldogScore} pts</p>
        </div>
      </section>

      <section aria-labelledby="my-posts-heading">
        <div className="my-8 flex items-center gap-4">
          <span aria-hidden="true" className="h-px flex-1 bg-gray-300" />
          <h2 id="my-posts-heading" className="text-lg font-bold text-nu-blue">
            My Posts
          </h2>
          <span aria-hidden="true" className="h-px flex-1 bg-gray-300" />
        </div>

        {/* Remounting on a new avatar reloads the posts so their author pictures stay current. */}
        <MyPosts key={user.profilePicture ?? ''} userId={user._id} />
      </section>
    </div>
  );
}
