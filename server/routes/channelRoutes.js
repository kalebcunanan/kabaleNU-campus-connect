// server/routes/channelRoutes.js
const express = require('express');
const { protect } = require('../middlewares/auth');
const { 
  getChannels, createChannel, getMessages, sendMessage 
} = require('../controllers/channelController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getChannels)
  .post(createChannel);

router.route('/:id/messages')
  .get(getMessages)
  .post(sendMessage);

module.exports = router;