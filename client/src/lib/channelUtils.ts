import type { Channel } from '../types/channel';

// Returns the member count with the correct singular or plural noun.
export const formatMemberCount = (count: number): string => `${count} ${count === 1 ? 'member' : 'members'}`;

// Returns the creator name, or a fallback when the creator account was deleted.
export const getCreatorName = (channel: Channel): string => channel.createdBy?.name ?? 'Deleted user';

// Returns true when the given user created the channel.
export const isChannelCreator = (channel: Channel, userId: string | undefined): boolean =>
  Boolean(userId) && channel.createdBy?._id === userId;
