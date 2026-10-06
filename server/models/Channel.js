const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Channel name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Channel name must be at least 2 characters'],
    maxlength: [40, 'Channel name must be at most 40 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description must be at most 200 characters'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: { values: ['Church', 'Orgs', 'Academics', 'Others'], message: 'Category must be Church, Orgs, Academics, or Others' },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Channel creator is required'] },
}, { timestamps: true });

module.exports = mongoose.model('Channel', channelSchema);
