'use strict';

const Joi = require('joi');

const startInterviewSchema = Joi.object({
  company: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Company name must be at least 2 characters',
      'string.max': 'Company name cannot exceed 100 characters',
      'any.required': 'Company name is required',
      'string.empty': 'Company name cannot be empty',
    }),

  jobRole: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Job role must be at least 2 characters',
      'string.max': 'Job role cannot exceed 100 characters',
      'any.required': 'Job role is required',
      'string.empty': 'Job role cannot be empty',
    }),

  difficulty: Joi.string()
    .valid('easy', 'medium', 'hard')
    .default('medium')
    .messages({
      'any.only': 'Difficulty must be easy, medium, or hard',
    }),

  questionCount: Joi.number()
    .integer()
    .min(3)
    .max(10)
    .default(5)
    .messages({
      'number.min': 'Minimum 3 questions required',
      'number.max': 'Maximum 10 questions allowed',
    }),
});

const submitAnswerSchema = Joi.object({
  questionIndex: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.min': 'Question index must be 0 or greater',
      'any.required': 'Question index is required',
    }),

  answerText: Joi.string()
    .trim()
    .min(1)
    .max(5000)
    .required()
    .messages({
      'string.min': 'Answer cannot be empty',
      'string.max': 'Answer cannot exceed 5000 characters',
      'any.required': 'Answer text is required',
    }),
});

module.exports = { startInterviewSchema, submitAnswerSchema };