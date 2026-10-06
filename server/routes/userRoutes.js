const express = require('express');
const { register, login, logout, me } = require('../controllers/authController');
// BAGO: I-import ang mga functions mula sa userController
const { getLeaderboard, getMyRegistrations } = require('../controllers/userController'); 
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Auth Routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, me);

// BAGO: User Feature Routes
router.get('/leaderboard', getLeaderboard);
router.get('/me/registrations', protect, getMyRegistrations);

module.exports = router;