import type { UserRole } from './auth';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed';

export interface EventOrganizer {
  _id: string;
  name: string;
}

export interface EventBanner {
  url: string;
  publicId?: string;
}

export interface CampusEvent {
  _id: string;
  title: string;
  description: string;
  eventDate: string;
  endDate: string;
  organizer: EventOrganizer | string;
  capacity: number;
  slotsRemaining: number;
  status: EventStatus;
  banner?: EventBanner;
  hasEndTime?: boolean;
}

export interface EventRegistrant {
  _id: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    program?: string;
    profilePicture?: string;
  };
}

export interface MyRegistration {
  _id: string;
  status: 'registered' | 'cancelled';
  event: string | { _id: string };
}
