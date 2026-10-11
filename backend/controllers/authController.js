    'use strict';

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { setAuthCookie, clearAuthCookie } = require('../utils/authCookie');

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  setAuthCookie(res, token);

  res.status(statusCode).json({
    success: true,
    data: {
      user: user.toJSON(),
    },
    message:
      statusCode === 201
        ? 'Account created successfully'
        : 'Logged in successfully',
  });
};

exports.logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  res.status(204).send();
});

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw AppError.conflict('An account with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    passwordHash: password,
  });

  sendTokenResponse(user, 201, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email);

  if (!user || !(await user.comparePassword(password))) {
    throw AppError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw AppError.unauthorized(
      'Your account has been deactivated. Please contact support.'
    );
  }

  sendTokenResponse(user, 200, res);
});

exports.getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: { user: req.user.toJSON() },
  });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+passwordHash');

  if (!(await user.comparePassword(currentPassword))) {
    throw AppError.unauthorized('Your current password is incorrect');
  }

  user.passwordHash = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});