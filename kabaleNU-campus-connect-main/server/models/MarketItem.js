const mongoose = require('mongoose');

const MARKET_CATEGORIES = ['Electronics', 'Clothes', 'School Materials', 'Food', 'Home Items'];

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
    enum: { values: MARKET_CATEGORIES, message: `Category must be one of: ${MARKET_CATEGORIES.join(', ')}` },
  },
  image: {
    type: String,
    required: [true, 'Item photo is required'],
  },
  // The Cloudinary public id is empty for items whose photo was not uploaded through the app.
  imagePublicId: { type: String },
  status: {
    type: String,
    enum: { values: ['Available', 'Reserved', 'Sold'], message: 'Status must be Available, Reserved, or Sold' },
    default: 'Available',
  },
}, { timestamps: true });

module.exports = mongoose.model('MarketItem', marketItemSchema);
