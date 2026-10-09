const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], required: true },
});

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Post author is required'] },
  content: {
    type: String,
    required: [
      function () { return !this.media || this.media.length === 0; },
      'Post content is required',
    ],
    trim: true,
    default: '',
    maxlength: [1000, 'Post content must be at most 1000 characters'],
  },
  media: {
    type: [mediaSchema],
    validate: [(items) => items.length <= 4, 'A post can have at most 4 files'],
  },
  bulldogReacts: { type: Number, default: 0, min: 0 },
  commentCount: { type: Number, default: 0, min: 0 },
  reportCount: { type: Number, default: 0, min: 0 },
  reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'hidden'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);