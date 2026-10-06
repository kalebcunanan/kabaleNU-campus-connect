const mongoose = require('mongoose');

const marketItemSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Seller is required'] },
  title: {
    type: String,
    required: [true, 'Item title is required'],
    trim: true,
    maxlength: [100, 'Item title must be at most 100 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: { values: ['Books', 'Uniforms', 'Electronics', 'Others'], message: 'Category must be Books, Uniforms, Electronics, or Others' },
  },
  status: {
    type: String,
    enum: { values: ['Available', 'Reserved', 'Sold'], message: 'Status must be Available, Reserved, or Sold' },
    default: 'Available',
  },
}, { timestamps: true });

module.exports = mongoose.model('MarketItem', marketItemSchema);
