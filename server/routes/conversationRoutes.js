// server/routes/conversationRoutes.js
const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  getConversations, startConversation, getConversationMessages, sendConversationMessage
} = require('../controllers/conversationController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getConversations)
  .post(startConversation);

router.route('/:id/messages')
  .get(getConversationMessages)
  .post(sendConversationMessage);

module.exports = router;
