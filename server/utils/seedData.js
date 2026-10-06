// server/utils/seedData.js
require('dotenv').config({ path: '../.env' }); // Adjust path depending on where you run it
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Reaction = require('../models/Reaction');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const MarketItem = require('../models/MarketItem');
const Channel = require('../models/Channel');
const Message = require('../models/Message');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected. Clearing existing data...');

    await Promise.all([
      User.deleteMany(), Post.deleteMany(), Comment.deleteMany(),
      Reaction.deleteMany(), Event.deleteMany(), Registration.deleteMany(),
      MarketItem.deleteMany(), Channel.deleteMany(), Message.deleteMany()
    ]);

    console.log('Seeding Users...');
    const users = await User.create([
      { name: 'Prof. Faculty', email: 'admin@nu-clark.edu.ph', password: 'password123', role: 'faculty' },
      { name: 'John Bulldog', email: 'john@students.nu-clark.edu.ph', password: 'password123', role: 'bulldog', bulldogScore: 15 },
      { name: 'Jane Bullpup', email: 'jane@students.nu-clark.edu.ph', password: 'password123', role: 'bullpup', bulldogScore: 5 }
    ]);

    console.log('Seeding Posts & Interactions...');
    const post = await Post.create({
      author: users[1]._id,
      content: 'Excited for the upcoming Intramurals! Who is joining the e-sports tournament?',
      bulldogReacts: 1,
      commentCount: 1
    });

    await Reaction.create({ user: users[2]._id, post: post._id });
    await Comment.create({ post: post._id, author: users[2]._id, content: 'I am! See you there.' });

    console.log('Seeding Events & Registrations...');
    const event = await Event.create({
      title: 'NU IT Week 2026',
      description: 'Annual IT week featuring tech talks and hackathons.',
      eventDate: new Date('2026-11-15T09:00:00Z'),
      endDate: new Date('2026-11-15T17:00:00Z'),
      organizer: users[0]._id,
      capacity: 100,
      slotsRemaining: 99
    });
    
    await Registration.create({ user: users[1]._id, event: event._id });

    console.log('Seeding Marketplace...');
    await MarketItem.create({
      seller: users[1]._id,
      title: '2nd Hand IT Uniform (Medium)',
      price: 350,
      category: 'Uniforms'
    });

    console.log('Seeding Channels & Messages...');
    const channel = await Channel.create({
      name: 'NU Web Developers',
      description: 'Talk about React, Node, and everything web.',
      category: 'Academics',
      createdBy: users[1]._id
    });

    await Message.create({ channel: channel._id, sender: users[1]._id, content: 'Anyone need help with the Day 2 deliverables?' });

    console.log('Data successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();