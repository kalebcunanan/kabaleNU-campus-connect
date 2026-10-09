import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import Button from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import FadeIn from '../../components/common/FadeIn';
import Input from '../../components/common/Input';
import Select, { type SelectOption } from '../../components/common/Select';
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

const SORT_OPTIONS: SelectOption[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'priceAsc', label: 'Price: Low to High' },
  { value: 'priceDesc', label: 'Price: High to Low' },
];

const CATEGORY_OPTIONS: SelectOption[] = MARKET_CATEGORIES.map((category) => ({ value: category, label: category }));

const STATUS_OPTIONS: SelectOption[] = ['Available', 'Reserved', 'Sold'].map((status) => ({ value: status, label: status }));

export default function MarketplacePage(): JSX.Element {
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
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
            <Input label="Search" type="text" name="q" value={filters.q} onChange={handleFilterChange} placeholder="Keywords..." />

            <Select label="Sort By" name="sort" value={filters.sort} onChange={handleFilterChange} options={SORT_OPTIONS} />

            <Select
              label="Category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              options={CATEGORY_OPTIONS}
              placeholder="All Categories"
            />

            <Select
              label="Status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              options={STATUS_OPTIONS}
              placeholder="All Status"
            />

            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                <Input label="Min ₱" type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} min="0" />
              </div>
              <div className="min-w-0 flex-1">
                <Input label="Max ₱" type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} min="0" />
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
            <ErrorState message={error} onRetry={() => void refetch()} />
          ) : items.length === 0 ? (
            <EmptyState message="No items match your criteria." />
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
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Create listing"
            className="relative max-h-full w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
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
