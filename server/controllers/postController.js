// server/controllers/postController.js
const Post = require('../models/Post');
const Reaction = require('../models/Reaction');
const Comment = require('../models/Comment');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const calculateHotness = require('../utils/hotness');

exports.createPost = asyncHandler(async (req, res) => {
  const post = await Post.create({
    author: req.user._id,
    content: req.body.content
  });
  // Award +5 bulldogScore to the author
  await User.findByIdAndUpdate(req.user._id, { $inc: { bulldogScore: 5 } });
  res.status(201).json(post);
});

exports.getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ status: 'active' })
    .sort({ createdAt: -1 })
    .populate('author', 'name role');
  res.status(200).json(posts);
});

exports.getTrendingPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ status: 'active' }).populate('author', 'name role').lean();
  
  const trending = posts.map(post => {
    post.hotness = calculateHotness(post.bulldogReacts, post.commentCount, post.createdAt);
    return post;
  }).sort((a, b) => b.hotness - a.hotness);

  res.status(200).json(trending);
});

exports.getPost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, status: 'active' }).populate('author', 'name role');
  if (!post) throw new AppError('Post not found', 404);
  res.status(200).json(post);
});

exports.updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, author: req.user._id },
    { content: req.body.content },
    { new: true, runValidators: true }
  );
  if (!post) throw new AppError('Post not found or you are not the owner', 403);
  res.status(200).json(post);
});

exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user._id });
  if (!post) throw new AppError('Post not found or you are not the owner', 403);
  
  // Cleanup references
  await Reaction.deleteMany({ post: post._id });
  await Comment.deleteMany({ post: post._id });
  
  res.status(200).json({ message: 'Post deleted successfully' });
});

exports.reactToPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.status !== 'active') throw new AppError('Post not found', 404);
  if (post.author.toString() === req.user._id.toString()) throw new AppError('Cannot react to your own post', 400);

  const existingReact = await Reaction.findOne({ user: req.user._id, post: post._id });
  if (existingReact) throw new AppError('Already reacted to this post', 400);

  await Reaction.create({ user: req.user._id, post: post._id });
  await Post.findByIdAndUpdate(post._id, { $inc: { bulldogReacts: 1 } });
  await User.findByIdAndUpdate(post.author, { $inc: { bulldogScore: 1 } });

  res.status(200).json({ message: 'Reacted successfully' });
});

exports.unreactToPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError('Post not found', 404);

  const reaction = await Reaction.findOneAndDelete({ user: req.user._id, post: post._id });
  if (!reaction) throw new AppError('No reaction found', 400);

  await Post.findByIdAndUpdate(post._id, { $inc: { bulldogReacts: -1 } });
  await User.findByIdAndUpdate(post.author, { $inc: { bulldogScore: -1 } });

  res.status(200).json({ message: 'Reaction removed' });
});

exports.reportPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.status !== 'active') throw new AppError('Post not found', 404);
  if (post.reportedBy.includes(req.user._id)) throw new AppError('You have already reported this post', 400);

  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    { 
      $addToSet: { reportedBy: req.user._id },
      $inc: { reportCount: 1 }
    },
    { new: true }
  );

  if (updatedPost.reportCount >= 5) {
    updatedPost.status = 'hidden';
    await updatedPost.save();
  }

  res.status(200).json({ message: 'Post reported successfully' });
});