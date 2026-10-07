import { Avatar } from '../common/Avatar';
import type { ChannelMessage } from '../../types/channel';

interface ChannelMessageBubbleProps {
  message: ChannelMessage;
  isMine: boolean;
  showName: boolean;
  showAvatar: boolean;
  isGroupStart: boolean;
}

// Formats the hover time such as "Oct 7, 11:47 PM" using the browser locale.
const formatMessageTime = (isoDate: string): string =>
  new Date(isoDate).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export default function ChannelMessageBubble({ message, isMine, showName, showAvatar, isGroupStart }: ChannelMessageBubbleProps) {
  return (
    <div className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'} ${isGroupStart ? 'mt-3' : 'mt-0.5'}`}>
      {!isMine && (
        showAvatar
          ? <Avatar src={message.sender.profilePicture} name={message.sender.name} className="h-7 w-7" />
          : <span className="h-7 w-7 shrink-0" aria-hidden="true" />
      )}
      <div className={`flex min-w-0 max-w-[75%] flex-col ${isMine ? 'items-end' : 'items-start'}`}>
        {showName && <span className="mb-0.5 px-1 text-xs font-semibold text-gray-500">{message.sender.name}</span>}
        <div className="group relative max-w-full">
          <p
            tabIndex={0}
            className={`whitespace-pre-wrap break-words rounded-2xl px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-nu-gold ${
              isMine ? 'bg-nu-blue text-white' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {message.content}
          </p>
          <time
            dateTime={message.createdAt}
            className={`pointer-events-none absolute bottom-full z-10 mb-1 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 ${
              isMine ? 'right-0' : 'left-0'
            }`}
          >
            {formatMessageTime(message.createdAt)}
          </time>
        </div>
      </div>
    </div>
  );
}
