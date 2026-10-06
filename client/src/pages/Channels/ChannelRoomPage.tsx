import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { messageSchema, type MessageFormData } from '../../schemas/channel';
import api, { getErrorMessage } from '../../lib/axios';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

export default function ChannelRoomPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema)
  });

  const fetchMessages = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get(`/channels/${id}/messages`);
      setMessages(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const onSendMessage = async (data: MessageFormData) => {
    try {
      await api.post(`/channels/${id}/messages`, data);
      reset();
      fetchMessages(); // Refresh messages pagkatapos mag-send
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <Loader label="Loading messages..." />;
  if (error) return <div className="p-10 text-center font-medium text-red-500">{error}</div>;

  return (
    <main className="mx-auto flex max-w-4xl flex-col px-4 py-6" style={{ height: 'calc(100vh - 100px)' }}>
      <div className="mb-4 flex items-center justify-between border-b-2 border-nu-gold pb-4">
        <div>
          <Link to="/channels" className="text-sm font-bold text-gray-500 hover:text-nu-blue">
            &larr; Back to Channels
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-nu-blue">Channel Chat</h1>
        </div>
        <Button variant="outline" onClick={fetchMessages}>Refresh</Button>
      </div>

      <div className="flex-grow overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            Be the first to send a message!
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {messages.map((msg) => {
              const isMine = msg.sender._id === user?._id;
              return (
                <div key={msg._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <span className="mb-1 text-xs font-bold text-gray-500">
                    {msg.sender.name} • {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                  <div className={`rounded-2xl px-4 py-2 ${isMine ? 'bg-nu-blue text-white' : 'bg-gray-100 text-gray-800'}`}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSendMessage)} className="mt-4 flex gap-2">
        <div className="flex-grow">
          <input
            {...register('content')}
            autoComplete="off"
            placeholder="Type a message..."
            className="w-full rounded-md border border-gray-300 p-3 focus:border-nu-blue focus:outline-none focus:ring-1 focus:ring-nu-blue"
          />
          {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>}
        </div>
        <Button type="submit" isLoading={isSubmitting} className="h-[50px] px-8">
          Send
        </Button>
      </form>
    </main>
  );
}