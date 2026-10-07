import { Link } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { formatMemberCount, getCreatorName } from '../../lib/channelUtils';
import type { Channel } from '../../types/channel';

interface ChannelCardProps {
  channel: Channel;
}

export default function ChannelCard({ channel }: ChannelCardProps) {
  const creatorName = getCreatorName(channel);

  return (
    <Link
      to={`/channels/${channel._id}`}
      className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-nu-blue hover:shadow-md"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">{channel.category}</span>
        {channel.isMember && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">Joined</span>
        )}
      </div>
      <h3 className="break-words text-lg font-bold text-nu-blue"># {channel.name}</h3>
      {channel.description && <p className="mt-2 line-clamp-2 text-sm text-gray-600">{channel.description}</p>}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs text-gray-600">
        <span className="flex min-w-0 items-center gap-2">
          <Avatar src={channel.createdBy?.profilePicture} name={creatorName} className="h-5 w-5" />
          <span className="truncate">Created by {creatorName}</span>
        </span>
        <span className="shrink-0 font-semibold">{formatMemberCount(channel.memberCount)}</span>
      </div>
    </Link>
  );
}
