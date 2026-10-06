import { useCallback, useEffect, useState } from 'react';
import Loader from '../../components/common/Loader';
import api, { getErrorMessage } from '../../lib/axios';
import { MarketItemCard } from '../../components/features/MarketItemCard';
import { ItemForm } from '../../components/features/ItemForm';

export default function MarketplacePage() {
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState({ count: 0, averagePrice: 0, lowestPrice: 0, highestPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search Filters State
  const [filters, setFilters] = useState({
    q: '',
    category: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest'
  });

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (filters.q) queryParams.append('q', filters.q);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.sort) queryParams.append('sort', filters.sort);

      const response = await api.get(`/market/search?${queryParams.toString()}`);
      setItems(response.data.items);
      setStats({
        count: response.data.count,
        averagePrice: response.data.averagePrice,
        lowestPrice: response.data.lowestPrice,
        highestPrice: response.data.highestPrice
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-col justify-between border-b-2 border-nu-gold pb-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold text-nu-blue">Marketplace</h1>
          <p className="text-gray-600">Buy and sell pre-loved campus essentials.</p>
        </div>
        {stats.count > 0 && (
          <div className="mt-4 flex gap-4 text-sm font-medium text-gray-600 md:mt-0">
            <span>Items: {stats.count}</span>
            <span>Avg Price: ₱{stats.averagePrice.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Sidebar Filters */}
        <div className="h-fit rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-bold text-nu-blue">Filters</h3>
          
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Search</label>
              <input type="text" name="q" value={filters.q} onChange={handleFilterChange} placeholder="Keywords..." className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-nu-blue focus:outline-none focus:ring-1 focus:ring-nu-blue" />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select name="category" value={filters.category} onChange={handleFilterChange} className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-nu-blue focus:outline-none focus:ring-1 focus:ring-nu-blue">
                <option value="">All Categories</option>
                <option value="Books">Books</option>
                <option value="Uniforms">Uniforms</option>
                <option value="Electronics">Electronics</option>
                <option value="Others">Others</option>
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
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Min ₱</label>
                <input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-nu-blue focus:outline-none focus:ring-1 focus:ring-nu-blue" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Max ₱</label>
                <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-nu-blue focus:outline-none focus:ring-1 focus:ring-nu-blue" />
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="md:col-span-3">
          <ItemForm onItemCreated={fetchItems} />
          
          {loading ? (
            <Loader label="Searching marketplace..." />
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-6 text-center font-medium text-red-500">{error}</div>
          ) : items.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center text-gray-500">
              No items match your criteria.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <MarketItemCard 
                  key={item._id} 
                  item={item} 
                  averagePrice={stats.averagePrice}
                  onUpdate={fetchItems} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}