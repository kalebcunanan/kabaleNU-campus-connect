// server/controllers/channelController.js
const Channel = require('../models/Channel');
const Message = require('../models/Message');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const CREATOR_FIELDS = 'name role program profilePicture';
const SENDER_FIELDS = 'name role profilePicture';
const DEFAULT_MESSAGE_LIMIT = 50;
const MAX_MESSAGE_LIMIT = 100;

// Adds memberCount and isMember to a plain channel object and hides the members list.
const formatChannel = (channel, userId) => {
  const { members = [], ...rest } = channel;
  return { ...rest, memberCount: members.length, isMember: members.some((id) => id.equals(userId)) };
};

// Loads a channel for reading or sending messages and rejects users who have not joined it.
const loadMemberChannel = async (channelId, userId) => {
  const channel = await Channel.findById(channelId).select('members');
  if (!channel) throw new AppError('Channel not found', 404);
  if (!channel.members.some((id) => id.equals(userId))) {
    throw new AppError('Join this channel to read and send messages', 403);
  }
  return channel;
};

exports.getChannels = asyncHandler(async (req, res) => {
  const channels = await Channel.find()
    .sort({ createdAt: -1 })
    .populate('createdBy', CREATOR_FIELDS)
    .lean();
  res.status(200).json(channels.map((channel) => formatChannel(channel, req.user._id)));
});

exports.getChannel = asyncHandler(async (req, res) => {
  const channel = await Channel.findById(req.params.id).populate('createdBy', CREATOR_FIELDS).lean();
  if (!channel) throw new AppError('Channel not found', 404);
  res.status(200).json(formatChannel(channel, req.user._id));
});

exports.createChannel = asyncHandler(async (req, res) => {
  const { name, description, category } = req.body || {};

  if (typeof name === 'string' && (await Channel.findOne({ name: name.trim() }))) {
    throw new AppError('Channel name is already taken', 400);
  }

  const channel = await Channel.create({
    name,
    description,
    category,
    createdBy: req.user._id,
    members: [req.user._id],
  });
  await channel.populate('createdBy', CREATOR_FIELDS);
  res.status(201).json(formatChannel(channel.toObject(), req.user._id));
});

exports.deleteChannel = asyncHandler(async (req, res) => {
  const channel = await Channel.findById(req.params.id).select('createdBy');
  if (!channel) throw new AppError('Channel not found', 404);
  if (!channel.createdBy.equals(req.user._id)) {
    throw new AppError('Only the channel creator can delete this channel', 403);
  }

  await Channel.deleteOne({ _id: channel._id });
  await Message.deleteMany({ channel: channel._id });
  res.status(200).json({ message: 'Channel deleted successfully' });
});

exports.joinChannel = asyncHandler(async (req, res) => {
  const channel = await Channel.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { members: req.user._id } },
    { new: true }
  ).populate('createdBy', CREATOR_FIELDS).lean();
  if (!channel) throw new AppError('Channel not found', 404);
  res.status(200).json(formatChannel(channel, req.user._id));
});

exports.leaveChannel = asyncHandler(async (req, res) => {
  const existing = await Channel.findById(req.params.id).select('createdBy');
  if (!existing) throw new AppError('Channel not found', 404);
  if (existing.createdBy.equals(req.user._id)) {
    throw new AppError('The creator cannot leave the channel. Delete it instead', 400);
  }

  const channel = await Channel.findByIdAndUpdate(
    req.params.id,
    { $pull: { members: req.user._id } },
    { new: true }
  ).populate('createdBy', CREATOR_FIELDS).lean();
  if (!channel) throw new AppError('Channel not found', 404);
  res.status(200).json(formatChannel(channel, req.user._id));
});

exports.getMessages = asyncHandler(async (req, res) => {
  const channel = await loadMemberChannel(req.params.id, req.user._id);

  const requested = parseInt(req.query.limit, 10);
  const limit = Number.isNaN(requested) || requested < 1
    ? DEFAULT_MESSAGE_LIMIT
    : Math.min(requested, MAX_MESSAGE_LIMIT);

  // Newest messages are fetched first and then reversed so the UI receives them oldest first.
  const messages = await Message.find({ channel: channel._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', SENDER_FIELDS);

  res.status(200).json(messages.reverse());
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const channel = await loadMemberChannel(req.params.id, req.user._id);
  const { content } = req.body || {};

  const message = await Message.create({
    channel: channel._id,
    sender: req.user._id,
    content,
  });
  await message.populate('sender', SENDER_FIELDS);
  res.status(201).json(message);
});

exports.deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) throw new AppError('Message not found', 404);

  // Only the sender or a faculty account may delete a message.
  if (message.sender.toString() !== req.user._id.toString() && req.user.role !== 'faculty') {
    throw new AppError('Unauthorized to delete this message', 403);
  }

  await message.deleteOne();
  res.status(200).json({ message: 'Message deleted successfully' });
});
