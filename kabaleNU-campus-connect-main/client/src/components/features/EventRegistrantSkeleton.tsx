import React from 'react';

const ROW_IDS = ['r1', 'r2', 'r3'] as const;

// Placeholder that mirrors features/EventRegistrantList while the registrants load.
const EventRegistrantSkeleton: React.FC = () => (
  <ul
    aria-hidden="true"
    className="animate-pulse divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white motion-reduce:animate-none"
  >
    {ROW_IDS.map((id) => (
      <li key={id} className="flex items-center gap-3 px-4 py-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-1/3 rounded bg-gray-200" />
          <div className="h-3 w-1/2 rounded bg-gray-200" />
        </div>
        <div className="h-3 w-12 shrink-0 rounded bg-gray-200" />
      </li>
    ))}
  </ul>
);

export default EventRegistrantSkeleton;
