const express = require('express');
const { register, login, logout, me } = require('../controllers/authController');
const {
  getLeaderboard, getMyRegistrations, getUsers, getUser, updateUser, deleteUser,
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middlewares/auth');
const { uploadAvatar } = require('../middlewares/upload');

const router = express.Router();

router.post('/register', uploadAvatar, register);
router.post('/login', login);

router.use(protect);

router.post('/logout', logout);

// Static paths must be registered before the /:id routes.
router.get('/me', me);
router.get('/me/registrations', getMyRegistrations);
router.get('/leaderboard', getLeaderboard);

router.route('/').get(restrictTo('faculty'), getUsers);

router.route('/:id')
  .get(getUser)
  .put(uploadAvatar, updateUser)
  .delete(restrictTo('faculty'), deleteUser);

module.exports = router;