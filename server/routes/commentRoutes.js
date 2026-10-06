// server/routes/commentRoutes.js
const express = require('express');
const { protect } = require('../middlewares/auth');
const { deleteComment } = require('../controllers/commentController');

const router = express.Router();

router.use(protect);

router.route('/:id').delete(deleteComment);

module.exports = router;