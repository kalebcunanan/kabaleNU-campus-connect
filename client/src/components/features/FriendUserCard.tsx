import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { formatUserSubtitle } from '../../lib/friends';
import type { FriendUser } from '../../types/friend';

interface FriendUserCardProps {
  user: FriendUser;
  children?: ReactNode;
}

// A row with the user's avatar and name linking to their public profile, plus optional action buttons.
export default function FriendUserCard({ user, children }: FriendUserCardProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-nu-blue/30 bg-white p-4 shadow-sm">
      <Link to={`/profile/${user._id}`} className="flex min-w-[10rem] flex-1 items-center gap-3">
        <Avatar src={user.profilePicture} name={user.name} className="h-12 w-12" />
        <span className="min-w-0">
          <span className="block truncate font-bold text-nu-blue hover:underline">{user.name}</span>
          <span className="block truncate text-xs capitalize text-gray-500">{formatUserSubtitle(user)}</span>
        </span>
      </Link>
      {children && <div className="flex shrink-0 gap-2">{children}</div>}
    </div>
  );
}
