import React, { useState } from 'react';
import Button from '../common/Button';
import api, { getErrorMessage } from '../../lib/axios';

interface EventCardProps {
  event: any;
  isRegistered: boolean;
  onStatusChange: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, isRegistered, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.post(`/events/${event._id}/register`);
      onStatusChange(); // Refresh para ma-update ang list at ang slots
    } catch (err) {
      // Dito masasalo yung 400 Error (Halimbawa: "Time conflict with another registered event")
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.delete(`/events/${event._id}/register`);
      onStatusChange();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const isFull = event.slotsRemaining === 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-nu-blue">{event.title}</h3>
          <p className="text-sm text-gray-500">
            {new Date(event.eventDate).toLocaleString()} - {new Date(event.endDate).toLocaleTimeString()}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
          isRegistered ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {isRegistered ? 'Registered' : `${event.slotsRemaining} / ${event.capacity} slots`}
        </span>
      </div>
      
      <p className="mt-3 text-sm text-gray-700">{event.description}</p>
      
      {error && (
        <div className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-600">
          ⚠️ {error}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        {isRegistered ? (
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            {loading ? 'Cancelling...' : 'Cancel Registration'}
          </Button>
        ) : (
          <Button 
            onClick={handleRegister} 
            disabled={loading || isFull}
            className={isFull ? 'opacity-50 cursor-not-allowed' : 'bg-nu-blue text-white hover:bg-blue-900'}
          >
            {loading ? 'Processing...' : isFull ? 'Event Full' : 'Register (+10 Points)'}
          </Button>
        )}
      </div>
    </div>
  );
};