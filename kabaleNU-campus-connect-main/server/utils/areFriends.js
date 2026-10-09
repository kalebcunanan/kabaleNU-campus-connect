const Friendship = require('../models/Friendship');
const { pairKeyOf } = require('./pairKey');

// Returns true when the two users have an accepted friendship.
const areFriends = async (userA, userB) => {
  const friendship = await Friendship.exists({ pairKey: pairKeyOf(userA, userB), status: 'accepted' });
  return Boolean(friendship);
};

module.exports = areFriends;
