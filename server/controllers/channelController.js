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
  // S3: Explicit fields only
  const { name, description, category } = req.body;

  // S17: Magbigay ng malinaw na message para sa duplicate channel names
  if (name) {
    const existing = await Channel.findOne({ name });
    if (existing) {
      throw new AppError('Channel name is already taken', 400);
    }
  }

  const channel = await Channel.create({
    name,
    description,
    category,
    createdBy: req.user._id
  });
  res.status(201).json(channel);
});

exports.getMessages = asyncHandler(async (req, res) => {
  // S26: Siguraduhing existing ang channel
  const channel = await Channel.findById(req.params.id);
  if (!channel) throw new AppError('Channel not found', 404);

  // Parse limit nang tama
  let limit = 50;
  if (req.query.limit && !isNaN(parseInt(req.query.limit))) {
    limit = parseInt(req.query.limit);
  }

  // S5: Kunin ang newest messages muna, i-limit, tapos i-reverse para sa UI
  const messages = await Message.find({ channel: req.params.id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'name role');

  res.status(200).json(messages.reverse());
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
  // S9: Find by ID muna
  const message = await Message.findById(req.params.id);
  if (!message) throw new AppError('Message not found', 404);

  // S9: Owner o Faculty lang ang pwede mag-delete
  if (message.sender.toString() !== req.user._id.toString() && req.user.role !== 'faculty') {
    throw new AppError('Unauthorized to delete this message', 403);
  }

  await message.deleteOne();
  res.status(200).json({ message: 'Message deleted successfully' });
});