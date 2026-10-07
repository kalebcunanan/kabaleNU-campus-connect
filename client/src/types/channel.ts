import type { UserRole } from './auth';

export type ChannelCategory = 'Church' | 'Orgs' | 'Academics' | 'Others';

export interface ChannelCreator {
  _id: string;
  name: string;
  role: UserRole;
  program?: string;
  profilePicture?: string;
}

export interface Channel {
  _id: string;
  name: string;
  description?: string;
  category: ChannelCategory;
  createdBy: ChannelCreator | null;
  memberCount: number;
  isMember: boolean;
  createdAt: string;
}

export interface ChannelMessageSender {
  _id: string;
  name: string;
  role: UserRole;
  profilePicture?: string;
}

export interface ChannelMessage {
  _id: string;
  sender: ChannelMessageSender;
  content: string;
  createdAt: string;
}