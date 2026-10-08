import { useEffect, useMemo, useState } from 'react';
import Button from '../../components/common/Button';
import FadeIn from '../../components/common/FadeIn';
import { MarketItemCard } from '../../components/features/MarketItemCard';
import MarketItemSkeleton from '../../components/features/MarketItemSkeleton';
import MarketStats from '../../components/features/MarketStats';
import { ItemForm } from '../../components/features/ItemForm';
import { MARKET_CATEGORIES } from '../../constants/marketCategories';
import { useAxiosFetch } from '../../hooks/useAxiosFetch';
import type { MarketFilters, MarketSearchResponse } from '../../types/market';

const INITIAL_FILTERS: MarketFilters = {
  q: '',
  category: '',
  status: '',
  minPrice: '',
  maxPrice: '',
  sort: 'newest'
};

const SKELETON_IDS = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;

export default function MarketplacePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<MarketFilters>(INITIAL_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState<MarketFilters>(INITIAL_FILTERS);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilters(filters), 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const searchUrl = useMemo(() => {
    const queryParams = new URLSearchParams();
    Object.entries(debouncedFilters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    return `/market/search?${queryParams.toString()}`;
  }, [debouncedFilters]);

  const { data, loading, error, refetch } = useAxiosFetch<MarketSearchResponse>(searchUrl);

  const items = data?.items ?? [];
  const count = data?.count ?? 0;
  const averagePrice = data?.averagePrice ?? 0;

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 relative">
      <div className="mb-6 flex flex-col justify-between border-b-2 border-nu-gold pb-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold text-nu-blue">Marketplace</h1>
          <p className="text-gray-600">Buy and sell pre-loved campus essentials.</p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 md:mt-0 md:gap-4">
          {count > 0 && <MarketStats count={count} averagePrice={averagePrice} />}
          <Button onClick={() => setIsModalOpen(true)} className="whitespace-nowrap px-6">
            + Sell an Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="h-fit rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-bold text-nu-blue">Filters</h3>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Search</label>
              <input type="text" name="q" value={filters.q} onChange={handleFilterChange} placeholder="Keywords..." className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-nu-blue focus:outline-none focus:ring-1 focus:ring-nu-blue" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Sort By</label>
              <select name="sort" value={filters.sort} onChange={handleFilterChange} className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-nu-blue focus:outline-none focus:ring-1 focus:ring-nu-blue">
                <option value="newest">Newest First</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select name="category" value={filters.category} onChange={handleFilterChange} className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-nu-blue focus:outline-none focus:ring-1 focus:ring-nu-blue">
                <option value="">All Categories</option>
                {MARKET_CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
              <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-nu-blue focus:outline-none focus:ring-1 focus:ring-nu-blue">
                <option value="">All Status</option>
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Sold">Sold</option>
              </select>
            </div>

            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Min ₱</label>
                <input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} min="0" className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-nu-blue focus:outline-none focus:ring-1 focus:ring-nu-blue" />
              </div>
              <div className="min-w-0 flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Max ₱</label>
                <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} min="0" className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-nu-blue focus:outline-none focus:ring-1 focus:ring-nu-blue" />
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          {loading ? (
            <div role="status" aria-label="Loading items" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {SKELETON_IDS.map((id) => (
                <MarketItemSkeleton key={id} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-6 text-center font-medium text-red-500">{error}</div>
          ) : items.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center text-gray-500">
              No items match your criteria.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, index) => (
                <FadeIn key={item._id} index={index}>
                  <MarketItemCard
                    item={item}
                    averagePrice={averagePrice}
                    onUpdate={refetch}
                  />
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
              <h2 className="text-xl font-bold text-nu-blue">Create Listing</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <ItemForm
                onItemCreated={() => {
                  setIsModalOpen(false);
                  void refetch();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
