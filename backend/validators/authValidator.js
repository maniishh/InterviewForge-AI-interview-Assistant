'use strict';

const Joi = require('joi');

const emailField = Joi.string()
  .email({ tlds: { allow: false } })
  .lowercase()
  .trim()
  .max(255)
  .required()
  .messages({
    'string.email': 'Please enter a valid email address',
    'string.max': 'Email cannot exceed 255 characters',
    'any.required': 'Email is required',
    'string.empty': 'Email cannot be empty',
  });

const passwordField = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.max': 'Password cannot exceed 128 characters',
    'string.pattern.base':
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    'any.required': 'Password is required',
    'string.empty': 'Password cannot be empty',
  });

const registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(60)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 60 characters',
      'any.required': 'Name is required',
      'string.empty': 'Name cannot be empty',
    }),

  email: emailField,
  password: passwordField,

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Please confirm your password',
    }),
});

const loginSchema = Joi.object({
  email: emailField,
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
    'string.empty': 'Password cannot be empty',
  }),
});

module.exports = { registerSchema, loginSchema };