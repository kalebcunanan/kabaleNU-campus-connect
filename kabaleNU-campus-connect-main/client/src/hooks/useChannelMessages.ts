import { useCallback } from 'react';
import api from '../lib/axios';
import { useAxiosFetch } from './useAxiosFetch';
import { usePolling } from './usePolling';
import type { ChannelMessage } from '../types/channel';

const CHANNEL_POLL_INTERVAL_MS = 3000;

interface UseChannelMessagesResult {
  messages: ChannelMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
}

// Loads a channel's messages, refreshes them every few seconds while mounted, and sends new messages.
export const useChannelMessages = (channelId: string): UseChannelMessagesResult => {
  const url = `/channels/${channelId}/messages`;
  const { data, loading, error, refetch } = useAxiosFetch<ChannelMessage[]>(url);

  usePolling(() => { void refetch(); }, CHANNEL_POLL_INTERVAL_MS, true);

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    await api.post<ChannelMessage>(url, { content });
    await refetch();
  }, [url, refetch]);

  return { messages: data ?? [], loading, error, sendMessage };
};
