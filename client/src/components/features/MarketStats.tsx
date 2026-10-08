import React from 'react';
import FadeIn from '../common/FadeIn';

interface MarketStatsProps {
  count: number;
  averagePrice: number;
}

interface StatTileProps {
  label: string;
  value: string;
}

const StatTile: React.FC<StatTileProps> = ({ label, value }) => (
  <div className="rounded-xl border border-gray-200 border-l-4 border-l-nu-gold bg-white px-4 py-2 shadow-sm">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    <p className="text-lg font-black leading-tight text-nu-blue">{value}</p>
  </div>
);

// Shows the result count and the average price as two small stat tiles.
const MarketStats: React.FC<MarketStatsProps> = ({ count, averagePrice }) => (
  <div className="flex gap-3">
    <FadeIn index={0}>
      <StatTile label="Items" value={String(count)} />
    </FadeIn>
    <FadeIn index={1}>
      <StatTile label="Avg Price" value={`₱${averagePrice.toFixed(2)}`} />
    </FadeIn>
  </div>
);

export default MarketStats;
