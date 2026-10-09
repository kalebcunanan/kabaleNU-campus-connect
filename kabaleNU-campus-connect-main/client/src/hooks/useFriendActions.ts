import { useState } from 'react';
import api, { getErrorMessage } from '../lib/axios';
import { notifyFriendsChanged } from '../lib/friends';
import { useToast } from './useToast';

// Wraps the friend mutations with a busy flag, toast feedback, and a refresh callback.
export const useFriendActions = (onChanged?: () => void) => {
  const { showToast } = useToast();
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const run = async (request: () => Promise<unknown>, successMessage: string): Promise<boolean> => {
    setIsBusy(true);
    try {
      await request();
      showToast(successMessage);
      notifyFriendsChanged();
      onChanged?.();
      return true;
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
      return false;
    } finally {
      setIsBusy(false);
    }
  };

  const sendRequest = (userId: string): Promise<boolean> =>
    run(() => api.post(`/friends/requests/${userId}`), 'Friend request sent');

  const acceptRequest = (requestId: string): Promise<boolean> =>
    run(() => api.put(`/friends/requests/${requestId}/accept`), 'Friend request accepted');

  const removeRequest = (requestId: string, successMessage: string): Promise<boolean> =>
    run(() => api.delete(`/friends/requests/${requestId}`), successMessage);

  const removeFriend = (userId: string): Promise<boolean> =>
    run(() => api.delete(`/friends/${userId}`), 'Friend removed');

  return { isBusy, sendRequest, acceptRequest, removeRequest, removeFriend };
};
