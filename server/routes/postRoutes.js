// server/routes/postRoutes.js
const express = require('express');
const { protect } = require('../middlewares/auth');
const { 
  createPost, getPosts, getTrendingPosts, getPost, 
  updatePost, deletePost, reactToPost, unreactToPost, reportPost 
} = require('../controllers/postController');
const { getComments, addComment } = require('../controllers/commentController');

const router = express.Router();

router.use(protect);

// IMPORTANT: Static paths must be registered before /:id routes
router.route('/trending').get(getTrendingPosts);

router.route('/')
  .get(getPosts)
  .post(createPost);

router.route('/:id')
  .get(getPost)
  .put(updatePost)
  .delete(deletePost);

router.route('/:id/react')
  .post(reactToPost)
  .delete(unreactToPost);

router.route('/:id/report')
  .post(reportPost);

// Comments related to a specific post
router.route('/:id/comments')
  .get(getComments)
  .post(addComment);

module.exports = router;