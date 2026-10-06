const User = require('../models/User');
const Event = require('../models/Event'); // Idinagdag para sa registrations
const asyncHandler = require('../utils/asyncHandler');

exports.getLeaderboard = asyncHandler(async (req, res) => {
  // Kunin lang ang mga students (bulldogs at bullpups) at i-sort pababa
  const topStudents = await User.find({ role: { $in: ['bulldog', 'bullpup'] } })
    .sort({ bulldogScore: -1 })
    .limit(10)
    .select('name role bulldogScore');
  
  res.status(200).json(topStudents);
});

exports.getMyRegistrations = asyncHandler(async (req, res) => {
  // Hinahanap ang lahat ng events kung saan nasa 'attendees' array ang ID ng user
  const events = await Event.find({ attendees: req.user._id });

  // Pormatin ang response para tumugma sa inaasahan ng frontend
  const registrations = events.map(event => ({
    event: event._id,
    status: 'registered'
  }));

  res.status(200).json(registrations);
});