// server/controllers/marketController.js
const MarketItem = require('../models/MarketItem');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

exports.createItem = asyncHandler(async (req, res) => {
  const item = await MarketItem.create({
    ...req.body,
    seller: req.user._id
  });
  res.status(201).json(item);
});

exports.getItems = asyncHandler(async (req, res) => {
  const items = await MarketItem.find().sort({ createdAt: -1 }).populate('seller', 'name');
  res.status(200).json(items);
});

exports.getItem = asyncHandler(async (req, res) => {
  const item = await MarketItem.findById(req.params.id).populate('seller', 'name');
  if (!item) throw new AppError('Item not found', 404);
  res.status(200).json(item);
});

exports.updateItem = asyncHandler(async (req, res) => {
  const item = await MarketItem.findOneAndUpdate(
    { _id: req.params.id, seller: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!item) throw new AppError('Item not found or unauthorized', 403);
  res.status(200).json(item);
});

exports.deleteItem = asyncHandler(async (req, res) => {
  const item = await MarketItem.findOneAndDelete({ _id: req.params.id, seller: req.user._id });
  if (!item) throw new AppError('Item not found or unauthorized', 403);
  res.status(200).json({ message: 'Item deleted' });
});

// PROCESSING 3: Multi-criteria Search with Computations
exports.searchItems = asyncHandler(async (req, res) => {
  const { category, status, minPrice, maxPrice, q, sort } = req.query;
  let filter = {};

  if (category) filter.category = category;
  if (status) filter.status = status;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (q) filter.title = { $regex: q,$options: 'i' };

  let query = MarketItem.find(filter).populate('seller', 'name');
  if (sort === 'priceAsc') query = query.sort({ price: 1 });
  else if (sort === 'priceDesc') query = query.sort({ price: -1 });
  else query = query.sort({ createdAt: -1 });

  const items = await query;

  // Compute derived values
  let averagePrice = 0, lowestPrice = 0, highestPrice = 0;
  if (items.length > 0) {
    const prices = items.map(i => i.price);
    lowestPrice = Math.min(...prices);
    highestPrice = Math.max(...prices);
    averagePrice = prices.reduce((a, b) => a + b, 0) / items.length;
  }

  res.status(200).json({ 
    count: items.length, 
    averagePrice, 
    lowestPrice, 
    highestPrice, 
    items 
  });
});

// PROCESSING 4: Rule-based Status Transition
exports.updateItemStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const item = await MarketItem.findOne({ _id: req.params.id, seller: req.user._id });
  
  if (!item) throw new AppError('Item not found or unauthorized', 403);

  // Transition Rules: Available -> Reserved -> Sold, and Reserved -> Available
  const current = item.status;
  const isValid = 
    (current === 'Available' && status === 'Reserved') ||
    (current === 'Reserved' && status === 'Sold') ||
    (current === 'Reserved' && status === 'Available');

  if (!isValid) {
    throw new AppError(`Invalid status transition from ${current} to ${status}`, 400);
  }

  item.status = status;
  await item.save();

  res.status(200).json(item);
});