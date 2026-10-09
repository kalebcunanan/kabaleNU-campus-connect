import { useState } from 'react';
import Button from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useFriendActions } from '../../hooks/useFriendActions';
import type { FriendStatus } from '../../types/friend';

interface FriendActionButtonProps {
  userId: string;
  status: FriendStatus;
  friendshipId: string | null;
  onChanged: () => void;
}

// Shows the friend action that matches the current relationship with another user.
export default function FriendActionButton({ userId, status, friendshipId, onChanged }: FriendActionButtonProps) {
  const { isBusy, sendRequest, acceptRequest, removeRequest, removeFriend } = useFriendActions(onChanged);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  const requestId = friendshipId ?? '';

  const handleUnfriend = async (): Promise<void> => {
    setIsConfirmOpen(false);
    await removeFriend(userId);
  };

  if (status === 'self') return null;

  if (status === 'none') {
    return (
      <Button variant="gold" size="sm" isLoading={isBusy} onClick={() => void sendRequest(userId)}>
        Add Friend
      </Button>
    );
  }

  if (status === 'pending_sent') {
    return (
      <Button
        variant="outline"
        size="sm"
        isLoading={isBusy}
        onClick={() => void removeRequest(requestId, 'Friend request cancelled')}
      >
        Cancel Request
      </Button>
    );
  }

  if (status === 'pending_received') {
    return (
      <>
        <Button variant="gold" size="sm" isLoading={isBusy} onClick={() => void acceptRequest(requestId)}>
          Accept
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isBusy}
          onClick={() => void removeRequest(requestId, 'Friend request declined')}
        >
          Decline
        </Button>
      </>
    );
  }

  return (
    <>
      <Button variant="outline" size="sm" isLoading={isBusy} onClick={() => setIsConfirmOpen(true)}>
        Unfriend
      </Button>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Unfriend"
        message="Are you sure you want to remove this friend? You will no longer be able to see each other's posts or send messages."
        onConfirm={() => void handleUnfriend()}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
