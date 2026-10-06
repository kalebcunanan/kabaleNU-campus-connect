import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Maximum of 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Maximum of 1000 characters'),
  eventDate: z.string().min(1, 'Event start date is required'),
  endDate: z.string().min(1, 'Event end date is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1')
}).refine((data) => new Date(data.eventDate) < new Date(data.endDate), {
  message: "End date must be after the start date",
  path: ["endDate"]
});

export type EventFormData = z.infer<typeof eventSchema>;