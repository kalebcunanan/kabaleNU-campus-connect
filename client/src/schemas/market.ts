// client/src/schemas/market.ts
import { z } from 'zod';

export const marketItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Maximum of 100 characters'),
  price: z.number().min(0, 'Price cannot be negative'),
  category: z.enum(['Books', 'Uniforms', 'Electronics', 'Others'], {
    message: 'Please select a valid category'
  })
});

export type MarketItemFormData = z.infer<typeof marketItemSchema>;