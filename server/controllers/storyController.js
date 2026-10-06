const Story = require('../models/Story');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { uploadMediaFile, deleteMedia } = require('../utils/cloudinary');

const AUTHOR_FIELDS = 'name role program profilePicture';
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

// Removes expired stories from the database and from Cloudinary.
const purgeExpiredStories = async () => {
  const expired = await Story.find({ expiresAt: { $lte: new Date() } }).select('media').lean();
  if (expired.length === 0) return;

  await Story.deleteMany({ _id: { $in: expired.map((story) => story._id) } });
  await deleteMedia(expired.map((story) => story.media));
};

const latestStoryTime = (group) => new Date(group.stories[group.stories.length - 1].createdAt).getTime();

exports.createStory = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) throw new AppError('Attach a photo or video for your story', 400);
  if (file.mimetype.startsWith('image/') && file.size > MAX_IMAGE_SIZE) {
    throw new AppError('Photos must be 10MB or smaller', 400);
  }

  const media = await uploadMediaFile(file, 'campus-connect/stories');

  let story;
  try {
    story = await Story.create({ author: req.user._id, media, caption: (req.body || {}).caption });
  } catch (error) {
    await deleteMedia([media]);
    throw error;
  }

  await story.populate('author', AUTHOR_FIELDS);
  res.status(201).json(story);
});

// Returns active stories grouped per author, newest author first, oldest story first.
exports.getStories = asyncHandler(async (req, res) => {
  purgeExpiredStories().catch((error) => console.error('Story cleanup failed:', error.message));

  const stories = await Story.find({ expiresAt: { $gt: new Date() } })
    .sort({ createdAt: 1 })
    .populate('author', AUTHOR_FIELDS)
    .lean();

  const groups = new Map();
  stories.forEach(({ author, ...story }) => {
    if (!author) return;
    const key = author._id.toString();
    if (!groups.has(key)) groups.set(key, { author, stories: [] });
    groups.get(key).stories.push(story);
  });

  const result = [...groups.values()].sort((a, b) => latestStoryTime(b) - latestStoryTime(a));
  res.status(200).json(result);
});

exports.deleteStory = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id);
  if (!story) throw new AppError('Story not found', 404);

  const isOwner = story.author.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'faculty') throw new AppError('Unauthorized to delete this story', 403);

  await story.deleteOne();
  await deleteMedia([story.media]);
  res.status(200).json({ message: 'Story deleted successfully' });
});