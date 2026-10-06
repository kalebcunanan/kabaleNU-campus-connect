const mongoose = require('mongoose');

const marketItemSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, maxlength: 100 },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, enum: ['Books', 'Uniforms', 'Electronics', 'Others'], required: true },
  status: { type: String, enum: ['Available', 'Reserved', 'Sold'], default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('MarketItem', marketItemSchema);