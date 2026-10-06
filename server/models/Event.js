const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 1000 },
  eventDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  capacity: { type: Number, required: true, min: 1 },
  slotsRemaining: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);