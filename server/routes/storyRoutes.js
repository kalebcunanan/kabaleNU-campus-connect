const express = require('express');
const { protect } = require('../middlewares/auth');
const { uploadStoryMedia } = require('../middlewares/upload');
const { createStory, getStories, deleteStory } = require('../controllers/storyController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getStories)
  .post(uploadStoryMedia, createStory);

router.route('/:id').delete(deleteStory);

module.exports = router;