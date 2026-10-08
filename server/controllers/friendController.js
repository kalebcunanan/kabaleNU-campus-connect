const mongoose = require('mongoose');
const Friendship = require('../models/Friendship');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { pairKeyOf } = require('../utils/pairKey');

const PUBLIC_FIELDS = 'name role program profilePicture';
const MIN_SEARCH_LENGTH = 2;
const MAX_SEARCH_RESULTS = 20;

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const assertValidId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid ID format', 400);
};

// Describes how the logged-in user relates to another user based on one friendship document.
const describeRelation = (friendship, userId) => {
  if (!friendship) return { friendStatus: 'none', friendshipId: null };
  if (friendship.status === 'accepted') return { friendStatus: 'friends', friendshipId: friendship._id };
  const sentByMe = String(friendship.requester) === String(userId);
  return { friendStatus: sentByMe ? 'pending_sent' : 'pending_received', friendshipId: friendship._id };
};

exports.searchUsers = asyncHandler(async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (q.length < MIN_SEARCH_LENGTH) return res.status(200).json([]);

  const users = await User.find({ _id: { $ne: req.user._id }, name: { $regex: escapeRegex(q), $options: 'i' } })
    .sort({ name: 1 })
    .limit(MAX_SEARCH_RESULTS)
    .select(PUBLIC_FIELDS)
    .lean();

  const friendships = await Friendship.find({
    pairKey: { $in: users.map((user) => pairKeyOf(req.user._id, user._id)) },
  }).lean();
  const byPair = new Map(friendships.map((friendship) => [friendship.pairKey, friendship]));

  res.status(200).json(
    users.map((user) => ({
      ...user,
      ...describeRelation(byPair.get(pairKeyOf(req.user._id, user._id)), req.user._id),
    }))
  );
});

exports.getFriends = asyncHandler(async (req, res) => {
  const friendships = await Friendship.find({
    status: 'accepted',
    $or: [{ requester: req.user._id }, { recipient: req.user._id }],
  })
    .populate('requester recipient', PUBLIC_FIELDS)
    .lean();

  const friends = friendships
    .map((friendship) => {
      const other = String(friendship.requester?._id) === String(req.user._id) ? friendship.recipient : friendship.requester;
      return other ? { ...other, friendshipId: friendship._id } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));

  res.status(200).json(friends);
});

exports.getRequests = asyncHandler(async (req, res) => {
  const requests = await Friendship.find({ recipient: req.user._id, status: 'pending' })
    .sort({ createdAt: -1 })
    .populate('requester', PUBLIC_FIELDS)
    .lean();

  res.status(200).json(
    requests
      .filter((request) => request.requester)
      .map((request) => ({ _id: request._id, createdAt: request.createdAt, user: request.requester }))
  );
});

exports.getRequestCount = asyncHandler(async (req, res) => {
  const count = await Friendship.countDocuments({ recipient: req.user._id, status: 'pending' });
  res.status(200).json({ count });
});

exports.getFriendStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  assertValidId(userId);
  if (req.user._id.equals(userId)) return res.status(200).json({ friendStatus: 'self', friendshipId: null });

  const friendship = await Friendship.findOne({ pairKey: pairKeyOf(req.user._id, userId) }).lean();
  res.status(200).json(describeRelation(friendship, req.user._id));
});

exports.sendRequest = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  assertValidId(userId);
  if (req.user._id.equals(userId)) throw new AppError('You cannot add yourself as a friend', 400);

  const target = await User.exists({ _id: userId });
  if (!target) throw new AppError('User not found', 404);

  const existing = await Friendship.findOne({ pairKey: pairKeyOf(req.user._id, userId) }).lean();
  if (existing) {
    const { friendStatus } = describeRelation(existing, req.user._id);
    const messages = {
      friends: 'You are already friends',
      pending_sent: 'Friend request already sent',
      pending_received: 'This user already sent you a request, check your requests',
    };
    throw new AppError(messages[friendStatus], 400);
  }

  let friendship;
  try {
    friendship = await Friendship.create({ requester: req.user._id, recipient: userId });
  } catch (error) {
    if (error.code === 11000) throw new AppError('A friend request already exists between you and this user', 400);
    throw error;
  }

  res.status(201).json({ friendshipId: friendship._id, friendStatus: 'pending_sent' });
});

exports.acceptRequest = asyncHandler(async (req, res) => {
  const friendship = await Friendship.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id, status: 'pending' },
    { $set: { status: 'accepted' } },
    { new: true }
  );
  if (!friendship) throw new AppError('Friend request not found', 404);

  res.status(200).json({ friendshipId: friendship._id, friendStatus: 'friends' });
});

// Lets the recipient decline a request or the sender cancel it.
exports.removeRequest = asyncHandler(async (req, res) => {
  const friendship = await Friendship.findOneAndDelete({
    _id: req.params.id,
    status: 'pending',
    $or: [{ recipient: req.user._id }, { requester: req.user._id }],
  });
  if (!friendship) throw new AppError('Friend request not found', 404);

  res.status(200).json({ message: 'Friend request removed' });
});

exports.removeFriend = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  assertValidId(userId);

  const result = await Friendship.deleteOne({ pairKey: pairKeyOf(req.user._id, userId), status: 'accepted' });
  if (result.deletedCount === 0) throw new AppError('Friendship not found', 404);

  res.status(200).json({ message: 'Friend removed' });
});
