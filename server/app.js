const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

const app = express();

// 1. CORS - Exact client origin with credentials: true
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// 2 & 3. Body parser and Cookie parser
app.use(express.json());
app.use(cookieParser());

// 4. Request logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 5. Routers
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Campus Connect API is running' });
});

// 6. 404 Catch-all
app.use(notFound);

// 7. Centralized Error Handler
app.use(errorHandler);

// Database Connection & Server Start
const PORT = process.env.PORT || 5000;

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