import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import api, { getErrorMessage } from '../../lib/axios';
import { formatEventRange, getOrganizerId } from '../../lib/eventUtils';
import type { CampusEvent } from '../../types/event';

interface EventCardProps {
  event: CampusEvent;
  isRegistered: boolean;
  onStatusChange: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, isRegistered, onStatusChange }) => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCancelOpen, setIsCancelOpen] = useState<boolean>(false);

  const isFaculty = user?.role === 'faculty';
  const isOwner = user !== null && getOrganizerId(event) === user._id;
  const isFull = event.slotsRemaining === 0;
  const isEnded = event.status === 'completed';
  const registeredCount = event.capacity - event.slotsRemaining;
  const bannerUrl = event.banner?.url;

  // Registering or cancelling changes the score, so the user is reloaded after either action.
  const runAction = async (request: () => Promise<unknown>, successMessage: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await request();
      showToast(successMessage);
      onStatusChange();
      void refreshUser();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // The dialog closes first because its Confirm button has no pending state.
  const handleConfirmCancel = (): void => {
    setIsCancelOpen(false);
    void runAction(() => api.delete(`/events/${event._id}/register`), 'Registration cancelled (-10 Bulldog Score)');
  };

  const renderAction = (): React.ReactNode => {
    if (isFaculty) {
      return (
        <Button
          variant={isOwner ? 'primary' : 'outline'}
          className="w-full rounded-full"
          onClick={() => navigate(`/events/${event._id}`)}
        >
          {isOwner ? 'Manage event' : 'View details'}
        </Button>
      );
    }
    if (isRegistered) {
      return (
        <Button
          variant="outline"
          className="w-full rounded-full"
          disabled={loading || isEnded}
          onClick={() => setIsCancelOpen(true)}
        >
          {loading ? 'Cancelling...' : 'Cancel registration'}
        </Button>
      );
    }
    return (
      <Button
        variant="gold"
        className="w-full rounded-full"
        disabled={loading || isFull || isEnded}
        onClick={() => void runAction(() => api.post(`/events/${event._id}/register`), 'You are registered! +10 Bulldog Score')}
      >
        {loading ? 'Processing...' : isEnded ? 'Event ended' : isFull ? 'Event full' : 'Register (+10 Points)'}
      </Button>
    );
  };

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-nu-blue bg-white shadow-sm">
      <div className="relative aspect-video bg-nu-blue/10">
        {bannerUrl ? (
          <img src={bannerUrl} alt={`${event.title} banner`} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-nu-blue/60">Campus event</div>
        )}
        {isRegistered && (
          <span className="absolute right-3 top-3 rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
            Registered
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 text-center">
        <p className="text-sm text-gray-600">{formatEventRange(event)}</p>
        <h3 className="mt-1 break-words text-2xl font-extrabold uppercase leading-tight text-nu-blue">{event.title}</h3>
        <div className="mx-auto my-3 h-0.5 w-4/5 bg-nu-gold" />
        <p className="line-clamp-4 whitespace-pre-wrap break-words text-sm text-gray-700">{event.description}</p>

        <div className="mt-auto pt-5">
          {error && (
            <p role="alert" className="mb-2 rounded-md bg-red-50 p-2 text-sm text-red-600">
              {error}
            </p>
          )}
          {renderAction()}
          <p className="mt-2 text-xs text-gray-500">
            {registeredCount} of {event.capacity} registered
          </p>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isCancelOpen}
        title="Cancel registration?"
        message={`You will lose 10 Bulldog Score and give up your slot in "${event.title}".`}
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelOpen(false)}
      />
    </article>
  );
};
