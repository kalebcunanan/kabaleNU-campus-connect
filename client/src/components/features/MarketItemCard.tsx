import React, { useState } from 'react';
import api, { getErrorMessage } from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';

interface MarketItemCardProps {
  item: any;
  averagePrice: number;
  onUpdate: () => void;
}

export const MarketItemCard: React.FC<MarketItemCardProps> = ({ item, averagePrice, onUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = user?._id === (item.seller?._id || item.seller);
  const isGoodDeal = item.price < averagePrice && averagePrice > 0;

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      setLoading(true);
      setError(null);
      await api.put(`/market/${item._id}/status`, { status: e.target.value });
      onUpdate();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div>
        <div className="mb-2 flex items-start justify-between">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
            {item.category}
          </span>
          {isGoodDeal && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
              🔥 Good Deal
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-nu-blue">{item.title}</h3>
        <p className="text-2xl font-black text-nu-gold">₱{item.price.toFixed(2)}</p>
        <p className="mt-2 text-sm text-gray-500">Seller: {item.seller?.name || 'Unknown'}</p>
        
        {error && <p className="mt-2 rounded bg-red-50 p-2 text-xs text-red-500">{error}</p>}
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4">
        {isOwner ? (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Update Status:</span>
            {item.status === 'Sold' ? (
              <span className="px-2 py-1 bg-gray-200 rounded text-sm text-gray-600 font-bold">Sold</span>
            ) : (
              <select
                value={item.status}
                onChange={handleStatusChange}
                disabled={loading}
                className="rounded-md border border-gray-300 bg-white p-1 text-sm outline-none focus:border-nu-blue"
              >
                <option value={item.status} disabled>{item.status}</option>
                {item.status === 'Available' && <option value="Reserved">Reserved</option>}
                {item.status === 'Reserved' && (
                  <>
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                  </>
                )}
              </select>
            )}
          </div>
        ) : (
          <span className={`block w-full rounded-md py-2 text-center text-sm font-bold ${
            item.status === 'Available' ? 'bg-green-50 text-green-700' :
            item.status === 'Reserved' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
          }`}>
            {item.status}
          </span>
        )}
      </div>
    </div>
  );
};