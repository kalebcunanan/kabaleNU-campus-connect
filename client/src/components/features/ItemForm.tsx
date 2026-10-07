import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { marketItemSchema, type MarketItemFormData } from '../../schemas/market';
import { MARKET_CATEGORIES } from '../../constants/marketCategories';
import api, { getErrorMessage } from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import Button from '../common/Button';

interface ItemFormProps {
  onItemCreated: () => void;
}

export const ItemForm: React.FC<ItemFormProps> = ({ onItemCreated }) => {
  const { showToast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MarketItemFormData>({
    resolver: zodResolver(marketItemSchema)
  });

  const onSubmit = async (data: MarketItemFormData) => {
    try {
      setApiError(null);
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('price', String(data.price));
      formData.append('category', data.category);
      formData.append('image', data.image[0]);

      await api.post('/market', formData);
      reset();
      showToast('Item listed on the marketplace');
      onItemCreated();
    } catch (error: unknown) {
      setApiError(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="item-title" className="mb-1 block text-sm font-medium text-gray-700">Item Title</label>
        <input
          id="item-title"
          {...register('title')}
          className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-nu-blue focus:outline-none focus:ring-1 focus:ring-nu-blue"
          placeholder="e.g. 2nd Hand IT Uniform"
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="item-image" className="mb-1 block text-sm font-medium text-gray-700">Item Photo</label>
        <input
          id="item-image"
          type="file"
          accept="image/*"
          {...register('image')}
          className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-nu-blue file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:opacity-90"
        />
        {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image.message}</p>}
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="item-price" className="mb-1 block text-sm font-medium text-gray-700">Price (₱)</label>
          <input
            id="item-price"
            type="number"
            {...register('price', { valueAsNumber: true })}
            className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-nu-blue focus:outline-none focus:ring-1 focus:ring-nu-blue"
          />
          {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
        </div>

        <div className="flex-1">
          <label htmlFor="item-category" className="mb-1 block text-sm font-medium text-gray-700">Category</label>
          <select
            id="item-category"
            {...register('category')}
            className="w-full rounded-md border border-gray-300 bg-white p-2.5 text-sm focus:border-nu-blue focus:outline-none focus:ring-1 focus:ring-nu-blue"
          >
            <option value="">Select...</option>
            {MARKET_CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
        </div>
      </div>

      {apiError && <p className="rounded bg-red-50 p-3 text-sm text-red-500">{apiError}</p>}

      <div className="flex justify-end pt-2">
        <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
          Post Item
        </Button>
      </div>
    </form>
  );
};
