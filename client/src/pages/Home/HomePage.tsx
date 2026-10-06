import { useCallback, useEffect, useState } from 'react';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import api, { getErrorMessage } from '../../lib/axios';
import { CreatePostForm } from '../../components/features/CreatePostForm';
import { PostCard } from '../../components/features/PostCard';

export default function HomePage() {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/posts/trending');
      setPosts(response.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingPosts();
  }, [fetchTrendingPosts]);

  if (!user) return null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      {/* Existing Profile Section */}
      <section className="mb-8 rounded-2xl border-t-4 border-nu-gold bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-nu-blue">Hello, {user.name}</h1>
        <p className="mt-2 text-gray-600">
          Signed in as {user.email} ({user.role}). Bulldog Score: {user.bulldogScore}
        </p>
        <Button variant="outline" className="mt-6" onClick={() => void logout().catch(() => undefined)}>
          Log out
        </Button>
      </section>

      {/* New Trending Feed Section */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-nu-blue">Trending Feed</h2>
        <CreatePostForm onPostCreated={fetchTrendingPosts} />

        {loading ? (
          <Loader label="Loading trending posts..." />
        ) : error ? (
          <div className="p-8 text-center font-medium text-red-500">{error}</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Walang pang posts. Maging una sa pag-post!</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} onReactUpdated={fetchTrendingPosts} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}