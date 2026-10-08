import type { UserRole } from './auth';

export type FriendStatus = 'none' | 'friends' | 'pending_sent' | 'pending_received' | 'self';

export type FriendsTab = 'search' | 'requests' | 'friends';

export interface FriendUser {
  _id: string;
  name: string;
  role: UserRole;
  program?: string;
  profilePicture?: string;
}

export interface FriendRelation {
  friendStatus: FriendStatus;
  friendshipId: string | null;
}

export interface SearchedUser extends FriendUser, FriendRelation {}

export interface FriendListItem extends FriendUser {
  friendshipId: string;
}

export interface FriendRequest {
  _id: string;
  createdAt: string;
  user: FriendUser;
}

export interface RequestCount {
  count: number;
}

export interface PublicProfile extends FriendUser {
  bulldogScore: number;
  createdAt: string;
}
