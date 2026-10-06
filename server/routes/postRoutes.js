const express = require('express');
const { protect } = require('../middlewares/auth');
const { uploadPostMedia } = require('../middlewares/upload');
const {
  createPost, getPosts, getTrendingPosts, getPost,
  updatePost, deletePost, reactToPost, reportPost,
} = require('../controllers/postController');
const { getComments, addComment } = require('../controllers/commentController');

const router = express.Router();

router.use(protect);

// Static paths must be registered before the /:id routes.
router.route('/trending').get(getTrendingPosts);

router.route('/')
  .get(getPosts)
  .post(uploadPostMedia, createPost);

router.route('/:id')
  .get(getPost)
  .put(updatePost)
  .delete(deletePost);

// React is a single toggle endpoint, so there is no DELETE route.
router.route('/:id/react').post(reactToPost);

router.route('/:id/report').post(reportPost);

router.route('/:id/comments')
  .get(getComments)
  .post(addComment);

module.exports = router;