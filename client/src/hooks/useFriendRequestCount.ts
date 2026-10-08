import { useEffect } from 'react';
import { useAxiosFetch } from './useAxiosFetch';
import { usePolling } from './usePolling';
import { FRIENDS_CHANGED_EVENT } from '../lib/friends';
import type { RequestCount } from '../types/friend';

const REQUEST_POLL_INTERVAL_MS = 10000;

// Returns the number of pending friend requests, refreshed on an interval and after friend actions.
export const useFriendRequestCount = (): number => {
  const { data, refetch } = useAxiosFetch<RequestCount>('/friends/requests/count');

  usePolling(() => { void refetch(); }, REQUEST_POLL_INTERVAL_MS, true);

  useEffect(() => {
    const handleChanged = (): void => { void refetch(); };
    window.addEventListener(FRIENDS_CHANGED_EVENT, handleChanged);
    return () => window.removeEventListener(FRIENDS_CHANGED_EVENT, handleChanged);
  }, [refetch]);

  return data?.count ?? 0;
};
