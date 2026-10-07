const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// S23: Fail-fast checks para sa mahahalagang environment variables
if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error('FATAL ERROR: JWT_SECRET or MONGO_URI is not defined.');
  process.exit(1);
}

const logger = require('./middlewares/logger');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const eventRoutes = require('./routes/eventRoutes');
const marketRoutes = require('./routes/marketRoutes');
const channelRoutes = require('./routes/channelRoutes');
const messageRoutes = require('./routes/messageRoutes');
const storyRoutes = require('./routes/storyRoutes');
const conversationRoutes = require('./routes/conversationRoutes');

const app = express();

// S23: CORS fallback para hindi maging wildcard
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(logger);

// Routes live on one router so they answer both with and without the /api prefix.
const api = express.Router();
api.use('/users', userRoutes);
api.use('/posts', postRoutes);
api.use('/comments', commentRoutes);
api.use('/events', eventRoutes);
api.use('/market', marketRoutes);
api.use('/channels', channelRoutes);
api.use('/messages', messageRoutes);
api.use('/stories', storyRoutes);
api.use('/conversations', conversationRoutes);

app.use('/api', api);
// Vercel Services strips the /api prefix before forwarding, so the bare paths must work too.
app.use(api);

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Campus Connect API is running' });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Mongoose buffers queries until the connection is ready, so the app can start listening right away.
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1); // S23: Exit on connection failure
  });

// Vercel imports the app, so only listen when the file is run directly.
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  // Keep idle connections open longer than the browser keeps them for reuse.
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
}

module.exports = app;
