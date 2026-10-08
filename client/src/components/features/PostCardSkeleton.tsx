import React from 'react';

const BAR_CLASS = 'rounded bg-gray-200';

const PostCardSkeleton: React.FC = () => (
  <div className="animate-pulse rounded-2xl border-2 border-nu-blue/30 bg-white p-5 shadow-sm motion-reduce:animate-none">
    <div className="mb-3 flex gap-3">
      <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
      <div className="flex flex-1 flex-col justify-center gap-2">
        <div className={`${BAR_CLASS} h-3.5 w-1/3`} />
        <div className={`${BAR_CLASS} h-3 w-1/4`} />
      </div>
    </div>

    <div className="mb-4 space-y-2">
      <div className={`${BAR_CLASS} h-3.5 w-full`} />
      <div className={`${BAR_CLASS} h-3.5 w-11/12`} />
      <div className={`${BAR_CLASS} h-3.5 w-2/3`} />
    </div>

    <div className="flex items-center gap-6 border-t border-nu-blue/20 pt-4">
      <div className={`${BAR_CLASS} h-6 w-12`} />
      <div className={`${BAR_CLASS} h-6 w-12`} />
    </div>
  </div>
);

export default PostCardSkeleton;
