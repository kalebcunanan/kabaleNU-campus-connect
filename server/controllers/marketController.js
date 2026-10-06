// server/controllers/marketController.js
const MarketItem = require('../models/MarketItem');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Helper function para i-escape ang regex characters
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

exports.createItem = asyncHandler(async (req, res) => {
  // S3: Explicit fields only
  const { title, price, category } = req.body;
  const item = await MarketItem.create({
    title,
    price,
    category,
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
  // S9: Find by ID muna
  const item = await MarketItem.findById(req.params.id);
  if (!item) throw new AppError('Item not found', 404);

  // S9: Owner check (seller only)
  if (item.seller.toString() !== req.user._id.toString()) {
    throw new AppError('Unauthorized to update this item', 403);
  }

  // S3: Explicit fields only
  const { title, price, category } = req.body;
  if (title) item.title = title;
  if (price !== undefined) item.price = price;
  if (category) item.category = category;

  await item.save();
  res.status(200).json(item);
});

exports.deleteItem = asyncHandler(async (req, res) => {
  // S9: Find by ID muna
  const item = await MarketItem.findById(req.params.id);
  if (!item) throw new AppError('Item not found', 404);

  // S9: Owner check OR Faculty override
  if (item.seller.toString() !== req.user._id.toString() && req.user.role !== 'faculty') {
    throw new AppError('Unauthorized to delete this item', 403);
  }

  await item.deleteOne();
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
  // S12: I-escape ang regex para hindi mag-crash
  if (q) filter.title = { $regex: escapeRegex(q),$options: 'i' };

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
    const rawAverage = prices.reduce((a, b) => a + b, 0) / items.length;
    // S12: I-round off ang average price
    averagePrice = Math.round(rawAverage * 100) / 100;
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
  // S9: Find by ID muna
  const item = await MarketItem.findById(req.params.id);
  if (!item) throw new AppError('Item not found', 404);

  // S9: Owner check (seller only)
  if (item.seller.toString() !== req.user._id.toString()) {
     throw new AppError('Unauthorized to update this item', 403);
  }

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