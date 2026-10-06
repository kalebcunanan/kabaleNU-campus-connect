import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { channelSchema, type ChannelFormData } from '../../schemas/channel';
import api, { getErrorMessage } from '../../lib/axios';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

export default function ChannelsPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ChannelFormData>({
    resolver: zodResolver(channelSchema)
  });

  const fetchChannels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/channels');
      setChannels(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const onCreateSubmit = async (data: ChannelFormData) => {
    try {
      setCreateError(null);
      await api.post('/channels', data);
      reset();
      setIsCreating(false);
      fetchChannels();
    } catch (err) {
      setCreateError(getErrorMessage(err));
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between border-b-2 border-nu-gold pb-4">
        <div>
          <h1 className="text-3xl font-bold text-nu-blue">Channels</h1>
          <p className="text-gray-600">Join the conversation with your fellow Bulldogs.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Cancel' : '+ New Channel'}
        </Button>
      </div>

      {isCreating && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-bold text-nu-blue">Create a Channel</h3>
          <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Channel Name</label>
                <input {...register('name')} className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-nu-blue focus:outline-none" />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="w-1/3">
                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                <select {...register('category')} className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-nu-blue focus:outline-none">
                  <option value="">Select...</option>
                  <option value="Church">Church</option>
                  <option value="Orgs">Orgs</option>
                  <option value="Academics">Academics</option>
                  <option value="Others">Others</option>
                </select>
                {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
              </div>
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description (Optional)</label>
              <input {...register('description')} className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-nu-blue focus:outline-none" />
            </div>

            {createError && <p className="text-sm text-red-500">{createError}</p>}
            
            <div className="flex justify-end">
              <Button type="submit" isLoading={isSubmitting}>Create</Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <Loader label="Loading channels..." />
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-6 text-center font-medium text-red-500">{error}</div>
      ) : channels.length === 0 ? (
        <div className="p-12 text-center text-gray-500">No channels yet. Be the first to create one!</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map(channel => (
            <Link key={channel._id} to={`/channels/${channel._id}`} className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-nu-blue hover:shadow-md">
              <span className="mb-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                {channel.category}
              </span>
              <h3 className="text-lg font-bold text-nu-blue"># {channel.name}</h3>
              {channel.description && <p className="mt-2 text-sm text-gray-600 line-clamp-2">{channel.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}