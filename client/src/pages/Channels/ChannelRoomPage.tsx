import { useCallback, useEffect, useState, useRef } from 'react';
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
  const [channelName, setChannelName] = useState<string>('Channel');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, reset, setError: setFormError, formState: { errors, isSubmitting } } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema)
  });

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [messagesRes, channelsRes] = await Promise.all([
        api.get(`/channels/${id}/messages`),
        api.get('/channels')
      ]);
      setMessages(messagesRes.data);
      const channel = channelsRes.data.find((c: any) => c._id === id);
      if (channel) setChannelName(channel.name);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSendMessage = async (data: MessageFormData) => {
    try {
      await api.post(`/channels/${id}/messages`, data);
      reset();
      fetchData(); 
    } catch (err) {
      setFormError('root.server', { message: getErrorMessage(err) });
    }
  };

  if (loading) return <Loader label="Loading messages..." />;
  if (error) return <div className="p-10 text-center font-medium text-red-500">{error}</div>;

  return (
    <main className="mx-auto flex max-w-4xl flex-col px-4 py-6" style={{ height: 'calc(100vh - 100px)' }}>
      <div className="mb-4 flex items-center justify-between border-b-2 border-nu-gold pb-4">
        <div>
          <Link to="/channels" className="text-sm font-bold text-gray-500 hover:text-nu-blue">
            Back to Channels
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-nu-blue">#{channelName}</h1>
        </div>
        <Button variant="outline" onClick={fetchData}>Refresh</Button>
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
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSendMessage)} className="mt-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            {...register('content')}
            autoComplete="off"
            placeholder="Type a message..."
            className="w-full rounded-md border border-gray-300 p-3 focus:border-nu-blue focus:outline-none focus:ring-1 focus:ring-nu-blue"
          />
          <Button type="submit" isLoading={isSubmitting} className="h-[50px] px-8">
            Send
          </Button>
        </div>
        {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
        {errors.root?.server && <p className="text-xs font-bold text-red-500">{errors.root.server.message}</p>}
      </form>
    </main>
  );
}