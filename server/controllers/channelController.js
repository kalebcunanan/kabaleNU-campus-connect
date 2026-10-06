// server/controllers/channelController.js
const Channel = require('../models/Channel');
const Message = require('../models/Message');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

exports.getChannels = asyncHandler(async (req, res) => {
  const channels = await Channel.find().sort({ createdAt: -1 });
  res.status(200).json(channels);
});

exports.createChannel = asyncHandler(async (req, res) => {
  const channel = await Channel.create({
    ...req.body,
    createdBy: req.user._id
  });
  res.status(201).json(channel);
});

exports.getMessages = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 50;
  const messages = await Message.find({ channel: req.params.id })
    .sort({ createdAt: 1 })
    .limit(limit)
    .populate('sender', 'name role');
  res.status(200).json(messages);
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const channel = await Channel.findById(req.params.id);
  if (!channel) throw new AppError('Channel not found', 404);

  const message = await Message.create({
    channel: req.params.id,
    sender: req.user._id,
    content: req.body.content
  });
  res.status(201).json(message);
});

exports.deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findOneAndDelete({ _id: req.params.id, sender: req.user._id });
  if (!message) throw new AppError('Message not found or unauthorized', 403);
  res.status(200).json({ message: 'Message deleted successfully' });
});