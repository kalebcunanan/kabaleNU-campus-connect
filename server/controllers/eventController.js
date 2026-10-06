// server/controllers/eventController.js
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// CRUD for Events (Faculty only - protected by restrictTo('faculty') in routes)
exports.createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({
    ...req.body,
    organizer: req.user._id,
    slotsRemaining: req.body.capacity
  });
  res.status(201).json(event);
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

exports.updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findOneAndUpdate(
    { _id: req.params.id, organizer: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!event) throw new AppError('Event not found or unauthorized', 403);
  res.status(200).json(event);
});

exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findOneAndDelete({ _id: req.params.id, organizer: req.user._id });
  if (!event) throw new AppError('Event not found or unauthorized', 403);
  await Registration.deleteMany({ event: event._id });
  res.status(200).json({ message: 'Event deleted' });
});

// PROCESSING 2: Registration with Conflict & Capacity Logic
exports.registerForEvent = asyncHandler(async (req, res) => {
  const newEvent = await Event.findById(req.params.id);
  if (!newEvent) throw new AppError('Event not found', 404);

  // 1. Conflict Check: check if the user has an overlapping event
  const userRegs = await Registration.find({ user: req.user._id, status: 'registered' }).populate('event');
  const hasConflict = userRegs.some(reg => {
    const existing = reg.event;
    // Overlap logic: existing starts before new ends AND existing ends after new starts
    return existing.eventDate < newEvent.endDate && existing.endDate > newEvent.eventDate;
  });

  if (hasConflict) throw new AppError('Time conflict with another registered event', 400);

  // 2. Atomic Slots Check & Decrement
  const event = await Event.findOneAndUpdate(
    { _id: req.params.id, slotsRemaining: { $gt: 0 } },
    { $inc: { slotsRemaining: -1 } },
    { new: true }
  );
  if (!event) throw new AppError('Event is full or does not exist', 400);

  // 3. Create or Reactivate Registration
  const registration = await Registration.findOneAndUpdate(
    { user: req.user._id, event: event._id },
    { status: 'registered' },
    { upsert: true, new: true }
  );

  // Award +10 bulldogScore
  await User.findByIdAndUpdate(req.user._id, { $inc: { bulldogScore: 10 } });

  res.status(201).json(registration);
});

exports.cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findOneAndUpdate(
    { user: req.user._id, event: req.params.id, status: 'registered' },
    { status: 'cancelled' },
    { new: true }
  );

  if (!registration) throw new AppError('Active registration not found', 400);

  await Event.findByIdAndUpdate(req.params.id, { $inc: { slotsRemaining: 1 } });
  await User.findByIdAndUpdate(req.user._id, { $inc: { bulldogScore: -10 } });

  res.status(200).json({ message: 'Registration cancelled' });
});