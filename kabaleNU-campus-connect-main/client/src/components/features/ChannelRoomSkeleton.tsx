import React from 'react';
import ChannelMessageSkeleton from './ChannelMessageSkeleton';

// Placeholder that mirrors pages/Channels/ChannelRoomPage while the channel loads.
const ChannelRoomSkeleton: React.FC = () => (
  <div role="status" aria-label="Loading channel" className="mx-auto flex h-[calc(100dvh-8rem)] max-w-4xl flex-col">
    <div aria-hidden="true" className="mb-4 animate-pulse space-y-2 border-b-2 border-nu-gold pb-4 motion-reduce:animate-none">
      <div className="h-4 w-32 rounded bg-gray-200" />
      <div className="h-7 w-1/2 rounded bg-gray-200" />
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 rounded-full bg-gray-200" />
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="h-4 w-20 rounded bg-gray-200" />
      </div>
    </div>

    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white px-4 pb-4 pt-8 shadow-sm">
        <ChannelMessageSkeleton />
      </div>
      <div aria-hidden="true" className="mt-3 flex animate-pulse gap-2 motion-reduce:animate-none">
        <div className="h-11 flex-1 rounded-full bg-gray-200" />
        <div className="h-11 w-24 rounded-lg bg-gray-200" />
      </div>
    </div>
  </div>
);

export default ChannelRoomSkeleton;
