import type { User } from '../types/auth';

// Faculty can manage any content, while everyone else can manage only their own.
export const canManage = (user: User | null, ownerId: string): boolean =>
  user !== null && (user.role === 'faculty' || user._id === ownerId);
