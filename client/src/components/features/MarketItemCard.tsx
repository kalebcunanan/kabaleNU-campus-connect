import React, { useState } from 'react';
import api, { getErrorMessage } from '../../lib/axios';
import { canManage } from '../../lib/permissions';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import { useToast } from '../../hooks/useToast';
import { Avatar } from '../common/Avatar';
import { ConfirmDialog } from '../common/ConfirmDialog';
import Button from '../common/Button';
import type { MarketItem, MarketStatus } from '../../types/market';

interface MarketItemCardProps {
  item: MarketItem;
  averagePrice: number;
  onUpdate: () => void;
}

const STATUS_STYLES: Record<MarketStatus, string> = {
  Available: 'bg-green-100 text-green-700',
  Reserved: 'bg-yellow-100 text-yellow-700',
  Sold: 'bg-red-100 text-red-700',
};

// Mirrors the transition rules enforced by updateItemStatus on the server.
const NEXT_STATUSES: Record<MarketStatus, MarketStatus[]> = {
  Available: ['Reserved', 'Sold'],
  Reserved: ['Available', 'Sold'],
  Sold: [],
};

export const MarketItemCard: React.FC<MarketItemCardProps> = ({ item, averagePrice, onUpdate }) => {
  const { user } = useAuth();
  const { startChat } = useChat();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = user?._id === item.seller._id;
  const isGoodDeal = item.price < averagePrice && averagePrice > 0;
  const canDelete = canManage(user, item.seller._id);
  const canMessage = !isOwner && item.status !== 'Sold';

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      setLoading(true);
      setError(null);
      await api.put(`/market/${item._id}/status`, { status: e.target.value });
      showToast(`Item marked as ${e.target.value}`);
      onUpdate();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async () => {
    setIsMessaging(true);
    try {
      await startChat(item._id);
    } finally {
      setIsMessaging(false);
    }
  };

  const handleDelete = async () => {
    setIsConfirmOpen(false);
    try {
      setError(null);
      await api.delete(`/market/${item._id}`);
      showToast('Item deleted');
      onUpdate();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-48 w-full bg-gray-100">
        {item.image ? (
          <img src={item.image} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">No Image</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md">
          {item.category}
        </span>
        {isGoodDeal && (
          <span className="absolute bottom-3 right-3 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800 shadow-sm">
            🔥 Good Deal
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-5">
        <h3 className="line-clamp-2 text-lg font-bold text-nu-blue">{item.title}</h3>
        <p className="text-xl font-black text-nu-gold">₱{item.price.toFixed(2)}</p>
        {error && <p className="mt-2 rounded bg-red-50 p-2 text-xs text-red-500">{error}</p>}
      </div>

      <div className="space-y-3 border-t border-gray-100 bg-gray-50 px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 text-sm text-gray-500">
            <Avatar src={item.seller.profilePicture} name={item.seller.name} className="h-6 w-6" />
            <span className="truncate">{item.seller.name}</span>
          </div>

          {isOwner && item.status !== 'Sold' ? (
            <select
              value={item.status}
              onChange={handleStatusChange}
              disabled={loading}
              aria-label="Update item status"
              className="shrink-0 rounded-md border border-gray-300 bg-white p-1 text-sm font-medium outline-none focus:border-nu-blue"
            >
              <option value={item.status} disabled>{item.status}</option>
              {NEXT_STATUSES[item.status].map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          ) : (
            <span className={`shrink-0 rounded-md px-3 py-1 text-sm font-bold ${STATUS_STYLES[item.status]}`}>
              {item.status}
            </span>
          )}
        </div>

        {(canMessage || canDelete) && (
          <div className="flex gap-2">
            {canMessage && (
              <Button size="sm" onClick={handleMessage} isLoading={isMessaging} className="flex-1">
                Message Seller
              </Button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                className="flex-1 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete item"
        message={`Delete "${item.title}"? Its photo and any conversations about it will be removed.`}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
