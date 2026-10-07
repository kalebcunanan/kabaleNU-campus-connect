import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ChannelChat from '../../components/features/ChannelChat';
import { Avatar } from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ErrorState } from '../../components/common/ErrorState';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import { useAxiosFetch } from '../../hooks/useAxiosFetch';
import { useToast } from '../../hooks/useToast';
import api, { getErrorMessage } from '../../lib/axios';
import { formatMemberCount, getCreatorName, isChannelCreator } from '../../lib/channelUtils';
import type { Channel } from '../../types/channel';

type PendingAction = 'leave' | 'delete';

const CONFIRM_COPY: Record<PendingAction, { title: string; message: string }> = {
  leave: {
    title: 'Leave channel',
    message: 'You will no longer see messages in this channel. You can join again later.',
  },
  delete: {
    title: 'Delete channel',
    message: 'This permanently deletes the channel and all of its messages for everyone.',
  },
};

export default function ChannelRoomPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data: channel, loading, error, refetch } = useAxiosFetch<Channel>(`/channels/${id}`);

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleJoin = async (): Promise<void> => {
    setIsJoining(true);
    setActionError(null);
    try {
      await api.post(`/channels/${id}/join`);
      showToast('You joined the channel');
      await refetch();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setIsJoining(false);
    }
  };

  const handleConfirm = async (): Promise<void> => {
    const action = pendingAction;
    setPendingAction(null);
    setActionError(null);
    try {
      if (action === 'delete') {
        await api.delete(`/channels/${id}`);
        showToast('Channel deleted');
        navigate('/channels');
      } else if (action === 'leave') {
        await api.post(`/channels/${id}/leave`);
        showToast('You left the channel');
        navigate('/channels');
      }
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  if (loading && !channel) return <Loader label="Loading channel..." />;

  if (!channel) {
    return (
      <div className="mx-auto max-w-4xl">
        <Link to="/channels" className="text-sm font-bold text-gray-500 hover:text-nu-blue">Back to Channels</Link>
        <ErrorState message={error ?? 'Channel not found'} onRetry={refetch} />
      </div>
    );
  }

  const creatorName = getCreatorName(channel);
  const isCreator = isChannelCreator(channel, user?._id);
  const confirmCopy = pendingAction ? CONFIRM_COPY[pendingAction] : null;

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] max-w-4xl flex-col">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b-2 border-nu-gold pb-4">
        <div className="min-w-0">
          <Link to="/channels" className="text-sm font-bold text-gray-500 hover:text-nu-blue">Back to Channels</Link>
          <h1 className="mt-2 break-words text-2xl font-bold text-nu-blue"># {channel.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <Avatar src={channel.createdBy?.profilePicture} name={creatorName} className="h-5 w-5" />
              <span>Created by {creatorName}</span>
            </span>
            <span className="font-semibold">{formatMemberCount(channel.memberCount)}</span>
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          {channel.isMember && !isCreator && (
            <Button variant="outline" size="sm" onClick={() => setPendingAction('leave')}>Leave channel</Button>
          )}
          {isCreator && (
            <button
              type="button"
              onClick={() => setPendingAction('delete')}
              className="rounded-lg border-2 border-red-500 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-nu-gold"
            >
              Delete channel
            </button>
          )}
        </div>
      </div>

      {actionError && <p role="alert" className="mb-3 text-sm font-medium text-red-500">{actionError}</p>}

      {channel.isMember ? (
        <ChannelChat channelId={channel._id} />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-bold text-nu-blue">Join this channel to start chatting</h2>
          {channel.description && <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">{channel.description}</p>}
          <Button onClick={handleJoin} isLoading={isJoining} className="mt-5">Join channel</Button>
        </div>
      )}

      {confirmCopy && (
        <ConfirmDialog
          isOpen
          title={confirmCopy.title}
          message={confirmCopy.message}
          onConfirm={handleConfirm}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}
