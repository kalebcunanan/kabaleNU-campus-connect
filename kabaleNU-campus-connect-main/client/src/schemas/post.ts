import { z } from 'zod';

const MAX_FILES = 4;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export const postSchema = z
  .object({
    content: z.string().trim().max(1000, 'Post must be at most 1000 characters'),
    media: z
      .array(z.instanceof(File))
      .max(MAX_FILES, `You can attach up to ${MAX_FILES} files`)
      .refine(
        (files) => files.every((f) => f.type.startsWith('image/') || f.type.startsWith('video/')),
        'Only photos and videos are allowed',
      )
      .refine(
        (files) =>
          files.every((f) => (f.type.startsWith('video/') ? f.size <= MAX_VIDEO_SIZE : f.size <= MAX_IMAGE_SIZE)),
        'Photos must be 10MB or smaller and videos 50MB or smaller',
      ),
  })
  .refine((values) => values.content.length > 0 || values.media.length > 0, {
    message: 'Write something or attach a photo or video',
    path: ['content'],
  });

export type PostFormData = z.infer<typeof postSchema>;