// server/routes/conversationRoutes.js
const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  getConversations, startConversation, startDirectConversation, getConversationMessages, sendConversationMessage
} = require('../controllers/conversationController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getConversations)
  .post(startConversation);

// Static paths must be registered before the /:id routes.
router.post('/direct', startDirectConversation);

router.route('/:id/messages')
  .get(getConversationMessages)
  .post(sendConversationMessage);

module.exports = router;
