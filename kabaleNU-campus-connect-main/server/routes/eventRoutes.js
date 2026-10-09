const express = require('express');
const { protect, restrictTo } = require('../middlewares/auth');
const { uploadEventBanner } = require('../middlewares/upload');
const {
  createEvent, getEvents, getEvent, updateEvent, deleteEvent,
  getEventRegistrations, registerForEvent, cancelRegistration,
} = require('../controllers/eventController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getEvents)
  .post(restrictTo('faculty'), uploadEventBanner, createEvent);

router.route('/:id')
  .get(getEvent)
  .put(restrictTo('faculty'), uploadEventBanner, updateEvent)
  .delete(restrictTo('faculty'), deleteEvent);

router.route('/:id/registrations').get(restrictTo('faculty'), getEventRegistrations);

// PROCESSING 2: Registration handling
router.route('/:id/register')
  .post(registerForEvent)
  .delete(cancelRegistration);

module.exports = router;
