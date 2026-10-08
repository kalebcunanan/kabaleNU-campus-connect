import type { FriendUser } from '../types/friend';

export const FRIENDS_CHANGED_EVENT = 'friends:changed';

// Tells listeners such as the bell to refresh after a friend action succeeds.
export const notifyFriendsChanged = (): void => {
  window.dispatchEvent(new Event(FRIENDS_CHANGED_EVENT));
};

// Builds the "role, program" line shown under a user's name.
export const formatUserSubtitle = (user: Pick<FriendUser, 'role' | 'program'>): string =>
  user.program ? `${user.role}, ${user.program}` : user.role;
