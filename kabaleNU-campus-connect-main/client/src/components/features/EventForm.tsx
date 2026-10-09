import React, { useEffect, useMemo, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../common/Button';
import FormField from '../common/FormField';
import Input from '../common/Input';
import { useModal } from '../../hooks/useModal';
import { useToast } from '../../hooks/useToast';
import api, { getErrorMessage } from '../../lib/axios';
import { splitDateTime, toEventDate } from '../../lib/eventUtils';
import { getFieldClasses } from '../../lib/formStyles';
import { eventSchema, type EventFormData } from '../../schemas/event';
import type { CampusEvent } from '../../types/event';

interface EventFormProps {
  event?: CampusEvent;
  onClose: () => void;
  onSaved: () => void;
}

const getDefaultValues = (event?: CampusEvent): Partial<EventFormData> => {
  if (!event) return { title: '', description: '', startDate: '', startTime: '', endTime: '', isMultiDay: false };

  const start = splitDateTime(event.eventDate);
  const end = splitDateTime(event.endDate);
  return {
    title: event.title,
    description: event.description,
    startDate: start.date,
    startTime: start.time,
    endTime: event.hasEndTime === false ? '' : end.time,
    isMultiDay: start.date !== end.date,
    endDate: end.date,
    capacity: event.capacity,
    status: event.status,
  };
};

export const EventForm: React.FC<EventFormProps> = ({ event, onClose, onSaved }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = event !== undefined;

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: getDefaultValues(event),
  });

  useModal(onClose, isSubmitting);

  const banner = useWatch({ control, name: 'banner' });
  const isMultiDay = useWatch({ control, name: 'isMultiDay' });
  const startDate = useWatch({ control, name: 'startDate' });

  // The banner preview is derived from the picked file, falling back to the saved banner.
  const pickedUrl = useMemo(() => (banner ? URL.createObjectURL(banner) : null), [banner]);
  const shownBanner = pickedUrl ?? (event?.banner?.url || null);

  useEffect(
    () => () => {
      if (pickedUrl) URL.revokeObjectURL(pickedUrl);
    },
    [pickedUrl],
  );

  const handleBannerChange = (changeEvent: React.ChangeEvent<HTMLInputElement>): void => {
    const file = changeEvent.target.files?.[0];
    if (file) setValue('banner', file, { shouldValidate: true });
    changeEvent.target.value = '';
  };

  const onSubmit = async (data: EventFormData): Promise<void> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    const lastDay = data.isMultiDay && data.endDate ? data.endDate : data.startDate;
    formData.append('eventDate', toEventDate(data.startDate, data.startTime).toISOString());
    if (data.endTime) formData.append('endDate', toEventDate(lastDay, data.endTime).toISOString());
    formData.append('capacity', String(data.capacity));
    if (isEdit && data.status) formData.append('status', data.status);
    if (data.banner) formData.append('banner', data.banner);

    try {
      if (isEdit) await api.put(`/events/${event._id}`, formData);
      else await api.post('/events', formData);
      showToast(isEdit ? 'Event updated' : 'Event published');
      onSaved();
      onClose();
    } catch (error) {
      setError('root.server', { message: getErrorMessage(error) });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-form-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div className="absolute inset-0" onClick={() => !isSubmitting && onClose()} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="relative flex items-center justify-center border-b border-gray-200 px-4 py-3">
          <h3 id="event-form-title" className="text-lg font-bold text-nu-blue">
            {isEdit ? 'Edit event' : 'Create event'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 disabled:opacity-50"
          >
            X
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {errors.root?.server && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors.root.server.message}
            </p>
          )}

          <div>
            <p className="mb-1 text-sm font-medium text-gray-700">Banner</p>
            <div className="overflow-hidden rounded-xl border border-dashed border-nu-blue/40 bg-nu-blue/5">
              {shownBanner ? (
                <img src={shownBanner} alt="Event banner preview" className="aspect-video w-full object-cover" />
              ) : (
                <div className="flex aspect-video items-center justify-center text-sm text-gray-500">No banner yet</div>
              )}
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => fileInputRef.current?.click()}>
              {shownBanner ? 'Change banner' : 'Add banner'}
            </Button>
            {errors.banner?.message && <p className="mt-1 text-sm text-red-600">{errors.banner.message}</p>}
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleBannerChange} />
          </div>

          <Input label="Event title" error={errors.title?.message} {...register('title')} />

          <FormField id="eventDescription" label="Description" error={errors.description?.message}>
            <textarea
              id="eventDescription"
              rows={4}
              className={getFieldClasses(Boolean(errors.description))}
              {...register('description')}
            />
          </FormField>

          <Input label="Date" type="date" error={errors.startDate?.message} {...register('startDate')} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Starts at" type="time" error={errors.startTime?.message} {...register('startTime')} />
            <Input
              label={isMultiDay ? 'Ends at' : 'Ends at (optional)'}
              type="time"
              error={errors.endTime?.message}
              {...register('endTime')}
            />
          </div>
          {!isMultiDay && <p className="-mt-2 text-xs text-gray-500">Leave the end time blank if the event only has a start time.</p>}

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" className="h-4 w-4 accent-nu-blue" {...register('isMultiDay')} />
            This event runs for more than one day
          </label>

          {isMultiDay && (
            <Input label="Last day" type="date" min={startDate} error={errors.endDate?.message} {...register('endDate')} />
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Capacity (slots)"
              type="number"
              min={1}
              error={errors.capacity?.message}
              {...register('capacity', { valueAsNumber: true })}
            />
            {isEdit && (
              <FormField id="eventStatus" label="Status" error={errors.status?.message}>
                <select id="eventStatus" className={getFieldClasses(Boolean(errors.status))} {...register('status')}>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </FormField>
            )}
          </div>

          {isSubmitting && <p className="text-sm text-gray-500">Saving your event, this may take a moment...</p>}
        </div>

        <div className="flex gap-2 border-t border-gray-200 p-4">
          <Button type="submit" variant="gold" isLoading={isSubmitting} className="flex-1">
            {isEdit ? 'Save changes' : 'Publish event'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
