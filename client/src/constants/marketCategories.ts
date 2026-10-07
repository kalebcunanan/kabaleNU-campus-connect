export const MARKET_CATEGORIES = ['Electronics', 'Clothes', 'School Materials', 'Food', 'Home Items'] as const;

export type MarketCategory = (typeof MARKET_CATEGORIES)[number];