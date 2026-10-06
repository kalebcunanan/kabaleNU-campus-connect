const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, minlength: 2, maxlength: 40 },
  description: { type: String, maxlength: 200 },
  category: { type: String, enum: ['Church', 'Orgs', 'Academics', 'Others'], required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Channel', channelSchema);