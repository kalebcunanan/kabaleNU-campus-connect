import type { PostAuthor } from './post';

// Named PostComment to avoid clashing with the DOM Comment type.
export interface PostComment {
  _id: string;
  post: string;
  author: PostAuthor;
  content: string;
  createdAt: string;
}
