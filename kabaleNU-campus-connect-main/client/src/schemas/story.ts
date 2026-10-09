import { z } from 'zod';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export const storySchema = z.object({
  media: z.custom<FileList>().superRefine((files, ctx) => {
    const file = files?.[0];
    if (!file) {
      ctx.addIssue({ code: 'custom', message: 'Choose a photo or video first' });
    } else if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      ctx.addIssue({ code: 'custom', message: 'Only photos and videos are allowed' });
    } else if (file.type.startsWith('image/') && file.size > MAX_IMAGE_SIZE) {
      ctx.addIssue({ code: 'custom', message: 'Photos must be 10MB or smaller' });
    } else if (file.type.startsWith('video/') && file.size > MAX_VIDEO_SIZE) {
      ctx.addIssue({ code: 'custom', message: 'Videos must be 50MB or smaller' });
    }
  }),
  caption: z.string().trim().max(200, 'Caption must be at most 200 characters'),
});

export type StoryFormValues = z.infer<typeof storySchema>;