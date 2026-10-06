// server/controllers/commentController.js
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

exports.getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.id })
    .sort({ createdAt: -1 })
    .populate('author', 'name role');
  res.status(200).json(comments);
});

exports.addComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.status !== 'active') throw new AppError('Post not found', 404);

  const comment = await Comment.create({
    post: req.params.id,
    author: req.user._id,
    content: req.body.content
  });

  await Post.findByIdAndUpdate(req.params.id, { $inc: { commentCount: 1 } });
  res.status(201).json(comment);
});

exports.deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findOneAndDelete({ _id: req.params.id, author: req.user._id });
  if (!comment) throw new AppError('Comment not found or unauthorized', 403);

  await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });
  res.status(200).json({ message: 'Comment deleted successfully' });
});