const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: [true, 'Channel is required'] },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Sender is required'] },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [500, 'Message must be at most 500 characters'],
  },
}, { timestamps: true });

messageSchema.index({ channel: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
