import { Avatar } from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { useAxiosFetch } from '../../hooks/useAxiosFetch';
import { usePolling } from '../../hooks/usePolling';
import { getOtherParty } from '../../lib/chat';
import type { Conversation } from '../../types/chat';

const INBOX_POLL_INTERVAL_MS = 8000;

interface ChatInboxProps {
  onSelect: (conversation: Conversation) => void;
}

export default function ChatInbox({ onSelect }: ChatInboxProps) {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useAxiosFetch<Conversation[]>('/conversations');

  usePolling(() => { void refetch(); }, INBOX_POLL_INTERVAL_MS, true);

  const userId = user?._id ?? '';
  const conversations = data ?? [];

  return (
    <div className="max-h-80 w-72 overflow-y-auto rounded-t-xl border-2 border-nu-blue bg-white shadow-xl">
      <h2 className="border-b border-gray-200 px-4 py-2 text-sm font-bold text-nu-blue">Messages</h2>

      {loading ? (
        <p className="p-4 text-sm text-gray-500">Loading conversations...</p>
      ) : error && conversations.length === 0 ? (
        <p className="p-4 text-sm text-red-500">{error}</p>
      ) : conversations.length === 0 ? (
        <p className="p-4 text-sm text-gray-500">
          No conversations yet. Message a friend from their profile or tap Message Seller on a marketplace item.
        </p>
      ) : (
        <ul>
          {conversations.map((conversation) => {
            const other = getOtherParty(conversation, userId);
            return (
              <li key={conversation._id}>
                <button
                  type="button"
                  onClick={() => onSelect(conversation)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                >
                  <Avatar src={other.profilePicture} name={other.name} className="h-9 w-9" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-gray-800">{other.name}</span>
                    {conversation.item && (
                      <span className="block truncate text-xs text-nu-blue">{conversation.item.title}</span>
                    )}
                    {conversation.lastMessage && (
                      <span className="block truncate text-xs text-gray-500">{conversation.lastMessage}</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
