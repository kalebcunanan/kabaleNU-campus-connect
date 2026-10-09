import React from 'react';
import EventRegistrantSkeleton from './EventRegistrantSkeleton';

const STAT_IDS = ['s1', 's2', 's3'] as const;

// Placeholder that mirrors pages/Events/EventDetailPage while the event loads.
const EventDetailSkeleton: React.FC = () => (
  <div role="status" aria-label="Loading event" className="mx-auto max-w-3xl space-y-6">
    <div aria-hidden="true" className="h-4 w-28 animate-pulse rounded bg-gray-200 motion-reduce:animate-none" />

    <section
      aria-hidden="true"
      className="animate-pulse overflow-hidden rounded-2xl border-2 border-nu-blue/30 bg-white shadow-sm motion-reduce:animate-none"
    >
      <div className="aspect-video bg-gray-200" />
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="h-5 w-20 rounded-full bg-gray-200" />
          <div className="h-7 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />
          <div className="h-3 w-1/3 rounded bg-gray-200" />
        </div>
        <div className="h-0.5 w-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-2/3 rounded bg-gray-200" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {STAT_IDS.map((id) => (
            <div key={id} className="h-16 rounded-xl bg-gray-100" />
          ))}
        </div>
        <div className="h-2 rounded-full bg-gray-200" />
      </div>
    </section>

    <div aria-hidden="true" className="h-6 w-56 animate-pulse rounded bg-gray-200 motion-reduce:animate-none" />
    <EventRegistrantSkeleton />
  </div>
);

export default EventDetailSkeleton;
