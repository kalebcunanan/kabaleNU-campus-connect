// server/controllers/marketController.js
const MarketItem = require('../models/MarketItem');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { uploadMediaFile, deleteMedia } = require('../utils/cloudinary');

const SELLER_FIELDS = 'name profilePicture';
const MARKET_FOLDER = 'campus-connect/market';

// Each status maps to the statuses a seller may move the item to next.
const ALLOWED_TRANSITIONS = {
  Available: ['Reserved', 'Sold'],
  Reserved: ['Available', 'Sold'],
  Sold: [],
};

// Escapes regex characters so a search keyword cannot break the query.
const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Builds the media list for the item photo, or an empty list when it has no stored public id.
const imageMedia = (item) => (item.imagePublicId ? [{ publicId: item.imagePublicId, type: 'image' }] : []);

exports.createItem = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Item photo is required', 400);

  const { title, price, category } = req.body || {};
  const media = await uploadMediaFile(req.file, MARKET_FOLDER);

  try {
    const item = await MarketItem.create({
      title,
      price,
      category,
      image: media.url,
      imagePublicId: media.publicId,
      seller: req.user._id,
    });
    res.status(201).json(item);
  } catch (error) {
    // A failed create must not leave the uploaded photo behind.
    await deleteMedia([media]);
    throw error;
  }
});

exports.getItems = asyncHandler(async (req, res) => {
  const items = await MarketItem.find().sort({ createdAt: -1 }).populate('seller', SELLER_FIELDS);
  res.status(200).json(items);
});

exports.getItem = asyncHandler(async (req, res) => {
  const item = await MarketItem.findById(req.params.id).populate('seller', SELLER_FIELDS);
  if (!item) throw new AppError('Item not found', 404);
  res.status(200).json(item);
});

exports.updateItem = asyncHandler(async (req, res) => {
  const item = await MarketItem.findById(req.params.id);
  if (!item) throw new AppError('Item not found', 404);

  if (item.seller.toString() !== req.user._id.toString()) {
    throw new AppError('Unauthorized to update this item', 403);
  }

  const { title, price, category } = req.body || {};
  if (title) item.title = title;
  if (price !== undefined) item.price = price;
  if (category) item.category = category;

  const previousMedia = imageMedia(item);
  const uploaded = req.file ? await uploadMediaFile(req.file, MARKET_FOLDER) : null;
  if (uploaded) {
    item.image = uploaded.url;
    item.imagePublicId = uploaded.publicId;
  }

  try {
    await item.save();
  } catch (error) {
    if (uploaded) await deleteMedia([uploaded]);
    throw error;
  }

  if (uploaded) await deleteMedia(previousMedia);
  res.status(200).json(item);
});

exports.deleteItem = asyncHandler(async (req, res) => {
  const item = await MarketItem.findById(req.params.id);
  if (!item) throw new AppError('Item not found', 404);

  if (item.seller.toString() !== req.user._id.toString() && req.user.role !== 'faculty') {
    throw new AppError('Unauthorized to delete this item', 403);
  }

  // Direct conversations about the item and their messages are removed with it.
  const conversations = await Conversation.find({ item: item._id }).select('_id').lean();
  await Promise.all([
    Message.deleteMany({ conversation: { $in: conversations.map((conversation) => conversation._id) } }),
    Conversation.deleteMany({ item: item._id }),
    item.deleteOne(),
  ]);

  await deleteMedia(imageMedia(item));
  res.status(200).json({ message: 'Item deleted' });
});

// PROCESSING 3: Multi-criteria Search with Computations
exports.searchItems = asyncHandler(async (req, res) => {
  const { category, status, minPrice, maxPrice, q, sort } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (status) filter.status = status;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (typeof q === 'string' && q) filter.title = { $regex: escapeRegex(q), $options: 'i' };

  let query = MarketItem.find(filter).populate('seller', SELLER_FIELDS);
  if (sort === 'priceAsc') query = query.sort({ price: 1 });
  else if (sort === 'priceDesc') query = query.sort({ price: -1 });
  else query = query.sort({ createdAt: -1 });

  const items = await query;

  let averagePrice = 0, lowestPrice = 0, highestPrice = 0;
  if (items.length > 0) {
    const prices = items.map((item) => item.price);
    lowestPrice = Math.min(...prices);
    highestPrice = Math.max(...prices);
    const rawAverage = prices.reduce((a, b) => a + b, 0) / items.length;
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
  const { status } = req.body || {};
  const item = await MarketItem.findById(req.params.id);
  if (!item) throw new AppError('Item not found', 404);

  if (item.seller.toString() !== req.user._id.toString()) {
    throw new AppError('Unauthorized to update this item', 403);
  }

  if (!ALLOWED_TRANSITIONS[item.status].includes(status)) {
    throw new AppError(`Invalid status transition from ${item.status} to ${status}`, 400);
  }

  item.status = status;
  await item.save();

  res.status(200).json(item);
});
