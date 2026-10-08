import React from 'react';
import type { FeedSort } from '../../types/feed';

interface FeedSortTabsProps {
  value: FeedSort;
  onChange: (sort: FeedSort) => void;
}

interface FeedSortOption {
  value: FeedSort;
  label: string;
}

const OPTIONS: FeedSortOption[] = [
  { value: 'recent', label: 'Recent' },
  { value: 'trending', label: 'Trending' },
];

const FeedSortTabs: React.FC<FeedSortTabsProps> = ({ value, onChange }) => (
  <div role="group" aria-label="Sort feed" className="inline-flex rounded-lg border-2 border-nu-blue bg-white p-0.5">
    {OPTIONS.map((option) => {
      const isActive = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          aria-pressed={isActive}
          onClick={() => onChange(option.value)}
          className={`rounded-md px-3 py-1 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-nu-gold ${
            isActive ? 'bg-nu-blue text-white' : 'text-nu-blue hover:bg-nu-blue/10'
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default FeedSortTabs;
