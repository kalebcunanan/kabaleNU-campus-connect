// server/routes/eventRoutes.js
const express = require('express');
const { protect, restrictTo } = require('../middlewares/auth');
const { 
  createEvent, getEvents, getEvent, 
  updateEvent, deleteEvent, registerForEvent, cancelRegistration 
} = require('../controllers/eventController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getEvents)
  .post(restrictTo('faculty'), createEvent);

router.route('/:id')
  .get(getEvent)
  .put(restrictTo('faculty'), updateEvent)
  .delete(restrictTo('faculty'), deleteEvent);

// PROCESSING 2: Registration handling
router.route('/:id/register')
  .post(registerForEvent)
  .delete(cancelRegistration);

module.exports = router;