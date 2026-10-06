import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import api, { getErrorMessage } from '../../lib/axios';
import { avatarSchema } from '../../schemas/profile';
import type { AvatarFormValues } from '../../schemas/profile';

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
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
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-2xl border-t-4 border-nu-gold bg-white p-8 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-nu-blue">My Profile</h1>
          <span className="rounded-full bg-nu-blue px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
            {user.role}
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mb-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
          {previewUrl ? (
            <img src={previewUrl} alt="New profile preview" className="h-24 w-24 shrink-0 rounded-full border border-nu-blue/20 object-cover" />
          ) : (
            <Avatar src={user.profilePicture} name={user.name} className="h-24 w-24" />
          )}
          <div className="w-full min-w-0">
            <label htmlFor="picture" className="mb-1 block text-sm font-medium text-gray-700">
              Change profile picture
            </label>
            <input
              id="picture"
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-nu-gold file:px-3 file:py-2 file:text-sm file:font-semibold"
              {...register('picture')}
            />
            {errors.picture && (
              <p role="alert" className="mt-1 text-sm text-red-700">
                {errors.picture.message}
              </p>
            )}
            {errors.root?.server && (
              <p role="alert" className="mt-1 text-sm text-red-700">
                {errors.root.server.message}
              </p>
            )}
            {selectedFile && (
              <div className="mt-3 flex gap-2">
                <Button type="submit" variant="gold" size="sm" isLoading={isSubmitting}>
                  Save photo
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => reset()}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </form>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Full Name</label>
            <p className="text-lg font-bold text-gray-900">{user.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email Address</label>
            <p className="text-lg font-bold text-gray-900">{user.email}</p>
          </div>
          {user.program && (
            <div>
              <label className="text-sm font-medium text-gray-500">Academic Program</label>
              <p className="text-lg font-bold text-gray-900">{user.program}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-500">Total Bulldog Score</label>
            <p className="text-2xl font-black text-nu-gold">{user.bulldogScore} pts</p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6">
          <Button variant="outline" onClick={() => void logout().catch(() => undefined)} className="w-full sm:w-auto">
            Log out from Campus Connect
          </Button>
        </div>
      </div>
    </main>
  );
}