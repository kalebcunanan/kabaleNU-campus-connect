import React from 'react';

// Placeholder that mirrors features/EventCard while the events list loads.
const EventCardSkeleton: React.FC = () => (
  <article
    aria-hidden="true"
    className="flex h-full animate-pulse flex-col overflow-hidden rounded-2xl border-2 border-nu-blue/30 bg-white shadow-sm motion-reduce:animate-none"
  >
    <div className="aspect-video bg-gray-200" />
    <div className="flex flex-1 flex-col items-center p-5">
      <div className="h-4 w-2/3 rounded bg-gray-200" />
      <div className="mt-3 h-7 w-4/5 rounded bg-gray-200" />
      <div className="my-3 h-0.5 w-4/5 bg-gray-200" />
      <div className="w-full space-y-2">
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="h-3 w-3/4 rounded bg-gray-200" />
      </div>
      <div className="mt-auto w-full pt-5">
        <div className="h-10 w-full rounded-full bg-gray-200" />
        <div className="mx-auto mt-2 h-3 w-1/3 rounded bg-gray-200" />
      </div>
    </div>
  </article>
);

export default EventCardSkeleton;
