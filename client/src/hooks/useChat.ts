import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';
import type { ChatContextValue } from '../types/chat';

export const useChat = (): ChatContextValue => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used inside ChatProvider');
  return context;
};
