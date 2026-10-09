const mongoose = require('mongoose');
const Post = require('../models/Post');
const Reaction = require('../models/Reaction');
const Comment = require('../models/Comment');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const calculateHotness = require('../utils/hotness');
const areFriends = require('../utils/areFriends');
const { uploadMedia, deleteMedia } = require('../utils/cloudinary');

const AUTHOR_FIELDS = 'name role program profilePicture';
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

exports.createPost = asyncHandler(async (req, res) => {
  const { content = '' } = req.body || {};
  const files = req.files || [];

  if (!content.trim() && files.length === 0) {
    throw new AppError('Write something or attach a photo or video', 400);
  }
  if (files.some((file) => file.mimetype.startsWith('image/') && file.size > MAX_IMAGE_SIZE)) {
    throw new AppError('Photos must be 10MB or smaller', 400);
  }

  const media = await uploadMedia(files);

  let post;
  try {
    post = await Post.create({ author: req.user._id, content, media });
  } catch (error) {
    await deleteMedia(media);
    throw error;
  }

  await User.findByIdAndUpdate(req.user._id, { $inc: { bulldogScore: 5 } });

  // The client prepends this post to the feed, so it must include the populated author.
  const created = await Post.findById(post._id).populate('author', AUTHOR_FIELDS).lean();
  res.status(201).json({ ...created, hasReacted: false });
});

exports.getPosts = asyncHandler(async (req, res) => {
  // An optional author query narrows the list to one user and is limited to friends.
  const { author } = req.query;
  const filter = { status: 'active' };
  if (typeof author === 'string' && author) {
    if (!mongoose.isValidObjectId(author)) throw new AppError('Invalid ID format', 400);

    // A profile feed is private: only the owner, their friends, and faculty may read it.
    const canView = req.user._id.equals(author) || req.user.role === 'faculty' || await areFriends(req.user._id, author);
    if (!canView) throw new AppError('Only friends can see these posts', 403);

    filter.author = author;
  }

  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .populate('author', AUTHOR_FIELDS)
    .lean();

  const userReacts = await Reaction.find({ user: req.user._id }).select('post');
  const reactedPostIds = userReacts.map((r) => r.post.toString());

  const updatedPosts = posts.map((post) => {
    post.hasReacted = reactedPostIds.includes(post._id.toString());
    return post;
  });

  res.status(200).json(updatedPosts);
});

exports.getTrendingPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ status: 'active' }).populate('author', AUTHOR_FIELDS).lean();

  const userReacts = await Reaction.find({ user: req.user._id }).select('post');
  const reactedPostIds = userReacts.map((r) => r.post.toString());

  const trending = posts
    .map((post) => {
      post.hotness = calculateHotness(post.bulldogReacts, post.commentCount, post.createdAt);
      post.hasReacted = reactedPostIds.includes(post._id.toString());
      return post;
    })
    .sort((a, b) => b.hotness - a.hotness);

  res.status(200).json(trending);
});

exports.getPost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, status: 'active' }).populate('author', AUTHOR_FIELDS).lean();
  if (!post) throw new AppError('Post not found', 404);

  const reaction = await Reaction.findOne({ user: req.user._id, post: post._id });
  post.hasReacted = !!reaction;

  res.status(200).json(post);
});

exports.updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError('Post not found', 404);

  if (post.author.toString() !== req.user._id.toString()) {
    throw new AppError('Unauthorized to update this post', 403);
  }

  const { content } = req.body || {};
  if (content !== undefined) post.content = content;
  await post.save();
  res.status(200).json(post);
});

exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError('Post not found', 404);

  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'faculty') {
    throw new AppError('Unauthorized to delete this post', 403);
  }

  await post.deleteOne();
  await Reaction.deleteMany({ post: post._id });
  await Comment.deleteMany({ post: post._id });
  await deleteMedia(post.media);

  res.status(200).json({ message: 'Post deleted successfully' });
});

// React is a toggle: the first call adds the reaction and the next call removes it.
exports.reactToPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.status !== 'active') throw new AppError('Post not found', 404);

  const removed = await Reaction.findOneAndDelete({ user: req.user._id, post: post._id });

  if (removed) {
    await Promise.all([
      Post.updateOne({ _id: post._id, bulldogReacts: { $gt: 0 } }, { $inc: { bulldogReacts: -1 } }),
      User.updateOne({ _id: post.author, bulldogScore: { $gt: 0 } }, { $inc: { bulldogScore: -1 } }),
    ]);
    return res.status(200).json({ message: 'Reaction removed', hasReacted: false });
  }

  await Reaction.create({ user: req.user._id, post: post._id });
  await Promise.all([
    Post.updateOne({ _id: post._id }, { $inc: { bulldogReacts: 1 } }),
    User.updateOne({ _id: post.author }, { $inc: { bulldogScore: 1 } }),
  ]);
  res.status(200).json({ message: 'Reacted successfully', hasReacted: true });
});

exports.reportPost = asyncHandler(async (req, res) => {
  // One atomic update rejects missing, hidden, and already-reported posts at the same time.
  const updatedPost = await Post.findOneAndUpdate(
    { _id: req.params.id, status: 'active', reportedBy: { $ne: req.user._id } },
    { $addToSet: { reportedBy: req.user._id }, $inc: { reportCount: 1 } },
    { new: true }
  );

  if (!updatedPost) {
    const exists = await Post.findById(req.params.id).select('status');
    if (!exists || exists.status !== 'active') throw new AppError('Post not found', 404);
    throw new AppError('You have already reported this post', 400);
  }

  if (updatedPost.reportCount >= 5) {
    await Post.updateOne({ _id: updatedPost._id }, { status: 'hidden' });
  }

  res.status(200).json({ message: 'Post reported successfully' });
});