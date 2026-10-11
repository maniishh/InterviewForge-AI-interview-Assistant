'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { getAuthToken } = require('../utils/authCookie');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  token = getAuthToken(req);

  if (!token) {
    throw AppError.unauthorized(
      'You are not logged in. Please log in to access this resource.'
    );
  }

  const decoded = jwt.verify(token, env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id).select('+isActive');

  if (!currentUser) {
    throw AppError.unauthorized(
      'The user belonging to this token no longer exists.'
    );
  }

  if (!currentUser.isActive) {
    throw AppError.unauthorized(
      'Your account has been deactivated. Please contact support.'
    );
  }

  req.user = currentUser;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          'You do not have permission to perform this action.'
        )
      );
    }
    next();
  };
};

module.exports = { protect, restrictTo };