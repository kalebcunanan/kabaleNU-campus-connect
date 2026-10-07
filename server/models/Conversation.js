const mongoose = require('mongoose');

// One direct conversation exists per buyer and marketplace item.
const conversationSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketItem', required: [true, 'Item is required'] },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Buyer is required'] },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Seller is required'] },
  // Both fields stay empty until the first message so empty threads never reach an inbox.
  lastMessage: { type: String, maxlength: [500, 'Message must be at most 500 characters'] },
  lastMessageAt: { type: Date, default: null },
}, { timestamps: true });

conversationSchema.index({ item: 1, buyer: 1 }, { unique: true });
conversationSchema.index({ buyer: 1, lastMessageAt: -1 });
conversationSchema.index({ seller: 1, lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
