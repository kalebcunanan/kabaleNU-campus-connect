// server/controllers/conversationController.js
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const MarketItem = require('../models/MarketItem');
const Message = require('../models/Message');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const areFriends = require('../utils/areFriends');
const { pairKeyOf } = require('../utils/pairKey');

const USER_FIELDS = 'name profilePicture';
const DEFAULT_MESSAGE_LIMIT = 50;
const MAX_MESSAGE_LIMIT = 100;

// The item is null for direct friend chats.
const CONVERSATION_POPULATE = [
  { path: 'item', select: 'title image price status' },
  { path: 'buyer', select: USER_FIELDS },
  { path: 'seller', select: USER_FIELDS },
];

// Loads a conversation and rejects anyone who is not its buyer or seller.
const loadConversation = async (id, userId) => {
  const conversation = await Conversation.findById(id);
  if (!conversation) throw new AppError('Conversation not found', 404);

  const isParticipant = conversation.buyer.equals(userId) || conversation.seller.equals(userId);
  if (!isParticipant) throw new AppError('You are not part of this conversation', 403);

  return conversation;
};

// Finds or creates the conversation between the logged-in buyer and the item's seller.
exports.startConversation = asyncHandler(async (req, res) => {
  const { itemId } = req.body || {};
  const item = await MarketItem.findById(itemId);
  if (!item) throw new AppError('Item not found', 404);
  if (item.seller.equals(req.user._id)) throw new AppError('You cannot message yourself about your own item', 400);
  if (item.status === 'Sold') throw new AppError('This item has already been sold', 400);

  const conversation = await Conversation.findOneAndUpdate(
    { item: item._id, buyer: req.user._id },
    { $setOnInsert: { seller: item.seller } },
    { new: true, upsert: true }
  );

  await conversation.populate(CONVERSATION_POPULATE);
  res.status(200).json(conversation);
});

// Finds or creates the direct conversation between the logged-in user and one of their friends.
exports.startDirectConversation = asyncHandler(async (req, res) => {
  const { friendId } = req.body || {};
  if (!mongoose.isValidObjectId(friendId)) throw new AppError('Invalid ID format', 400);
  if (req.user._id.equals(friendId)) throw new AppError('You cannot message yourself', 400);
  if (!(await areFriends(req.user._id, friendId))) throw new AppError('You can only message your friends', 403);

  const conversation = await Conversation.findOneAndUpdate(
    { pairKey: pairKeyOf(req.user._id, friendId) },
    { $setOnInsert: { buyer: req.user._id, seller: friendId } },
    { new: true, upsert: true }
  );

  await conversation.populate(CONVERSATION_POPULATE);
  res.status(200).json(conversation);
});

// Lists the logged-in user's conversations that already have messages, newest first.
exports.getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    $or: [{ buyer: req.user._id }, { seller: req.user._id }],
    lastMessageAt: { $ne: null },
  })
    .sort({ lastMessageAt: -1 })
    .populate(CONVERSATION_POPULATE);

  res.status(200).json(conversations);
});

exports.getConversationMessages = asyncHandler(async (req, res) => {
  const conversation = await loadConversation(req.params.id, req.user._id);

  const limit = Math.min(parseInt(req.query.limit, 10) || DEFAULT_MESSAGE_LIMIT, MAX_MESSAGE_LIMIT);

  // The newest messages are fetched first, then reversed so the oldest one comes first.
  const messages = await Message.find({ conversation: conversation._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', USER_FIELDS);

  res.status(200).json(messages.reverse());
});

exports.sendConversationMessage = asyncHandler(async (req, res) => {
  const conversation = await loadConversation(req.params.id, req.user._id);

  // A direct chat stays readable after an unfriend, but new messages are blocked.
  if (!conversation.item && !(await areFriends(conversation.buyer, conversation.seller))) {
    throw new AppError('You can only message your friends', 403);
  }

  const { content } = req.body || {};

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    content,
  });

  await Conversation.updateOne(
    { _id: conversation._id },
    { $set: { lastMessage: message.content, lastMessageAt: message.createdAt } }
  );

  await message.populate('sender', USER_FIELDS);
  res.status(201).json(message);
});
