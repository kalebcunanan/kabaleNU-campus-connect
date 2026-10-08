const mongoose = require('mongoose');

// A message belongs either to a channel or to a direct conversation (marketplace or friends).
const messageSchema = new mongoose.Schema({
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: [function requiresChannel() { return !this.conversation; }, 'Channel is required'],
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: [function requiresConversation() { return !this.channel; }, 'Conversation is required'],
  },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Sender is required'] },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [500, 'Message must be at most 500 characters'],
  },
}, { timestamps: true });

messageSchema.index({ channel: 1, createdAt: -1 });
messageSchema.index({ conversation: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
