const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Event title must be at most 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [1000, 'Event description must be at most 1000 characters'],
  },
  eventDate: { type: Date, required: [true, 'Event date is required'] },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      // Runs on create and save, where this is the full document.
      validator(value) { return !this.eventDate || value > this.eventDate; },
      message: 'End date must be after event date',
    },
  },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Organizer is required'] },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    validate: { validator: Number.isInteger, message: 'Capacity must be a whole number' },
  },
  slotsRemaining: {
    type: Number,
    required: true,
    min: [0, 'Slots remaining cannot be negative'],
    validate: {
      validator(value) { return this.capacity === undefined || value <= this.capacity; },
      message: 'Slots remaining cannot exceed capacity',
    },
  },
  hasEndTime: { type: Boolean, default: true },
  banner: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  status: {
    type: String,
    enum: { values: ['upcoming', 'ongoing', 'completed'], message: 'Status must be upcoming, ongoing, or completed' },
    default: 'upcoming',
  },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
