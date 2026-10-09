import React from 'react';

interface SkeletonRow {
  id: string;
  isMine: boolean;
  width: string;
}

const ROWS: SkeletonRow[] = [
  { id: 'm1', isMine: false, width: 'w-48' },
  { id: 'm2', isMine: false, width: 'w-32' },
  { id: 'm3', isMine: true, width: 'w-40' },
  { id: 'm4', isMine: false, width: 'w-56' },
  { id: 'm5', isMine: true, width: 'w-28' },
  { id: 'm6', isMine: true, width: 'w-52' },
];

// Placeholder bubbles that mirror features/ChannelMessageBubble while the first messages load.
const ChannelMessageSkeleton: React.FC = () => (
  <div aria-hidden="true" className="animate-pulse space-y-3 motion-reduce:animate-none">
    {ROWS.map((row) => (
      <div key={row.id} className={`flex items-end gap-2 ${row.isMine ? 'justify-end' : 'justify-start'}`}>
        {!row.isMine && <div className="h-7 w-7 shrink-0 rounded-full bg-gray-200" />}
        <div className={`h-8 max-w-[75%] rounded-2xl ${row.width} ${row.isMine ? 'bg-nu-blue/20' : 'bg-gray-200'}`} />
      </div>
    ))}
  </div>
);

export default ChannelMessageSkeleton;
