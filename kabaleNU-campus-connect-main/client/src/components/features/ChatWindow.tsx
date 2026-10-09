import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar } from '../common/Avatar';
import { messageSchema, type MessageFormData } from '../../schemas/channel';
import { useAuth } from '../../hooks/useAuth';
import { useConversationMessages } from '../../hooks/useConversationMessages';
import { getErrorMessage } from '../../lib/axios';
import { formatChatTime, getOtherParty } from '../../lib/chat';
import type { Conversation } from '../../types/chat';
import sendIcon from '../../assets/logo/kabalenu-icon.png';

const TIME_GAP_MS = 10 * 60 * 1000;

interface ChatWindowProps {
  conversation: Conversation;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onClose: () => void;
}

export default function ChatWindow({ conversation, isMinimized, onToggleMinimize, onClose }: ChatWindowProps) {
  const { user } = useAuth();
  const { messages, loading, error, sendMessage } = useConversationMessages(conversation._id, !isMinimized);
  const listRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema)
  });

  const userId = user?._id ?? '';
  const other = getOtherParty(conversation, userId);

  useEffect(() => {
    const list = listRef.current;
    if (list && !isMinimized) list.scrollTop = list.scrollHeight;
  }, [messages.length, isMinimized]);

  const onSend = async (data: MessageFormData) => {
    try {
      await sendMessage(data.content);
      reset();
    } catch (err) {
      setError('root.server', { message: getErrorMessage(err) });
    }
  };

  return (
    <section
      aria-label={`Chat with ${other.name}`}
      className="flex w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-t-xl border-2 border-nu-blue bg-white shadow-xl"
    >
      <header className="flex items-center gap-2 border-b border-gray-200 px-3 py-2">
        <button
          type="button"
          onClick={onToggleMinimize}
          aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <Avatar src={other.profilePicture} name={other.name} className="h-8 w-8" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-gray-900">{other.name}</span>
            {conversation.item && <span className="block truncate text-xs text-nu-blue">{conversation.item.title}</span>}
          </span>
        </button>
        <button
          type="button"
          onClick={onToggleMinimize}
          aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
          className="rounded p-1 text-nu-blue hover:bg-gray-100"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M5 12h14" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="rounded p-1 text-nu-blue hover:bg-gray-100"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      {!isMinimized && (
        <>
          <div ref={listRef} className="h-72 space-y-2 overflow-y-auto px-3 py-3">
            {loading ? (
              <p className="text-center text-sm text-gray-500">Loading messages...</p>
            ) : error && messages.length === 0 ? (
              <p className="text-center text-sm text-red-500">{error}</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-sm text-gray-500">Say hi to {other.name}!</p>
            ) : (
              messages.map((message, index) => {
                const isMine = message.sender._id === userId;
                const previous = messages[index - 1];
                const showTime =
                  !previous ||
                  new Date(message.createdAt).getTime() - new Date(previous.createdAt).getTime() > TIME_GAP_MS;

                return (
                  <div key={message._id}>
                    {showTime && (
                      <p className="my-2 text-center text-xs text-gray-400">{formatChatTime(message.createdAt)}</p>
                    )}
                    <div className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      {!isMine && (
                        <Avatar src={message.sender.profilePicture} name={message.sender.name} className="h-7 w-7" />
                      )}
                      <p
                        className={`max-w-[75%] break-words rounded-2xl px-3 py-1.5 text-sm ${
                          isMine ? 'bg-nu-blue text-white' : 'bg-blue-100 text-gray-800'
                        }`}
                      >
                        {message.content}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSubmit(onSend)} className="border-t border-gray-200 p-2">
            <div className="flex items-center gap-2">
              <input
                {...register('content')}
                autoComplete="off"
                placeholder="Aa"
                aria-label="Message"
                className="min-w-0 flex-1 rounded-full border border-gray-300 bg-gray-100 px-4 py-2 text-sm focus:border-nu-blue focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                aria-label="Send message"
                className="shrink-0 rounded-full p-1 hover:bg-gray-100 disabled:opacity-60"
              >
                <img src={sendIcon} alt="" className="h-8 w-8 object-contain" />
              </button>
            </div>
            {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>}
            {errors.root?.server && <p className="mt-1 text-xs font-bold text-red-500">{errors.root.server.message}</p>}
          </form>
        </>
      )}
    </section>
  );
}
