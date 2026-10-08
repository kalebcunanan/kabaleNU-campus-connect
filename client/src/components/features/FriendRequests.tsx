import FadeIn from '../common/FadeIn';
import Loader from '../common/Loader';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';
import FriendActionButton from './FriendActionButton';
import FriendUserCard from './FriendUserCard';
import { useAxiosFetch } from '../../hooks/useAxiosFetch';
import type { FriendRequest } from '../../types/friend';

export default function FriendRequests() {
  const { data, loading, error, refetch } = useAxiosFetch<FriendRequest[]>('/friends/requests');
  const requests = data ?? [];

  const handleChanged = (): void => {
    void refetch();
  };

  if (loading) return <Loader label="Loading requests..." />;
  if (error && requests.length === 0) return <ErrorState message={error} onRetry={handleChanged} />;
  if (requests.length === 0) return <EmptyState message="No friend requests right now." hideIcon />;

  return (
    <ul className="space-y-3">
      {requests.map((request, index) => (
        <li key={request._id}>
          <FadeIn index={index}>
            <FriendUserCard user={request.user}>
              <FriendActionButton
                userId={request.user._id}
                status="pending_received"
                friendshipId={request._id}
                onChanged={handleChanged}
              />
            </FriendUserCard>
          </FadeIn>
        </li>
      ))}
    </ul>
  );
}
