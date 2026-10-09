import React from 'react';
import FadeIn from '../common/FadeIn';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';
import { PostCard } from './PostCard';
import PostCardSkeleton from './PostCardSkeleton';
import { useAxiosFetch } from '../../hooks/useAxiosFetch';
import type { Post } from '../../types/post';

interface MyPostsProps {
  userId: string;
  emptyMessage?: string;
}

const SKELETON_COUNT = 3;

const MyPosts: React.FC<MyPostsProps> = ({ userId, emptyMessage = 'You have not posted yet. Share something on the feed!' }) => {
  const { data: posts, loading, error, refetch } = useAxiosFetch<Post[]>(`/posts?author=${userId}`);
  const items = posts ?? [];

  const handleRefresh = (): void => {
    void refetch();
  };

  if (loading) {
    return (
      <div role="status" aria-label="Loading posts" className="space-y-4">
        {Array.from({ length: SKELETON_COUNT }, (_, slot) => (
          <PostCardSkeleton key={slot} />
        ))}
      </div>
    );
  }

  if (error && items.length === 0) return <ErrorState message={error} onRetry={handleRefresh} />;
  if (items.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <div className="space-y-4">
      {items.map((post, index) => (
        <FadeIn key={post._id} index={index}>
          <PostCard post={post} onDeleted={handleRefresh} />
        </FadeIn>
      ))}
    </div>
  );
};

export default MyPosts;
