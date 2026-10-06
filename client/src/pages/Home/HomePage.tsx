import { useState } from 'react';
import WelcomeEntrance from '../../components/common/WelcomeEntrance';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import Loader from '../../components/common/Loader';
import { CreatePostForm } from '../../components/features/CreatePostForm';
import { PostCard } from '../../components/features/PostCard';
import { StoryBar } from '../../components/features/StoryBar';
import { useAuth } from '../../hooks/useAuth';
import { useAxiosFetch } from '../../hooks/useAxiosFetch';
import type { Post } from '../../types/post';

export default function HomePage() {
  const { user } = useAuth();
  const { data: posts, loading, error, refetch } = useAxiosFetch<Post[]>('/posts/trending');
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

  // The feed is derived during render: fresh posts first, then the trending list without duplicates.
  const serverPosts = posts ?? [];
  const feed = [...newPosts.filter((fresh) => !serverPosts.some((post) => post._id === fresh._id)), ...serverPosts];

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <CreatePostForm onPostCreated={handleCreated} />

      <StoryBar />

      <section>
        <h2 className="mb-4 border-l-4 border-nu-gold pl-3 text-xl font-bold text-nu-blue">Bulldogs Feed</h2>

        {loading && feed.length === 0 ? (
          <Loader label="Loading trending posts..." />
        ) : error && feed.length === 0 ? (
          <ErrorState message={error} onRetry={handleRefresh} />
        ) : feed.length === 0 ? (
          <EmptyState message="No posts yet. Be the first to post!" />
        ) : (
          <div className="space-y-4">
            {feed.map((post, index) => (
              <WelcomeEntrance key={post._id} index={index}>
                <PostCard post={post} onDeleted={() => handleDeleted(post._id)} />
              </WelcomeEntrance>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
