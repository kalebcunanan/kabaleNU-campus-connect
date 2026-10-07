import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ChannelMessageBubble from './ChannelMessageBubble';
import Button from '../common/Button';
import { messageSchema, type MessageFormData } from '../../schemas/channel';
import { useAuth } from '../../hooks/useAuth';
import { useChannelMessages } from '../../hooks/useChannelMessages';
import { getErrorMessage } from '../../lib/axios';
import type { ChannelMessage } from '../../types/channel';

const GROUP_GAP_MS = 5 * 60 * 1000;
const NEAR_BOTTOM_PX = 80;

interface ChannelChatProps {
  channelId: string;
}

// Two messages share a group when the same person sent them within a few minutes.
const isSameGroup = (earlier: ChannelMessage, later: ChannelMessage): boolean =>
  earlier.sender._id === later.sender._id &&
  new Date(later.createdAt).getTime() - new Date(earlier.createdAt).getTime() <= GROUP_GAP_MS;

export default function ChannelChat({ channelId }: ChannelChatProps) {
  const { user } = useAuth();
  const { messages, loading, error, sendMessage } = useChannelMessages(channelId);
  const listRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef<boolean>(true);

  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema)
  });

  const userId = user?._id ?? '';

  // Scrolls down for new messages only when the reader is already near the bottom.
  useEffect(() => {
    const list = listRef.current;
    if (list && isNearBottomRef.current) list.scrollTop = list.scrollHeight;
  }, [messages.length]);

  const handleScroll = (): void => {
    const list = listRef.current;
    if (list) isNearBottomRef.current = list.scrollHeight - list.scrollTop - list.clientHeight < NEAR_BOTTOM_PX;
  };

  const onSend = async (values: MessageFormData): Promise<void> => {
    isNearBottomRef.current = true;
    try {
      await sendMessage(values.content);
      reset();
    } catch (err) {
      setError('root.server', { message: getErrorMessage(err) });
    }
  };

  return (
    <section aria-label="Channel chat" className="flex min-h-0 flex-1 flex-col">
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden rounded-xl border border-gray-200 bg-white px-4 pb-4 pt-8 shadow-sm"
      >
        {loading && messages.length === 0 ? (
          <p role="status" className="text-center text-sm text-gray-500">Loading messages...</p>
        ) : error && messages.length === 0 ? (
          <p role="alert" className="text-center text-sm font-medium text-red-500">{error}</p>
        ) : messages.length === 0 ? (
          <p className="flex h-full items-center justify-center text-gray-500">Be the first to send a message!</p>
        ) : (
          messages.map((message, index) => {
            const previous = messages[index - 1];
            const next = messages[index + 1];
            const isMine = message.sender._id === userId;
            const isGroupStart = !previous || !isSameGroup(previous, message);
            const isGroupEnd = !next || !isSameGroup(message, next);

            return (
              <ChannelMessageBubble
                key={message._id}
                message={message}
                isMine={isMine}
                showName={!isMine && isGroupStart}
                showAvatar={!isMine && isGroupEnd}
                isGroupStart={isGroupStart}
              />
            );
          })
        )}
      </div>

      {error && messages.length > 0 && (
        <p role="alert" className="mt-2 text-xs font-bold text-red-500">Unable to refresh messages: {error}</p>
      )}

      <form onSubmit={handleSubmit(onSend)} noValidate className="mt-3">
        <div className="flex gap-2">
          <input
            {...register('content')}
            autoComplete="off"
            placeholder="Type a message..."
            aria-label="Message"
            className="min-w-0 flex-1 rounded-full border border-gray-300 bg-gray-100 px-4 py-3 text-sm focus:border-nu-blue focus:outline-none focus:ring-1 focus:ring-nu-blue"
          />
          <Button type="submit" isLoading={isSubmitting} className="shrink-0 px-6">Send</Button>
        </div>
        {errors.content && <p role="alert" className="mt-1 text-xs text-red-500">{errors.content.message}</p>}
        {errors.root?.server && <p role="alert" className="mt-1 text-xs font-bold text-red-500">{errors.root.server.message}</p>}
      </form>
    </section>
  );
}
