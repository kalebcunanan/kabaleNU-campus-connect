const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 1000 },
  bulldogReacts: { type: Number, default: 0, min: 0 },
  commentCount: { type: Number, default: 0, min: 0 },
  reportCount: { type: Number, default: 0, min: 0 },
  reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'hidden'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);