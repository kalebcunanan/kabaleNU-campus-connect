import React from 'react';

// Placeholder that mirrors features/MarketItemCard while the search results load.
const MarketItemSkeleton: React.FC = () => (
  <div
    aria-hidden="true"
    className="flex h-full animate-pulse flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm motion-reduce:animate-none"
  >
    <div className="h-48 w-full bg-gray-200" />
    <div className="flex flex-1 flex-col gap-2 p-5">
      <div className="h-5 w-3/4 rounded bg-gray-200" />
      <div className="h-6 w-1/3 rounded bg-gray-200" />
    </div>
    <div className="space-y-3 border-t border-gray-100 bg-gray-50 px-5 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gray-200" />
          <div className="h-3 w-20 rounded bg-gray-200" />
        </div>
        <div className="h-7 w-16 rounded-md bg-gray-200" />
      </div>
      <div className="h-8 w-full rounded-lg bg-gray-200" />
    </div>
  </div>
);

export default MarketItemSkeleton;
