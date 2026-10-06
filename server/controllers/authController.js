const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const { uploadBuffer } = require('../utils/cloudinary');
const { isValidProgram } = require('../utils/programs');
const bcrypt = require('bcryptjs');

// Builds the public user payload so register and login return the same shape.
const toUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  program: user.program,
  profilePicture: user.profilePicture,
  bulldogScore: user.bulldogScore
});

const register = asyncHandler(async (req, res) => {
  if (!req.body) {
    throw new AppError('Please provide registration details', 400);
  }

  const { name, email, password, role, program } = req.body;

  if (!name || !email || !password || !role || !program) {
    throw new AppError('All fields are required', 400);
  }

  if (!['bulldog', 'bullpup'].includes(role)) {
    throw new AppError('Invalid role selection. Only bulldog and bullpup are allowed.', 400);
  }

  if (!isValidProgram(role, program)) {
    throw new AppError('Selected program does not match your student type', 400);
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError('User already exists', 400);
  }

  // Upload only after validation passes so failed registrations leave no orphan files.
  let profilePicture = '';
  if (req.file) {
    const result = await uploadBuffer(req.file.buffer, 'campus-connect/avatars');
    profilePicture = result.secure_url;
  }

  const user = await User.create({ name, email, password, role, program, profilePicture });
  generateToken(res, user._id);

  res.status(201).json(toUserResponse(user));
});

const login = asyncHandler(async (req, res) => {
  if (!req.body) {
    throw new AppError('Please provide login details', 400);
  }

  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  generateToken(res, user._id);

  res.status(200).json(toUserResponse(user));
});

const logout = asyncHandler(async (req, res) => {
  // Cookie options must match the ones used at login so the cookie is actually cleared.
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

module.exports = { register, login, logout, me };