
'use strict';

const express        = require('express');
const router         = express.Router();

const authController = require('../controllers/authController');
const { protect }    = require('../middleware/authMiddleware');
const validate       = require('../middleware/validate');
const { authLimiter }= require('../middleware/rateLimiter');
const { registerSchema, loginSchema } = require('../validators/authValidator');

router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login
);

router.post('/logout', authController.logout);

router.get(
  '/me',
  protect,
  authController.getMe
);

router.patch(
  '/update-password',
  protect,
  authController.updatePassword
);

module.exports = router;