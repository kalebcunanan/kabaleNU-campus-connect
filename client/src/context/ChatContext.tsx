import { createContext, useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import api, { getErrorMessage } from '../lib/axios';
import { useToast } from '../hooks/useToast';
import type { ChatContextValue, ChatWindowState, Conversation } from '../types/chat';

export const ChatContext = createContext<ChatContextValue | undefined>(undefined);

const MAX_OPEN_WINDOWS = 2;

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const { showToast } = useToast();
  const [windows, setWindows] = useState<ChatWindowState[]>([]);
  const [isInboxOpen, setIsInboxOpen] = useState<boolean>(false);

  // Opens a conversation as the newest window and drops the oldest one past the limit.
  const openConversation = useCallback((conversation: Conversation): void => {
    setWindows((previous) => {
      const others = previous.filter((chatWindow) => chatWindow.conversation._id !== conversation._id);
      return [...others, { conversation, isMinimized: false }].slice(-MAX_OPEN_WINDOWS);
    });
    setIsInboxOpen(false);
  }, []);

  const startChat = useCallback(async (itemId: string): Promise<void> => {
    try {
      const { data } = await api.post<Conversation>('/conversations', { itemId });
      openConversation(data);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }, [openConversation, showToast]);

  const closeChat = useCallback((conversationId: string): void => {
    setWindows((previous) => previous.filter((chatWindow) => chatWindow.conversation._id !== conversationId));
  }, []);

  const toggleMinimize = useCallback((conversationId: string): void => {
    setWindows((previous) =>
      previous.map((chatWindow) =>
        chatWindow.conversation._id === conversationId
          ? { ...chatWindow, isMinimized: !chatWindow.isMinimized }
          : chatWindow
      )
    );
  }, []);

  const toggleInbox = useCallback((): void => {
    setIsInboxOpen((previous) => !previous);
  }, []);

  const value = useMemo<ChatContextValue>(
    () => ({ windows, isInboxOpen, startChat, openConversation, closeChat, toggleMinimize, toggleInbox }),
    [windows, isInboxOpen, startChat, openConversation, closeChat, toggleMinimize, toggleInbox],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
