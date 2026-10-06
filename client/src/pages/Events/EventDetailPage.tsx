import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ErrorState } from '../../components/common/ErrorState';
import Loader from '../../components/common/Loader';
import { EventForm } from '../../components/features/EventForm';
import { EventRegistrantList } from '../../components/features/EventRegistrantList';
import { useAuth } from '../../hooks/useAuth';
import { useAxiosFetch } from '../../hooks/useAxiosFetch';
import { useToast } from '../../hooks/useToast';
import api, { getErrorMessage } from '../../lib/axios';
import { formatEventRange, getOrganizerId, getOrganizerName } from '../../lib/eventUtils';
import type { CampusEvent, EventRegistrant } from '../../types/event';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const { data: event, loading, error, refetch: refetchEvent } = useAxiosFetch<CampusEvent>(`/events/${id}`);
  const {
    data: registrants,
    loading: registrantsLoading,
    error: registrantsError,
    refetch: refetchRegistrants,
  } = useAxiosFetch<EventRegistrant[]>(`/events/${id}/registrations`);

  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (user && user.role !== 'faculty') return <Navigate to="/events" replace />;

  const handleSaved = (): void => {
    void refetchEvent();
    void refetchRegistrants();
  };

  const handleDelete = async (): Promise<void> => {
    setIsConfirmOpen(false);
    try {
      setActionError(null);
      await api.delete(`/events/${id}`);
      showToast('Event deleted');
      navigate('/events');
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  if (loading) return <Loader label="Loading event..." />;
  if (error || !event) return <ErrorState message={error ?? 'Event not found'} onRetry={() => void refetchEvent()} />;

  // Every figure below is derived from the event during render.
  const registeredCount = event.capacity - event.slotsRemaining;
  const fillPercent = Math.round((registeredCount / event.capacity) * 100);
  const isOwner = user !== null && getOrganizerId(event) === user._id;
  const bannerUrl = event.banner?.url;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/events" className="inline-block text-sm font-semibold text-nu-blue hover:underline">
        Back to events
      </Link>

      <section className="overflow-hidden rounded-2xl border-2 border-nu-blue bg-white shadow-sm">
        <div className="aspect-video bg-nu-blue/10">
          {bannerUrl ? (
            <img src={bannerUrl} alt={`${event.title} banner`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-medium text-nu-blue/60">No banner yet</div>
          )}
        </div>

        <div className="space-y-4 p-5">
          <div>
            <span className="rounded-full bg-nu-blue/10 px-3 py-1 text-xs font-bold capitalize text-nu-blue">
              {event.status}
            </span>
            <h1 className="mt-2 break-words text-2xl font-extrabold uppercase text-nu-blue">{event.title}</h1>
            <p className="text-sm text-gray-600">{formatEventRange(event)}</p>
            <p className="text-xs text-gray-500">Posted by {getOrganizerName(event)}</p>
          </div>

          <div className="h-0.5 w-full bg-nu-gold" />
          <p className="whitespace-pre-wrap break-words text-gray-800">{event.description}</p>

          <div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-2xl font-bold text-nu-blue">{registeredCount}</p>
                <p className="text-xs text-gray-500">Registered</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-2xl font-bold text-nu-blue">{event.slotsRemaining}</p>
                <p className="text-xs text-gray-500">Slots left</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-2xl font-bold text-nu-blue">{event.capacity}</p>
                <p className="text-xs text-gray-500">Capacity</p>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full bg-nu-blue" style={{ width: `${fillPercent}%` }} />
            </div>
          </div>

          {actionError && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {actionError}
            </p>
          )}

          {isOwner ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" onClick={() => setIsEditOpen(true)}>Edit event</Button>
              <Button variant="outline" onClick={() => setIsConfirmOpen(true)}>Delete event</Button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Only {getOrganizerName(event)} can edit or delete this event.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 border-l-4 border-nu-gold pl-3 text-xl font-bold text-nu-blue">
          Registered students ({registeredCount})
        </h2>
        {registrantsLoading ? (
          <Loader label="Loading registrants..." />
        ) : registrantsError ? (
          <ErrorState message={registrantsError} onRetry={() => void refetchRegistrants()} />
        ) : (
          <EventRegistrantList registrants={registrants ?? []} />
        )}
      </section>

      {isEditOpen && <EventForm event={event} onClose={() => setIsEditOpen(false)} onSaved={handleSaved} />}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete event"
        message="Are you sure you want to delete this event? All registrations will also be removed. This cannot be undone."
        onConfirm={() => void handleDelete()}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
