import FadeIn from '../common/FadeIn';
import Loader from '../common/Loader';
import Button from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';
import FriendActionButton from './FriendActionButton';
import FriendUserCard from './FriendUserCard';
import { useAxiosFetch } from '../../hooks/useAxiosFetch';
import { useChat } from '../../hooks/useChat';
import type { FriendListItem } from '../../types/friend';

export default function FriendList() {
  const { startDirectChat } = useChat();
  const { data, loading, error, refetch } = useAxiosFetch<FriendListItem[]>('/friends');
  const friends = data ?? [];

  const handleChanged = (): void => {
    void refetch();
  };

  if (loading) return <Loader label="Loading friends..." />;
  if (error && friends.length === 0) return <ErrorState message={error} onRetry={handleChanged} />;
  if (friends.length === 0) return <EmptyState message="You have no friends yet. Use Search to find students." hideIcon />;

  return (
    <ul className="space-y-3">
      {friends.map((friend, index) => (
        <li key={friend._id}>
          <FadeIn index={index}>
            <FriendUserCard user={friend}>
              <Button size="sm" onClick={() => void startDirectChat(friend._id)}>
                Message
              </Button>
              <FriendActionButton
                userId={friend._id}
                status="friends"
                friendshipId={friend.friendshipId}
                onChanged={handleChanged}
              />
            </FriendUserCard>
          </FadeIn>
        </li>
      ))}
    </ul>
  );
}
