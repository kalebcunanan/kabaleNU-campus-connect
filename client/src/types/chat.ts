import type { MarketStatus } from './market';

export interface ChatUser {
  _id: string;
  name: string;
  profilePicture?: string;
}

export interface ConversationItem {
  _id: string;
  title: string;
  image?: string;
  price: number;
  status: MarketStatus;
}

export interface Conversation {
  _id: string;
  item: ConversationItem;
  buyer: ChatUser;
  seller: ChatUser;
  lastMessage?: string;
  lastMessageAt?: string | null;
}

export interface ChatMessage {
  _id: string;
  sender: ChatUser;
  content: string;
  createdAt: string;
}

export interface ChatWindowState {
  conversation: Conversation;
  isMinimized: boolean;
}

export interface ChatContextValue {
  windows: ChatWindowState[];
  isInboxOpen: boolean;
  startChat: (itemId: string) => Promise<void>;
  openConversation: (conversation: Conversation) => void;
  closeChat: (conversationId: string) => void;
  toggleMinimize: (conversationId: string) => void;
  toggleInbox: () => void;
}
