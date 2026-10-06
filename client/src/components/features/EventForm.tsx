// client/src/components/features/EventForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventSchema, type EventFormData } from '../../schemas/event';
import api, { getErrorMessage } from '../../lib/axios';
import Button from '../common/Button';

interface EventFormProps {
  onEventCreated: () => void;
}

export const EventForm: React.FC<EventFormProps> = ({ onEventCreated }) => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema)
  });

  const onSubmit = async (data: EventFormData) => {
    try {
      setApiError(null);
      setSuccess(false);
      await api.post('/events', data);
      setSuccess(true);
      reset();
      setIsOpen(false);
      onEventCreated(); // I-refresh ang events list
    } catch (error: unknown) {
      setApiError(getErrorMessage(error));
    }
  };

  if (!isOpen) {
    return (
      <div className="mb-6 flex justify-end">
        <Button onClick={() => setIsOpen(true)}>+ Create New Event</Button>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-nu-blue">Create a Campus Event</h3>
        <button type="button" onClick={() => setIsOpen(false)} className="text-sm text-gray-500 hover:text-nu-blue">Cancel</button>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Event Title</label>
          <input {...register('title')} className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-nu-blue focus:outline-none" />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea {...register('description')} rows={3} className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-nu-blue focus:outline-none" />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Capacity (Slots)</label>
            <input type="number" {...register('capacity', { valueAsNumber: true })} className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-nu-blue focus:outline-none" />
            {errors.capacity && <p className="mt-1 text-xs text-red-500">{errors.capacity.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Start Date & Time</label>
            <input type="datetime-local" {...register('eventDate')} className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-nu-blue focus:outline-none" />
            {errors.eventDate && <p className="mt-1 text-xs text-red-500">{errors.eventDate.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">End Date & Time</label>
            <input type="datetime-local" {...register('endDate')} className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-nu-blue focus:outline-none" />
            {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate.message}</p>}
          </div>
        </div>

        {apiError && <p className="text-sm text-red-500">{apiError}</p>}
        {success && <p className="text-sm font-medium text-green-600">Event successfully created!</p>}

        <div className="flex justify-end pt-2">
          <Button type="submit" isLoading={isSubmitting}>Publish Event</Button>
        </div>
      </form>
    </div>
  );
};