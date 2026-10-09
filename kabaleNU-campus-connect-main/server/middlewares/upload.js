const multer = require('multer');
const AppError = require('../utils/AppError');

const MAX_POST_FILES = 4;

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new AppError('Only image files are allowed', 400)),
});

const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024, files: MAX_POST_FILES },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')
      ? cb(null, true)
      : cb(new AppError('Only photos and videos are allowed', 400)),
});

// Accepts one optional image in the profilePicture field.
const uploadAvatar = imageUpload.single('profilePicture');

// Accepts up to 4 photos or videos in the media field.
const uploadPostMedia = mediaUpload.array('media', MAX_POST_FILES);

// Accepts one photo or video in the media field.
const uploadStoryMedia = mediaUpload.single('media');

// Accepts one optional image in the banner field.
const uploadEventBanner = imageUpload.single('banner');

// Accepts one optional image in the image field.
const uploadMarketImage = imageUpload.single('image');

module.exports = { uploadAvatar, uploadPostMedia, uploadStoryMedia, uploadEventBanner, uploadMarketImage };
