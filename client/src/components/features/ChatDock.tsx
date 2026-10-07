import ChatInbox from './ChatInbox';
import ChatWindow from './ChatWindow';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';

export default function ChatDock() {
  const { user } = useAuth();
  const { windows, isInboxOpen, toggleInbox, openConversation, closeChat, toggleMinimize } = useChat();

  if (!user) return null;

  return (
    <div className="pointer-events-none fixed bottom-0 right-4 z-30 flex items-end gap-3">
      {windows.map((chatWindow, index) => (
        <div
          key={chatWindow.conversation._id}
          className={`pointer-events-auto ${index < windows.length - 1 ? 'hidden sm:block' : ''}`}
        >
          <ChatWindow
            conversation={chatWindow.conversation}
            isMinimized={chatWindow.isMinimized}
            onToggleMinimize={() => toggleMinimize(chatWindow.conversation._id)}
            onClose={() => closeChat(chatWindow.conversation._id)}
          />
        </div>
      ))}

      <div className="pointer-events-auto relative">
        {isInboxOpen && (
          <div className="absolute bottom-full right-0">
            <ChatInbox onSelect={openConversation} />
          </div>
        )}
        <button
          type="button"
          onClick={toggleInbox}
          aria-expanded={isInboxOpen}
          className="rounded-t-xl border-2 border-b-0 border-nu-gold bg-nu-blue px-5 py-2 text-sm font-bold text-white shadow-lg hover:opacity-90"
        >
          Messages
        </button>
      </div>
    </div>
  );
}
