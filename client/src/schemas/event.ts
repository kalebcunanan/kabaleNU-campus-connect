import { z } from 'zod';
import { toEventDate } from '../lib/eventUtils';

const MAX_BANNER_SIZE = 5 * 1024 * 1024;

export const eventSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(100, 'Maximum of 100 characters'),
    description: z.string().min(1, 'Description is required').max(1000, 'Maximum of 1000 characters'),
    startDate: z.string().min(1, 'Event date is required'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().optional(),
    isMultiDay: z.boolean(),
    endDate: z.string().optional(),
    capacity: z.number().min(1, 'Capacity must be at least 1'),
    status: z.enum(['upcoming', 'ongoing', 'completed']).optional(),
    banner: z
      .instanceof(File)
      .optional()
      .refine((file) => !file || file.type.startsWith('image/'), 'Banner must be an image')
      .refine((file) => !file || file.size <= MAX_BANNER_SIZE, 'Banner must be 5MB or smaller'),
  })
  .refine((data) => !data.isMultiDay || Boolean(data.endDate), {
    message: 'Last day is required',
    path: ['endDate'],
  })
  .refine((data) => !data.isMultiDay || Boolean(data.endTime), {
    message: 'End time is required for multi-day events',
    path: ['endTime'],
  })
  .refine(
    (data) =>
      !data.endTime ||
      toEventDate(data.startDate, data.startTime) <
        toEventDate(data.isMultiDay && data.endDate ? data.endDate : data.startDate, data.endTime),
    { message: 'The event must end after it starts', path: ['endTime'] },
  );

export type EventFormData = z.infer<typeof eventSchema>;
