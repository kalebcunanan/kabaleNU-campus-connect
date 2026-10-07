const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
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
const Conversation = require('../models/Conversation');

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Builds a placeholder photo URL because seeded items are not uploaded through Cloudinary.
const sampleImage = (label) => `https://placehold.co/600x400/2455a6/ffd42a?text=${encodeURIComponent(label)}`;

const seedDB = async () => {
  try {
    if (process.env.NODE_ENV === 'production') throw new Error('Seeding is blocked when NODE_ENV is production');
    if (!process.argv.includes('--yes')) throw new Error('This script deletes all data. Run "npm run seed" to confirm');
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing');

    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to database "${mongoose.connection.name}". Clearing existing data...`);

    await Promise.all([
      User.deleteMany(), Post.deleteMany(), Comment.deleteMany(),
      Reaction.deleteMany(), Event.deleteMany(), Registration.deleteMany(),
      MarketItem.deleteMany(), Channel.deleteMany(), Message.deleteMany(),
      Conversation.deleteMany(),
    ]);

    const now = Date.now();

    // Scores follow the rules: +5 per post, +1 per react received, +10 per registration.
    console.log('Seeding users...');
    const users = await User.create([
      { name: 'Prof. Faculty', email: 'admin@nu-clark.edu.ph', password: 'password123', role: 'faculty' },
      { name: 'John Bulldog', email: 'john@students.nu-clark.edu.ph', password: 'password123', role: 'bulldog', bulldogScore: 22 },
      { name: 'Jane Bullpup', email: 'jane@students.nu-clark.edu.ph', password: 'password123', role: 'bullpup', bulldogScore: 0, createdAt: new Date(now - 5 * DAY) },
      { name: 'Mark Builder', email: 'mark@students.nu-clark.edu.ph', password: 'password123', role: 'bulldog', bulldogScore: 15 },
      { name: 'Sarah Tech', email: 'sarah@students.nu-clark.edu.ph', password: 'password123', role: 'bulldog', bulldogScore: 5 },
      { name: 'Leo Freshman', email: 'leo@students.nu-clark.edu.ph', password: 'password123', role: 'bullpup', bulldogScore: 0, createdAt: new Date(now - 2 * DAY) },
      { name: 'Mia Senior', email: 'mia@students.nu-clark.edu.ph', password: 'password123', role: 'bulldog', bulldogScore: 8 },
    ]);

    console.log('Seeding posts, reactions, and comments...');
    // The fourth post already has 4 reports so one more report from another user hides it.
    const posts = await Post.create([
      { author: users[1]._id, content: 'Excited for the upcoming Intramurals! Who is joining the e-sports tournament?', bulldogReacts: 1, commentCount: 1, createdAt: new Date(now - 2 * HOUR) },
      { author: users[3]._id, content: 'Any tips for the upcoming midterm exams in DSA?', createdAt: new Date(now - DAY) },
      { author: users[6]._id, content: 'Just finished my capstone defense!', bulldogReacts: 3, commentCount: 1, createdAt: new Date(now - HOUR) },
      {
        author: users[4]._id,
        content: 'Lost my NU ID lace near the library. Please DM me if found.',
        reportCount: 4,
        reportedBy: [users[2]._id, users[5]._id, users[3]._id, users[6]._id],
        createdAt: new Date(now - 5 * HOUR),
      },
      { author: users[1]._id, content: 'Hello campus! What a beautiful day to code.', bulldogReacts: 1, createdAt: new Date(now - 10 * HOUR) },
    ]);

    await Reaction.create([
      { user: users[2]._id, post: posts[0]._id },
      { user: users[1]._id, post: posts[2]._id },
      { user: users[3]._id, post: posts[2]._id },
      { user: users[4]._id, post: posts[2]._id },
      { user: users[2]._id, post: posts[4]._id },
    ]);
    await Comment.create([
      { post: posts[0]._id, author: users[2]._id, content: 'I am! See you there.' },
      { post: posts[2]._id, author: users[1]._id, content: 'Congrats Mia!!' },
    ]);

    // IT Week and the Web Dev Workshop overlap, the workshop is full, and Sportsfest is open.
    console.log('Seeding events and registrations...');
    const events = await Event.create([
      { title: 'NU IT Week 2026', description: 'Annual IT week featuring tech talks.', eventDate: new Date('2026-11-15T09:00:00+08:00'), endDate: new Date('2026-11-15T17:00:00+08:00'), organizer: users[0]._id, capacity: 100, slotsRemaining: 99 },
      { title: 'Web Dev Workshop', description: 'React and Node basics.', eventDate: new Date('2026-11-15T13:00:00+08:00'), endDate: new Date('2026-11-15T15:00:00+08:00'), organizer: users[0]._id, capacity: 1, slotsRemaining: 0 },
      { title: 'Sportsfest 2026', description: 'Inter-department sports competition.', eventDate: new Date('2026-11-20T08:00:00+08:00'), endDate: new Date('2026-11-20T17:00:00+08:00'), organizer: users[0]._id, capacity: 50, slotsRemaining: 50 },
      { title: 'Freshmen Orientation', description: 'Welcome to NU Clark!', eventDate: new Date('2026-08-10T08:00:00+08:00'), endDate: new Date('2026-08-10T12:00:00+08:00'), organizer: users[0]._id, capacity: 200, slotsRemaining: 200, status: 'completed' },
    ]);

    await Registration.create([
      { user: users[1]._id, event: events[0]._id, status: 'registered' },
      { user: users[3]._id, event: events[1]._id, status: 'registered' },
    ]);

    console.log('Seeding marketplace items...');
    const items = await MarketItem.create([
      { seller: users[1]._id, title: '2nd Hand IT Uniform (Medium)', price: 350, category: 'Clothes', image: sampleImage('IT Uniform'), status: 'Available' },
      { seller: users[6]._id, title: 'Data Structures Book', price: 400, category: 'School Materials', image: sampleImage('DSA Book'), status: 'Available' },
      { seller: users[4]._id, title: 'Scientific Calculator', price: 800, category: 'Electronics', image: sampleImage('Calculator'), status: 'Reserved' },
      { seller: users[3]._id, title: 'PE Uniform (Large)', price: 250, category: 'Clothes', image: sampleImage('PE Uniform'), status: 'Sold' },
      { seller: users[5]._id, title: 'Drawing Tablet', price: 1500, category: 'Electronics', image: sampleImage('Drawing Tablet'), status: 'Available' },
      { seller: users[6]._id, title: 'Database Systems Book', price: 300, category: 'School Materials', image: sampleImage('DB Book'), status: 'Available' },
      { seller: users[4]._id, title: 'Homemade Brownies (Box of 6)', price: 120, category: 'Food', image: sampleImage('Brownies'), status: 'Available' },
      { seller: users[1]._id, title: 'Desk Lamp', price: 200, category: 'Home Items', image: sampleImage('Desk Lamp'), status: 'Available' },
    ]);

    // Jane asks John about his uniform and Leo asks Mia about her book.
    console.log('Seeding conversations...');
    const conversations = await Conversation.create([
      { item: items[0]._id, buyer: users[2]._id, seller: users[1]._id, lastMessage: 'Okay, see you at the library at 3 PM.', lastMessageAt: new Date(now - 20 * MINUTE) },
      { item: items[1]._id, buyer: users[5]._id, seller: users[6]._id, lastMessage: 'Can you do 350?', lastMessageAt: new Date(now - 3 * HOUR) },
    ]);

    await Message.create([
      { conversation: conversations[0]._id, sender: users[2]._id, content: 'Hi! Is the IT uniform still available?', createdAt: new Date(now - 50 * MINUTE) },
      { conversation: conversations[0]._id, sender: users[1]._id, content: 'Yes, it is. Medium size, worn only twice.', createdAt: new Date(now - 45 * MINUTE) },
      { conversation: conversations[0]._id, sender: users[2]._id, content: 'Great, can we meet on campus later?', createdAt: new Date(now - 30 * MINUTE) },
      { conversation: conversations[0]._id, sender: users[1]._id, content: 'Okay, see you at the library at 3 PM.', createdAt: new Date(now - 20 * MINUTE) },
      { conversation: conversations[1]._id, sender: users[5]._id, content: 'Hello Ate Mia, is the Data Structures book complete?', createdAt: new Date(now - 4 * HOUR) },
      { conversation: conversations[1]._id, sender: users[6]._id, content: 'Yes, no missing pages and barely any highlights.', createdAt: new Date(now - 3.5 * HOUR) },
      { conversation: conversations[1]._id, sender: users[5]._id, content: 'Can you do 350?', createdAt: new Date(now - 3 * HOUR) },
    ]);

    console.log('Seeding channels and messages...');
    const channels = await Channel.create([
      { name: 'NU Web Developers', description: 'Talk about React, Node, and everything web.', category: 'Academics', createdBy: users[1]._id },
      { name: 'Gamers Lounge', description: 'Looking for party!', category: 'Others', createdBy: users[3]._id },
      { name: 'CCIS Student Council', description: 'Announcements from the org.', category: 'Orgs', createdBy: users[6]._id },
    ]);

    await Message.create([
      { channel: channels[0]._id, sender: users[1]._id, content: 'Anyone need help with the Day 2 deliverables?' },
      { channel: channels[0]._id, sender: users[4]._id, content: 'I do! The API is tricky.' },
      { channel: channels[1]._id, sender: users[3]._id, content: 'Who is playing Valorant tonight?' },
    ]);

    console.log('Data successfully seeded.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error.message);
    process.exit(1);
  }
};

seedDB();
