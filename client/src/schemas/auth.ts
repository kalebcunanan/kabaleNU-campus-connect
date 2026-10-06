import { z } from 'zod';
import { PROGRAMS_BY_ROLE } from '../constants/programs';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(60, 'Name must be at most 60 characters'),
    email: z.email('Enter a valid email address'),
    role: z.enum(['bulldog', 'bullpup'], { error: 'Select your student type' }),
    program: z.string().min(1, 'Select your academic program'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    profilePicture: z
      .custom<FileList>()
      .optional()
      .refine((files) => !files || files.length === 0 || files[0].type.startsWith('image/'), 'Only image files are allowed')
      .refine((files) => !files || files.length === 0 || files[0].size <= MAX_AVATAR_SIZE, 'Image must be 5MB or smaller'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((values) => PROGRAMS_BY_ROLE[values.role].some((option) => option.value === values.program), {
    message: 'Select a program that matches your student type',
    path: ['program'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;