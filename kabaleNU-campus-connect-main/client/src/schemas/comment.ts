import { z } from 'zod';

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { error: 'Comment is required' })
    .max(500, { error: 'Maximum of 500 characters allowed' }),
});

export type CommentFormData = z.infer<typeof commentSchema>;
