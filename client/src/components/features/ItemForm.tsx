import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { marketItemSchema, type MarketItemFormData } from '../../schemas/market';
import api, { getErrorMessage } from '../../lib/axios';
import Button from '../common/Button';

interface ItemFormProps {
  onItemCreated: () => void;
}

export const ItemForm: React.FC<ItemFormProps> = ({ onItemCreated }) => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MarketItemFormData>({
    resolver: zodResolver(marketItemSchema)
  });

  const onSubmit = async (data: MarketItemFormData) => {
    try {
      setApiError(null);
      setSuccess(false);
      await api.post('/market', data);
      setSuccess(true);
      reset();
      onItemCreated();
    } catch (error: unknown) {
      setApiError(getErrorMessage(error));
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-bold text-nu-blue">Sell an Item</h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
          <input
            {...register('title')}
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-nu-blue focus:outline-none focus:ring-1 focus:ring-nu-blue"
            placeholder="e.g. 2nd Hand IT Uniform"
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">Price (₱)</label>
            <input
              type="number"
              {...register('price', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-nu-blue focus:outline-none focus:ring-1 focus:ring-nu-blue"
            />
            {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
          </div>

          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <select
              {...register('category')}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-nu-blue focus:outline-none focus:ring-1 focus:ring-nu-blue"
            >
              <option value="">Select...</option>
              <option value="Books">Books</option>
              <option value="Uniforms">Uniforms</option>
              <option value="Electronics">Electronics</option>
              <option value="Others">Others</option>
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
          </div>
        </div>

        {apiError && <p className="text-sm text-red-500">{apiError}</p>}
        {success && <p className="text-sm font-medium text-green-600">Item successfully listed!</p>}

        <div className="flex justify-end">
          <Button type="submit" isLoading={isSubmitting}>
            Post Item
          </Button>
        </div>
      </form>
    </div>
  );
};