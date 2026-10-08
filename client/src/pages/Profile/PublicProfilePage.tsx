import { Navigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { Avatar } from '../../components/common/Avatar';
import { ErrorState } from '../../components/common/ErrorState';
import FriendActionButton from '../../components/features/FriendActionButton';
import MyPosts from '../../components/features/MyPosts';
import { useAuth } from '../../hooks/useAuth';
import { useAxiosFetch } from '../../hooks/useAxiosFetch';
import { useChat } from '../../hooks/useChat';
import { formatUserSubtitle } from '../../lib/friends';
import type { FriendRelation, PublicProfile } from '../../types/friend';

const AVATAR_CLASS = 'h-36 w-36 shadow-md ring-4 ring-white';

export default function PublicProfilePage() {
  const { id = '' } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { startDirectChat } = useChat();

  const profileFetch = useAxiosFetch<PublicProfile>(`/users/${id}`);
  const relationFetch = useAxiosFetch<FriendRelation>(`/friends/status/${id}`);

  // Your own public profile is the editable profile page.
  if (user && user._id === id) return <Navigate to="/profile" replace />;

  const profile = profileFetch.data;
  const relation = relationFetch.data;

  if (profileFetch.loading || relationFetch.loading) return <Loader label="Loading profile..." />;

  const loadError = profileFetch.error ?? relationFetch.error;
  if (loadError || !profile || !relation) {
    return (
      <ErrorState
        message={loadError ?? 'Profile not found'}
        onRetry={() => {
          void profileFetch.refetch();
          void relationFetch.refetch();
        }}
      />
    );
  }

  const isFriend = relation.friendStatus === 'friends';
  const firstName = profile.name.split(' ')[0];

  return (
    <div className="mx-auto max-w-2xl pt-20">
      <section className="relative animate-rise-in rounded-2xl border-t-4 border-nu-gold bg-white px-6 pb-8 pt-24 text-center shadow-lg motion-reduce:animate-none">
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Avatar src={profile.profilePicture} name={profile.name} className={AVATAR_CLASS} />
        </div>

        <h1 className="break-words text-3xl font-bold text-nu-blue">{profile.name}</h1>
        <p className="mt-1 capitalize text-gray-600">{formatUserSubtitle(profile)}</p>

        {isFriend && (
          <div className="mt-6">
            <p className="text-sm text-gray-500">Total Bulldog Score</p>
            <p className="text-3xl font-extrabold text-nu-gold">{profile.bulldogScore} pts</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <FriendActionButton
            userId={profile._id}
            status={relation.friendStatus}
            friendshipId={relation.friendshipId}
            onChanged={() => void relationFetch.refetch()}
          />
          {isFriend && (
            <Button size="sm" onClick={() => void startDirectChat(profile._id)}>
              Message
            </Button>
          )}
        </div>
      </section>

      {isFriend ? (
        <section aria-labelledby="friend-posts-heading">
          <div className="my-8 flex items-center gap-4">
            <span aria-hidden="true" className="h-px flex-1 bg-gray-300" />
            <h2 id="friend-posts-heading" className="text-lg font-bold text-nu-blue">
              Posts
            </h2>
            <span aria-hidden="true" className="h-px flex-1 bg-gray-300" />
          </div>
          <MyPosts userId={profile._id} emptyMessage={`${firstName} has not posted yet.`} />
        </section>
      ) : (
        <p className="mt-8 text-center text-gray-500">
          This profile is private. Add {firstName} as a friend to see their posts and send messages.
        </p>
      )}
    </div>
  );
}
