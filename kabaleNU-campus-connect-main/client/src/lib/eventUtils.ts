import type { CampusEvent } from '../types/event';

const dateFormat = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const timeFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });

// Shows whole hours without minutes, for example "1 PM" instead of "1:00 PM".
const formatTime = (date: Date): string => timeFormat.format(date).replace(/:00(?=\s)/, '');

// Formats an event schedule and shows only the start when the event has no end time.
export const formatEventRange = (event: CampusEvent): string => {
  const from = new Date(event.eventDate);
  const startText = `${dateFormat.format(from)} at ${formatTime(from)}`;
  if (event.hasEndTime === false) return startText;

  const to = new Date(event.endDate);
  const sameDay = from.toDateString() === to.toDateString();
  const endText = sameDay ? formatTime(to) : `${dateFormat.format(to)} at ${formatTime(to)}`;
  return `${startText} to ${endText}`;
};

// Converts an ISO date into the local value format that datetime-local inputs expect.
export const toDateTimeLocal = (iso: string): string => {
  const date = new Date(iso);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

export const getOrganizerId = (event: CampusEvent): string =>
  typeof event.organizer === 'string' ? event.organizer : event.organizer._id;

export const getOrganizerName = (event: CampusEvent): string =>
  typeof event.organizer === 'string' ? 'Faculty' : event.organizer.name;

// Splits an ISO date into the local date and time strings used by date and time inputs.
export const splitDateTime = (iso: string): { date: string; time: string } => {
  const local = toDateTimeLocal(iso);
  return { date: local.slice(0, 10), time: local.slice(11, 16) };
};

// Combines a date input value and a time input value into one local Date.
export const toEventDate = (date: string, time: string): Date => new Date(`${date}T${time}`);
