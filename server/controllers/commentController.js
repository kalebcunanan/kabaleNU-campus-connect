const Comment = require('../models/Comment');
const Post = require('../models/Post');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const AUTHOR_FIELDS = 'name role program profilePicture';

exports.getComments = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, status: 'active' }).select('_id');
  if (!post) throw new AppError('Post not found', 404);

  const comments = await Comment.find({ post: post._id })
    .sort({ createdAt: -1 })
    .populate('author', AUTHOR_FIELDS);
  res.status(200).json(comments);
});

exports.addComment = asyncHandler(async (req, res) => {
  const { content } = req.body || {};
  const post = await Post.findById(req.params.id);
  if (!post || post.status !== 'active') throw new AppError('Post not found', 404);

  const comment = await Comment.create({
    post: post._id,
    author: req.user._id,
    content,
  });

  await Post.findByIdAndUpdate(post._id, { $inc: { commentCount: 1 } });
  await comment.populate('author', AUTHOR_FIELDS);
  res.status(201).json(comment);
});

exports.deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new AppError('Comment not found', 404);

  const isOwner = comment.author.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'faculty') throw new AppError('Unauthorized to delete this comment', 403);

  await comment.deleteOne();
  await Post.findOneAndUpdate({ _id: comment.post, commentCount: { $gt: 0 } }, { $inc: { commentCount: -1 } });
  res.status(200).json({ message: 'Comment deleted successfully' });
});