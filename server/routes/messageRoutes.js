// server/routes/messageRoutes.js
const express = require('express');
const { protect } = require('../middlewares/auth');
const { deleteMessage } = require('../controllers/channelController');

const router = express.Router();

router.use(protect);

router.route('/:id').delete(deleteMessage);

module.exports = router;