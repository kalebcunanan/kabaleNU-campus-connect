import { z } from 'zod';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export const avatarSchema = z.object({
  picture: z.custom<FileList>().superRefine((files, ctx) => {
    const file = files?.[0];
    if (!file) {
      ctx.addIssue({ code: 'custom', message: 'Choose an image first' });
    } else if (!file.type.startsWith('image/')) {
      ctx.addIssue({ code: 'custom', message: 'Only image files are allowed' });
    } else if (file.size > MAX_AVATAR_SIZE) {
      ctx.addIssue({ code: 'custom', message: 'Image must be 5MB or smaller' });
    }
  }),
});

export type AvatarFormValues = z.infer<typeof avatarSchema>;