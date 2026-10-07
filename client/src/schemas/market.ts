import { z } from 'zod';
import { MARKET_CATEGORIES } from '../constants/marketCategories';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const marketItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Maximum of 100 characters'),
  price: z.number().min(0, 'Price cannot be negative'),
  category: z.enum(MARKET_CATEGORIES, {
    message: 'Please select a valid category'
  }),
  image: z
    .custom<FileList>((value) => value instanceof FileList && value.length > 0, 'Item photo is required')
    .refine((files) => !files[0] || files[0].type.startsWith('image/'), 'File must be an image')
    .refine((files) => !files[0] || files[0].size <= MAX_IMAGE_SIZE, 'Photo must be 5 MB or less')
});

export type MarketItemFormData = z.infer<typeof marketItemSchema>;
