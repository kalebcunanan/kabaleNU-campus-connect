import { useState } from 'react';
import FadeIn from '../../components/common/FadeIn';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { CreatePostForm } from '../../components/features/CreatePostForm';
import FeedSortTabs from '../../components/features/FeedSortTabs';
import { PostCard } from '../../components/features/PostCard';
import PostCardSkeleton from '../../components/features/PostCardSkeleton';
import { StoryBar } from '../../components/features/StoryBar';
import { useAuth } from '../../hooks/useAuth';
import { useAxiosFetch } from '../../hooks/useAxiosFetch';
import type { FeedSort } from '../../types/feed';
import type { Post } from '../../types/post';

const FEED_URLS: Record<FeedSort, string> = {
  recent: '/posts',
  trending: '/posts/trending',
};

const SKELETON_COUNT = 3;

export default function HomePage() {
  const { user } = useAuth();
  const [sort, setSort] = useState<FeedSort>('recent');
  const { data: posts, loading, error, refetch } = useAxiosFetch<Post[]>(FEED_URLS[sort]);
  const [newPosts, setNewPosts] = useState<Post[]>([]);

  const handleRefresh = (): void => {
    void refetch();
  };

  const handleCreated = (post: Post): void => {
    setNewPosts((previous) => [post, ...previous]);
  };

  const handleDeleted = (postId: string): void => {
    setNewPosts((previous) => previous.filter((post) => post._id !== postId));
    void refetch();
  };

  // The feed is derived during render: fresh posts first, then the server list without duplicates.
  const serverPosts = posts ?? [];
  const feed = [...newPosts.filter((fresh) => !serverPosts.some((post) => post._id === fresh._id)), ...serverPosts];

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <CreatePostForm onPostCreated={handleCreated} />

      <StoryBar />

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="border-l-4 border-nu-gold pl-3 text-xl font-bold text-nu-blue">Bulldogs Feed</h2>
          <FeedSortTabs value={sort} onChange={setSort} />
        </div>

        {loading ? (
          <div role="status" aria-label="Loading posts" className="space-y-4">
            {Array.from({ length: SKELETON_COUNT }, (_, slot) => (
              <PostCardSkeleton key={slot} />
            ))}
          </div>
        ) : error && feed.length === 0 ? (
          <ErrorState message={error} onRetry={handleRefresh} />
        ) : feed.length === 0 ? (
          <EmptyState message="No posts yet. Be the first to post!" />
        ) : (
          <div className="space-y-4">
            {feed.map((post, index) => (
              <FadeIn key={post._id} index={index}>
                <PostCard post={post} onDeleted={() => handleDeleted(post._id)} />
              </FadeIn>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
