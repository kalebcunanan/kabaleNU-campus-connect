import type { ChatUser, Conversation } from '../types/chat';

// Returns the other person in a conversation from the point of view of the given user.
export const getOtherParty = (conversation: Conversation, userId: string): ChatUser =>
  conversation.buyer._id === userId ? conversation.seller : conversation.buyer;

// Formats a message time as a clock time for today and as a short date with time for older days.
export const formatChatTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  const isToday = date.toDateString() === new Date().toDateString();

  return isToday
    ? date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};
