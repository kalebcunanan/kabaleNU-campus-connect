import { z } from 'zod';

export const channelSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(40, 'Maximum of 40 characters'),
  description: z.string().max(200, 'Maximum of 200 characters').optional(),
  category: z.enum(['Church', 'Orgs', 'Academics', 'Others'], {
    message: 'Please select a category'
  })
});

export type ChannelFormData = z.infer<typeof channelSchema>;

export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(500, 'Maximum of 500 characters')
});

export type MessageFormData = z.infer<typeof messageSchema>;