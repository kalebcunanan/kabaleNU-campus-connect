const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Reaction = require('../models/Reaction');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const MarketItem = require('../models/MarketItem');
const Message = require('../models/Message');
const Story = require('../models/Story');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { uploadBuffer, deleteMedia } = require('../utils/cloudinary');
const { isValidProgram } = require('../utils/programs');

const PUBLIC_FIELDS = 'name role program profilePicture bulldogScore createdAt';

const isSelfOrFaculty = (req) =>
  req.params.id === req.user._id.toString() || req.user.role === 'faculty';

// Decrements a counter by one for each id, never below zero.
const decrementCounts = (Model, ids, field) => {
  if (!ids.length) return null;
  return Model.bulkWrite(
    ids.map((id) => ({
      updateOne: { filter: { _id: id, [field]: { $gt: 0 } }, update: { $inc: { [field]: -1 } } },
    }))
  );
};

// Frees the slots of the user's active registrations without exceeding capacity.
const restoreSlots = (eventIds) => {
  if (!eventIds.length) return null;
  return Event.bulkWrite(
    eventIds.map((id) => ({
      updateOne: {
        filter: { _id: id, $expr: { $lt: ['$slotsRemaining', '$capacity'] } },
        update: { $inc: { slotsRemaining: 1 } },
      },
    }))
  );
};

exports.getLeaderboard = asyncHandler(async (req, res) => {
  const topStudents = await User.find({ role: { $in: ['bulldog', 'bullpup'] } })
    .sort({ bulldogScore: -1, createdAt: 1 })
    .limit(10)
    .select(PUBLIC_FIELDS)
    .lean();

  res.status(200).json(topStudents.map((student, index) => ({ ...student, rank: index + 1 })));
});

exports.getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ user: req.user._id, status: 'registered' }).populate('event');
  res.status(200).json(registrations);
});

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).select('-password');
  res.status(200).json(users);
});

exports.getUser = asyncHandler(async (req, res) => {
  const fields = isSelfOrFaculty(req) ? '-password' : PUBLIC_FIELDS;
  const user = await User.findById(req.params.id).select(fields);
  if (!user) throw new AppError('User not found', 404);
  res.status(200).json(user);
});

exports.updateUser = asyncHandler(async (req, res) => {
  if (!isSelfOrFaculty(req)) throw new AppError('Unauthorized to update this user', 403);

  const user = await User.findById(req.params.id).select('-password');
  if (!user) throw new AppError('User not found', 404);

  const { name, email, program } = req.body || {};
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;

  if (program !== undefined) {
    if (!isValidProgram(user.role, program)) {
      throw new AppError('Selected program does not match the student type', 400);
    }
    user.program = program;
  }

  if (req.file) {
    const result = await uploadBuffer(req.file.buffer, 'campus-connect/avatars');
    user.profilePicture = result.secure_url;
  }

  await user.save();
  res.status(200).json(user);
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'faculty') throw new AppError('Faculty accounts cannot be deleted', 400);

  const userId = user._id;
  const [posts, comments, reactions, registrations, stories] = await Promise.all([
    Post.find({ author: userId }).select('_id media').lean(),
    Comment.find({ author: userId }).select('post'),
    Reaction.find({ user: userId }).select('post'),
    Registration.find({ user: userId, status: 'registered' }).select('event'),
    Story.find({ author: userId }).select('media').lean(),
  ]);
  const postIds = posts.map((p) => p._id);

  await Promise.all([
    decrementCounts(Post, comments.map((c) => c.post), 'commentCount'),
    decrementCounts(Post, reactions.map((r) => r.post), 'bulldogReacts'),
    restoreSlots(registrations.map((r) => r.event)),
  ]);

  await Promise.all([
    Reaction.deleteMany({ $or: [{ user: userId }, { post: { $in: postIds } }] }),
    Comment.deleteMany({ $or: [{ author: userId }, { post: { $in: postIds } }] }),
    Post.deleteMany({ author: userId }),
    Registration.deleteMany({ user: userId }),
    MarketItem.deleteMany({ seller: userId }),
    Message.deleteMany({ sender: userId }),
    Story.deleteMany({ author: userId }),
  ]);

  // Cloudinary cleanup for the user's post and story files.
  await deleteMedia([...posts.flatMap((post) => post.media || []), ...stories.map((story) => story.media)]);

  await user.deleteOne();

  res.status(200).json({ message: 'User deleted successfully' });
});