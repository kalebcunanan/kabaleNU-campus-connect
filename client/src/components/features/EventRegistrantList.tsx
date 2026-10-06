import React from 'react';
import { Avatar } from '../common/Avatar';
import { EmptyState } from '../common/EmptyState';
import { formatRelativeTime } from '../../lib/formatRelativeTime';
import type { EventRegistrant } from '../../types/event';

interface EventRegistrantListProps {
  registrants: EventRegistrant[];
}

export const EventRegistrantList: React.FC<EventRegistrantListProps> = ({ registrants }) => {
  if (registrants.length === 0) return <EmptyState message="No one has registered yet." />;

  return (
    <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
      {registrants.map((registrant) => (
        <li key={registrant._id} className="flex items-center gap-3 px-4 py-3">
          <Avatar src={registrant.user.profilePicture} name={registrant.user.name} className="h-10 w-10" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-nu-blue">{registrant.user.name}</p>
            <p className="truncate text-xs text-gray-500">
              {registrant.user.program ? `${registrant.user.program}, ` : ''}
              {registrant.user.email}
            </p>
          </div>
          <span className="shrink-0 text-xs text-gray-500">{formatRelativeTime(registrant.createdAt)}</span>
        </li>
      ))}
    </ul>
  );
};
