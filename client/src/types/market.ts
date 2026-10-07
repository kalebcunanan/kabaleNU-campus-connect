import type { MarketCategory } from '../constants/marketCategories';

export type MarketStatus = 'Available' | 'Reserved' | 'Sold';

export interface MarketSeller {
  _id: string;
  name: string;
  profilePicture?: string;
}

export interface MarketItem {
  _id: string;
  seller: MarketSeller;
  title: string;
  price: number;
  category: MarketCategory;
  image?: string;
  status: MarketStatus;
  createdAt: string;
}

export interface MarketFilters {
  q: string;
  category: string;
  status: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
}

export interface MarketSearchResponse {
  count: number;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  items: MarketItem[];
}
