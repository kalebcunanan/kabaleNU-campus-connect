const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.jwt;
  
  if (!token) {
    throw new AppError('Not authorized, no token', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Kukunin natin ang user sa database pero hindi kasama ang password
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    throw new AppError('Not authorized, token failed', 401);
  }
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

module.exports = { protect, restrictTo };