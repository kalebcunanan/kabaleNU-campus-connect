const mongoose = require('mongoose');

// A conversation is either about one marketplace item (item set) or a direct chat between two friends (pairKey set).
const conversationSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketItem' },
  // For direct chats buyer is the user who opened the chat and seller is the friend.
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Buyer is required'] },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Seller is required'] },
  // Only direct chats have a pair key, which keeps one chat per pair of friends.
  pairKey: { type: String },
  // Both fields stay empty until the first message so empty threads never reach an inbox.
  lastMessage: { type: String, maxlength: [500, 'Message must be at most 500 characters'] },
  lastMessageAt: { type: Date, default: null },
}, { timestamps: true });

// Partial indexes apply the uniqueness rules only to the kind of conversation they belong to.
conversationSchema.index({ item: 1, buyer: 1 }, { unique: true, partialFilterExpression: { item: { $exists: true } } });
conversationSchema.index({ pairKey: 1 }, { unique: true, partialFilterExpression: { pairKey: { $type: 'string' } } });
conversationSchema.index({ buyer: 1, lastMessageAt: -1 });
conversationSchema.index({ seller: 1, lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
