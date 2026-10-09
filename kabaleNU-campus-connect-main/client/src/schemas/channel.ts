import { z } from 'zod';

export const channelSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Channel name must be at least 2 characters' })
    .max(40, { message: 'Channel name must be at most 40 characters' }),
  description: z.string().max(200, { message: 'Description must be at most 200 characters' }).optional(),
  category: z.enum(['Church', 'Orgs', 'Academics', 'Others'], { message: 'Select a category' }),
});

export const messageSchema = z.object({
  content: z
    .string()
    .min(1, { message: 'Message cannot be empty' })
    .max(500, { message: 'Message must be at most 500 characters' }),
});

export type ChannelFormData = z.infer<typeof channelSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;