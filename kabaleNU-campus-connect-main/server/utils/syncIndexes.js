// One-off script: run with "node utils/syncIndexes.js" after deploying the friends feature.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Friendship = require('../models/Friendship');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Conversation.syncIndexes();
  await Friendship.syncIndexes();
  console.log('Indexes synced');
  await mongoose.disconnect();
})().catch((error) => {
  console.error('Index sync failed:', error);
  process.exit(1);
});
