const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const logger = require('./middlewares/logger');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

// Route imports
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const eventRoutes = require('./routes/eventRoutes');
const marketRoutes = require('./routes/marketRoutes');
const channelRoutes = require('./routes/channelRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

// CORS allows only the exact client origin with credentials enabled.
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Body and cookie parsers must run before the routers.
app.use(express.json());
app.use(cookieParser());

// The logger prints method, URL, status, and duration for every request.
app.use(logger);

// Routers are mounted here as each slice is completed.
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);

// Health check route for quickly confirming the API is up.
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Campus Connect API is running' });
});

// The JSON 404 catch-all and the error handler must stay last.
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// The server starts listening only after MongoDB connects successfully.
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });