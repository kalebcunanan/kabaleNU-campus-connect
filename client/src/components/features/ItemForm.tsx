import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { marketItemSchema, type MarketItemFormData } from '../../schemas/market';
import { MARKET_CATEGORIES } from '../../constants/marketCategories';
import api, { getErrorMessage } from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import Button from '../common/Button';
import Input from '../common/Input';
import Select, { type SelectOption } from '../common/Select';

interface ItemFormProps {
  onItemCreated: () => void;
}

const CATEGORY_OPTIONS: SelectOption[] = MARKET_CATEGORIES.map((category) => ({ value: category, label: category }));

const FILE_INPUT_CLASSES =
  'file:mr-3 file:rounded-md file:border-0 file:bg-nu-blue file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:opacity-90';

export const ItemForm: React.FC<ItemFormProps> = ({ onItemCreated }) => {
  const { showToast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MarketItemFormData>({
    resolver: zodResolver(marketItemSchema)
  });

  const onSubmit = async (data: MarketItemFormData): Promise<void> => {
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Input
        label="Item Title"
        placeholder="e.g. 2nd Hand IT Uniform"
        error={errors.title?.message}
        {...register('title')}
      />

      <Input
        label="Item Photo"
        type="file"
        accept="image/*"
        className={FILE_INPUT_CLASSES}
        error={errors.image?.message}
        {...register('image')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Price (₱)"
          type="number"
          error={errors.price?.message}
          {...register('price', { valueAsNumber: true })}
        />
        <Select
          label="Category"
          placeholder="Select..."
          options={CATEGORY_OPTIONS}
          error={errors.category?.message}
          {...register('category')}
        />
      </div>

      {apiError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {apiError}
        </p>
      )}

      <div className="flex justify-end pt-2">
        <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
          Post Item
        </Button>
      </div>
    </form>
  );
};
