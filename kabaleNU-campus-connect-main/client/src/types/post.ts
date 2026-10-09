import type { UserRole } from './auth';

export interface PostAuthor {
  _id: string;
  name: string;
  role: UserRole;
  program?: string;
  profilePicture?: string;
}

export interface PostMedia {
  _id: string;
  url: string;
  type: 'image' | 'video';
}

export interface Post {
  _id: string;
  author: PostAuthor;
  content: string;
  media?: PostMedia[];
  bulldogReacts: number;
  commentCount: number;
  createdAt: string;
  hasReacted?: boolean;
  hotness?: number;
}