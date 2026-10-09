const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { uploadBanner, deleteMedia } = require('../utils/cloudinary');

// Multipart bodies arrive as strings, so capacity is converted before it is validated.
const parseCapacity = (value) => (value === undefined || value === '' ? undefined : Number(value));

const bannerToMedia = (banner) => (banner && banner.publicId ? [{ publicId: banner.publicId, type: 'image' }] : []);

const DEFAULT_DURATION_MS = 60 * 60 * 1000;

// Events without an end time get a one-hour window so registration conflicts can still be checked.
const resolveEnd = (start, end) => {
  if (end) return { endDate: end, hasEndTime: true };
  const startTime = new Date(start).getTime();
  return { endDate: Number.isNaN(startTime) ? undefined : new Date(startTime + DEFAULT_DURATION_MS), hasEndTime: false };
};

const isOrganizer = (event, user) => event.organizer.toString() === user._id.toString();

// Faculty-only access for create, update, and delete is enforced by restrictTo in the routes.
exports.createEvent = asyncHandler(async (req, res) => {
  const { title, description, eventDate } = req.body || {};
  const capacity = parseCapacity((req.body || {}).capacity);
  const end = resolveEnd(eventDate, (req.body || {}).endDate);

  if (new Date(end.endDate) <= new Date(eventDate)) {
    throw new AppError('End date must be after event date', 400);
  }

  const banner = req.file ? await uploadBanner(req.file) : undefined;

  try {
    const event = await Event.create({
      title,
      description,
      eventDate,
      endDate: end.endDate,
      hasEndTime: end.hasEndTime,
      capacity,
      banner,
      organizer: req.user._id,
      slotsRemaining: capacity,
    });
    res.status(201).json(event);
  } catch (error) {
    await deleteMedia(bannerToMedia(banner));
    throw error;
  }
});

exports.getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().sort({ eventDate: 1 }).populate('organizer', 'name');
  res.status(200).json(events);
});

exports.getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'name');
  if (!event) throw new AppError('Event not found', 404);
  res.status(200).json(event);
});

// Only the faculty member who published the event can edit it.
exports.updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new AppError('Event not found', 404);
  if (!isOrganizer(event, req.user)) throw new AppError('Only the organizer can update this event', 403);

  const { title, description, eventDate, status } = req.body || {};
  const bodyEnd = (req.body || {}).endDate;
  const capacity = parseCapacity((req.body || {}).capacity);

  // The client always sends the start and end together, so a missing end clears the end time.
  const end = eventDate !== undefined || bodyEnd !== undefined ? resolveEnd(eventDate || event.eventDate, bodyEnd) : null;

  if (new Date(end ? end.endDate : event.endDate) <= new Date(eventDate || event.eventDate)) {
    throw new AppError('End date must be after event date', 400);
  }
  if (capacity !== undefined && (!Number.isInteger(capacity) || capacity < 1)) {
    throw new AppError('Capacity must be a whole number of at least 1', 400);
  }

  if (title) event.title = title;
  if (description) event.description = description;
  if (eventDate) event.eventDate = eventDate;
  if (end) {
    event.endDate = end.endDate;
    event.hasEndTime = end.hasEndTime;
  }
  if (status) event.status = status;
  await event.validate();

  const oldBanner = event.banner && event.banner.publicId ? { publicId: event.banner.publicId } : null;
  const newBanner = req.file ? await uploadBanner(req.file) : undefined;
  if (newBanner) event.banner = newBanner;

  try {
    if (capacity !== undefined) {
      // The conditional filter rejects a capacity lower than the current number of registrations.
      const delta = capacity - event.capacity;
      const result = await Event.updateOne(
        { _id: event._id, slotsRemaining: { $gte: -delta } },
        { $inc: { slotsRemaining: delta }, $set: { capacity } }
      );
      if (result.matchedCount === 0) {
        throw new AppError('Capacity cannot be lower than the number of registrations', 400);
      }
    }
    await event.save();
  } catch (error) {
    await deleteMedia(bannerToMedia(newBanner));
    throw error;
  }

  if (newBanner) await deleteMedia(bannerToMedia(oldBanner));

  const updated = await Event.findById(event._id).populate('organizer', 'name');
  res.status(200).json(updated);
});

exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new AppError('Event not found', 404);
  if (!isOrganizer(event, req.user)) throw new AppError('Only the organizer can delete this event', 403);

  await event.deleteOne();
  await Registration.deleteMany({ event: event._id });
  await deleteMedia(bannerToMedia(event.banner));
  res.status(200).json({ message: 'Event deleted' });
});

// Lists the active registrants of an event for faculty.
exports.getEventRegistrations = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).select('_id');
  if (!event) throw new AppError('Event not found', 404);

  const registrations = await Registration.find({ event: event._id, status: 'registered' })
    .sort({ createdAt: 1 })
    .populate('user', 'name email role program profilePicture');
  res.status(200).json(registrations);
});

// PROCESSING 2: registration with conflict and capacity logic.
exports.registerForEvent = asyncHandler(async (req, res) => {
  if (req.user.role === 'faculty') throw new AppError('Faculty accounts cannot register for events', 403);

  const newEvent = await Event.findById(req.params.id);
  if (!newEvent) throw new AppError('Event not found', 404);

  if (newEvent.status === 'completed') throw new AppError('Cannot register for a completed event', 400);

  const existingReg = await Registration.findOne({ user: req.user._id, event: req.params.id, status: 'registered' });
  if (existingReg) throw new AppError('You are already registered for this event', 400);

  const userRegs = await Registration.find({ user: req.user._id, status: 'registered' }).populate('event');
  const hasConflict = userRegs.some((reg) => {
    const existing = reg.event;
    return existing.eventDate < newEvent.endDate && existing.endDate > newEvent.eventDate;
  });

  if (hasConflict) throw new AppError('Time conflict with another registered event', 400);

  const event = await Event.findOneAndUpdate(
    { _id: req.params.id, slotsRemaining: { $gt: 0 } },
    { $inc: { slotsRemaining: -1 } },
    { new: true }
  );
  if (!event) throw new AppError('Event is full', 400);

  try {
    const registration = await Registration.findOneAndUpdate(
      { user: req.user._id, event: event._id },
      { status: 'registered' },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(req.user._id, { $inc: { bulldogScore: 10 } });

    res.status(201).json(registration);
  } catch (error) {
    await Event.findByIdAndUpdate(event._id, { $inc: { slotsRemaining: 1 } });
    throw error;
  }
});

exports.cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findOneAndUpdate(
    { user: req.user._id, event: req.params.id, status: 'registered' },
    { status: 'cancelled' },
    { new: true }
  );

  if (!registration) throw new AppError('Active registration not found', 400);

  // The $expr filter keeps slotsRemaining from going above capacity.
  await Event.updateOne(
    { _id: req.params.id, $expr: { $lt: ['$slotsRemaining', '$capacity'] } },
    { $inc: { slotsRemaining: 1 } }
  );

  await User.updateOne({ _id: req.user._id, bulldogScore: { $gte: 10 } }, { $inc: { bulldogScore: -10 } });

  res.status(200).json({ message: 'Registration cancelled' });
});
