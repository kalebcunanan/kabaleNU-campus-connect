import React from 'react';

const ROW_IDS = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'] as const;

// Placeholder that mirrors the ranked rows of pages/Leaderboard/LeaderboardPage while the scores load.
const LeaderboardSkeleton: React.FC = () => (
  <div
    aria-hidden="true"
    className="animate-pulse divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm motion-reduce:animate-none"
  >
    {ROW_IDS.map((id) => (
      <div key={id} className="flex items-center justify-between p-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200" />
          <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-3 w-20 rounded bg-gray-200" />
          </div>
        </div>
        <div className="h-6 w-14 shrink-0 rounded bg-gray-200" />
      </div>
    ))}
  </div>
);

export default LeaderboardSkeleton;
