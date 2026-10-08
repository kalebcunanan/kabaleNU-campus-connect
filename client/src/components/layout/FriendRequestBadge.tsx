import { useFriendRequestCount } from '../../hooks/useFriendRequestCount';

const MAX_DISPLAYED_COUNT = 9;

// A red count badge for the Friends nav icon that stays hidden while no friend requests are pending.
export default function FriendRequestBadge() {
  const count = useFriendRequestCount();

  if (count === 0) return null;

  const label: string = count > MAX_DISPLAYED_COUNT ? `${MAX_DISPLAYED_COUNT}+` : String(count);

  return (
    <span
      role="status"
      aria-label={`${count} pending friend ${count === 1 ? 'request' : 'requests'}`}
      className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-nu-blue"
    >
      {label}
    </span>
  );
}
