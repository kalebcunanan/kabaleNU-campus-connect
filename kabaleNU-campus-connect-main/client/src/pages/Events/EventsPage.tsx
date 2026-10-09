import { useState } from 'react';
import Button from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import FadeIn from '../../components/common/FadeIn';
import { EventCard } from '../../components/features/EventCard';
import EventCardSkeleton from '../../components/features/EventCardSkeleton';
import { EventForm } from '../../components/features/EventForm';
import { useAuth } from '../../hooks/useAuth';
import { useAxiosFetch } from '../../hooks/useAxiosFetch';
import type { CampusEvent, MyRegistration } from '../../types/event';

const SKELETON_IDS = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;

export default function EventsPage() {
  const { user } = useAuth();
  const { data: events, loading, error, refetch: refetchEvents } = useAxiosFetch<CampusEvent[]>('/events');
  const { data: registrations, error: registrationsError, refetch: refetchRegistrations } = useAxiosFetch<MyRegistration[]>('/users/me/registrations');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  const isFaculty = user?.role === 'faculty';

  // The registered ids are derived during render from the active registrations.
  const registeredEventIds = new Set(
    (registrations ?? [])
      .filter((registration) => registration.status === 'registered')
      .map((registration) => (typeof registration.event === 'string' ? registration.event : registration.event._id)),
  );

  const handleRefresh = (): void => {
    void refetchEvents();
    void refetchRegistrations();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="border-l-4 border-nu-gold pl-3">
          <h1 className="text-3xl font-bold text-nu-blue">Bulldog Events</h1>
          <p className="text-gray-600">
            {isFaculty ? 'Publish events and track who registered.' : 'Register for events and earn +10 Bulldog Score.'}
          </p>
        </div>
        {isFaculty && <Button variant="gold" onClick={() => setIsFormOpen(true)}>Create event</Button>}
      </div>

      {!isFaculty && registrationsError && (
        <ErrorState
          variant="inline"
          message="Could not load your registrations, so events you joined may look open."
          onRetry={() => void refetchRegistrations()}
        />
      )}

      {loading ? (
        <div role="status" aria-label="Loading events" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SKELETON_IDS.map((id) => (
            <EventCardSkeleton key={id} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={handleRefresh} />
      ) : !events || events.length === 0 ? (
        <EmptyState message={isFaculty ? 'No events yet. Create the first one.' : 'No events yet. Check back soon.'} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <FadeIn key={event._id} index={index}>
              <EventCard
                event={event}
                isRegistered={registeredEventIds.has(event._id)}
                onStatusChange={handleRefresh}
              />
            </FadeIn>
          ))}
        </div>
      )}

      {isFormOpen && <EventForm onClose={() => setIsFormOpen(false)} onSaved={handleRefresh} />}
    </div>
  );
}
