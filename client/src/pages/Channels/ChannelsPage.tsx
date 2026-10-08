import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ChannelCard from '../../components/features/ChannelCard';
import ChannelCardSkeleton from '../../components/features/ChannelCardSkeleton';
import Button from '../../components/common/Button';
import FadeIn from '../../components/common/FadeIn';
import Input from '../../components/common/Input';
import Select, { type SelectOption } from '../../components/common/Select';
import { ErrorState } from '../../components/common/ErrorState';
import { channelSchema, type ChannelFormData } from '../../schemas/channel';
import { useAxiosFetch } from '../../hooks/useAxiosFetch';
import { useToast } from '../../hooks/useToast';
import api, { getErrorMessage } from '../../lib/axios';
import type { Channel, ChannelCategory } from '../../types/channel';

const CATEGORY_NAMES: ChannelCategory[] = ['Church', 'Orgs', 'Academics', 'Others'];
const CATEGORY_OPTIONS: SelectOption[] = CATEGORY_NAMES.map((name) => ({ value: name, label: name }));

const SKELETON_IDS = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;

export default function ChannelsPage() {
  const { data, loading, error, refetch } = useAxiosFetch<Channel[]>('/channels');
  const { showToast } = useToast();
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<ChannelFormData>({
    resolver: zodResolver(channelSchema)
  });

  const channels = data ?? [];

  const toggleForm = (): void => {
    if (isCreating) reset();
    setIsCreating(!isCreating);
  };

  const onCreateSubmit = async (values: ChannelFormData): Promise<void> => {
    try {
      await api.post<Channel>('/channels', values);
      reset();
      setIsCreating(false);
      showToast('Channel created');
      await refetch();
    } catch (err) {
      setError('root.server', { message: getErrorMessage(err) });
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between gap-4 border-b-2 border-nu-gold pb-4">
        <div>
          <h1 className="text-3xl font-bold text-nu-blue">Channels</h1>
          <p className="text-gray-600">Join the conversation with your fellow Bulldogs.</p>
        </div>
        <Button onClick={toggleForm} className="shrink-0">
          {isCreating ? 'Cancel' : '+ New Channel'}
        </Button>
      </div>

      {isCreating && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-nu-blue">Create a Channel</h2>
          <form onSubmit={handleSubmit(onCreateSubmit)} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Input label="Channel name" error={errors.name?.message} {...register('name')} />
              </div>
              <Select
                label="Category"
                placeholder="Select a category"
                options={CATEGORY_OPTIONS}
                error={errors.category?.message}
                {...register('category')}
              />
            </div>
            <Input label="Description (optional)" error={errors.description?.message} {...register('description')} />

            {errors.root?.server && <p role="alert" className="text-sm font-medium text-red-500">{errors.root.server.message}</p>}

            <div className="flex justify-end">
              <Button type="submit" isLoading={isSubmitting}>Create</Button>
            </div>
          </form>
        </div>
      )}

      {loading && !data ? (
        <div role="status" aria-label="Loading channels" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SKELETON_IDS.map((id) => (
            <ChannelCardSkeleton key={id} />
          ))}
        </div>
      ) : error && !data ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : channels.length === 0 ? (
        <div className="p-12 text-center text-gray-500">No channels yet. Be the first to create one!</div>
      ) : (
        <>
          {error && <p role="alert" className="mb-3 text-sm font-medium text-red-500">Unable to refresh channels: {error}</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((channel, index) => (
              <FadeIn key={channel._id} index={index}>
                <ChannelCard channel={channel} />
              </FadeIn>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
