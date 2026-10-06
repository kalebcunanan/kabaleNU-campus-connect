import { z } from 'zod';

export const postSchema = z.object({
  content: z.string().min(1, 'Content is required').max(1000, 'Maximum of 1000 characters allowed')
});

export type PostFormData = z.infer<typeof postSchema>;