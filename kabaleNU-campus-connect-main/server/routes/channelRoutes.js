// server/routes/channelRoutes.js
const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  getChannels, createChannel, getChannel, deleteChannel,
  joinChannel, leaveChannel, getMessages, sendMessage,
} = require('../controllers/channelController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getChannels)
  .post(createChannel);

router.route('/:id')
  .get(getChannel)
  .delete(deleteChannel);

router.post('/:id/join', joinChannel);
router.post('/:id/leave', leaveChannel);

router.route('/:id/messages')
  .get(getMessages)
  .post(sendMessage);

module.exports = router;
