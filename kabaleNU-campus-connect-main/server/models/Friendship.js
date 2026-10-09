const mongoose = require('mongoose');
const { pairKeyOf } = require('../utils/pairKey');

// One document exists per user pair, so a request can never be duplicated in either direction.
const friendshipSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Requester is required'] },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Recipient is required'] },
  status: {
    type: String,
    enum: { values: ['pending', 'accepted'], message: 'Invalid friendship status' },
    default: 'pending',
  },
  pairKey: { type: String, required: true, unique: true },
}, { timestamps: true });

// The pair key is always derived from the two users so it cannot be forged from the request body.
friendshipSchema.pre('validate', function () {
  if (this.requester && this.recipient) this.pairKey = pairKeyOf(this.requester, this.recipient);
});

friendshipSchema.index({ recipient: 1, status: 1, createdAt: -1 });
friendshipSchema.index({ requester: 1, status: 1 });

module.exports = mongoose.model('Friendship', friendshipSchema);
