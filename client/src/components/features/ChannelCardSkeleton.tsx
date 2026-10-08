import React from 'react';

// Placeholder that mirrors features/ChannelCard while the channel list loads.
const ChannelCardSkeleton: React.FC = () => (
  <div
    aria-hidden="true"
    className="flex h-full animate-pulse flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm motion-reduce:animate-none"
  >
    <div className="mb-2 flex items-center justify-between gap-2">
      <div className="h-6 w-16 rounded-full bg-gray-200" />
      <div className="h-6 w-14 rounded-full bg-gray-200" />
    </div>
    <div className="h-6 w-3/4 rounded bg-gray-200" />
    <div className="mt-3 space-y-2">
      <div className="h-3 w-full rounded bg-gray-200" />
      <div className="h-3 w-2/3 rounded bg-gray-200" />
    </div>
    <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded-full bg-gray-200" />
        <div className="h-3 w-24 rounded bg-gray-200" />
      </div>
      <div className="h-3 w-16 rounded bg-gray-200" />
    </div>
  </div>
);

export default ChannelCardSkeleton;
