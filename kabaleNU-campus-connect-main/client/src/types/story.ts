import type { PostAuthor } from './post';

export interface StoryMedia {
  url: string;
  type: 'image' | 'video';
}

export interface Story {
  _id: string;
  media: StoryMedia;
  caption: string;
  createdAt: string;
  expiresAt: string;
}

export interface StoryGroup {
  author: PostAuthor;
  stories: Story[];
}