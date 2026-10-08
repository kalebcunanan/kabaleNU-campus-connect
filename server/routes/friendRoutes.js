const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  searchUsers, getFriends, getRequests, getRequestCount, getFriendStatus,
  sendRequest, acceptRequest, removeRequest, removeFriend,
} = require('../controllers/friendController');

const router = express.Router();

router.use(protect);

// Static paths must be registered before the /:userId route.
router.get('/search', searchUsers);
router.get('/requests/count', getRequestCount);
router.get('/requests', getRequests);
router.get('/status/:userId', getFriendStatus);

router.post('/requests/:userId', sendRequest);
router.put('/requests/:id/accept', acceptRequest);
router.delete('/requests/:id', removeRequest);

router.get('/', getFriends);
router.delete('/:userId', removeFriend);

module.exports = router;
