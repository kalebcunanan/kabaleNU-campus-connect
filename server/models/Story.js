const mongoose = require('mongoose');

const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000;

const storySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Story author is required'] },
  media: {
    url: { type: String, required: [true, 'Story media is required'] },
    publicId: { type: String, required: [true, 'Story media is required'] },
    type: { type: String, enum: ['image', 'video'], required: [true, 'Story media type is required'] },
  },
  caption: { type: String, trim: true, default: '', maxlength: [200, 'Caption must be at most 200 characters'] },
  expiresAt: { type: Date, default: () => new Date(Date.now() + STORY_LIFETIME_MS), index: true },
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);