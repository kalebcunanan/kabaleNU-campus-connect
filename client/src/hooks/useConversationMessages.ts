import { useCallback } from 'react';
import api from '../lib/axios';
import { useAxiosFetch } from './useAxiosFetch';
import { usePolling } from './usePolling';
import type { ChatMessage } from '../types/chat';

const MESSAGE_POLL_INTERVAL_MS = 4000;

// Loads a conversation, refreshes it on an interval while active, and sends new messages.
export const useConversationMessages = (conversationId: string, isActive: boolean) => {
  const url = `/conversations/${conversationId}/messages`;
  const { data, loading, error, refetch } = useAxiosFetch<ChatMessage[]>(url);

  usePolling(() => { void refetch(); }, MESSAGE_POLL_INTERVAL_MS, isActive);

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    await api.post<ChatMessage>(url, { content });
    await refetch();
  }, [url, refetch]);

  return { messages: data ?? [], loading, error, sendMessage };
};
