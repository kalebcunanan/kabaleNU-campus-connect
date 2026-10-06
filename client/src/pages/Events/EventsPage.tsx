import { useCallback, useEffect, useState } from 'react';
import Loader from '../../components/common/Loader';
import api, { getErrorMessage } from '../../lib/axios';
import { EventCard } from '../../components/features/EventCard';
import { EventForm } from '../../components/features/EventForm'; 
import { useAuth } from '../../hooks/useAuth'; 

export default function EventsPage() {
  const { user } = useAuth(); 
  const [events, setEvents] = useState<any[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ito ang nagche-check kung faculty o admin ang user
const isFacultyOrAdmin = (user?.role as string) === 'faculty' || (user?.role as string) === 'admin';

  const fetchEventsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [eventsRes, regsRes] = await Promise.all([
        api.get('/events'),
        api.get('/users/me/registrations')
      ]);
      
      setEvents(eventsRes.data);
      
      const regIds = new Set(
        regsRes.data
          .filter((reg: any) => reg.status === 'registered')
          .map((reg: any) => reg.event._id || reg.event)
      );
      setRegisteredEventIds(regIds as Set<string>);

    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventsData();
  }, [fetchEventsData]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 border-b-2 border-nu-gold pb-4">
        <h1 className="text-3xl font-bold text-nu-blue">Campus Events</h1>
        <p className="text-gray-600">Register for events and earn +10 Bulldog Score!</p>
      </div>

      {/* Dito natin ipinapakita ang form kapag pasado sa role check */}
      {isFacultyOrAdmin && <EventForm onEventCreated={fetchEventsData} />}

      {loading ? (
        <Loader label="Loading events..." />
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-6 text-center font-medium text-red-500">{error}</div>
      ) : events.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-lg">No upcoming events right now.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((event) => (
            <EventCard 
              key={event._id} 
              event={event} 
              isRegistered={registeredEventIds.has(event._id)}
              onStatusChange={fetchEventsData} 
            />
          ))}
        </div>
      )}
    </main>
  );
}