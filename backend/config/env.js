
'use strict';

const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error && process.env.NODE_ENV !== 'production') {
  console.warn('  No .env file found. Using system environment variables.');
}


const _errors = [];  

function getEnv(key, { required = true, defaultValue = undefined } = {}) {
  const value = process.env[key] ?? defaultValue;

  if (required && (value === undefined || value === '')) {
    _errors.push(`  ✗ Missing required environment variable: ${key}`);
    return '';           
  }

  return value;
}
const env = {
  // Server
  PORT:         getEnv('PORT',         { defaultValue: '5000' }),
  NODE_ENV:     getEnv('NODE_ENV',     { defaultValue: 'development' }),

  // Database
  MONGODB_URI:  getEnv('MONGODB_URI'),

  // Auth
  JWT_SECRET:   getEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', { defaultValue: '7d' }),

  // AI
  AI_PROVIDER:    getEnv('AI_PROVIDER',    { defaultValue: 'openai' }),
  OPENAI_API_KEY: getEnv('OPENAI_API_KEY', { required: false, defaultValue: '' }),
  GEMINI_API_KEY: getEnv('GEMINI_API_KEY', { required: false, defaultValue: '' }),
 
PINECONE_API_KEY:   getEnv('PINECONE_API_KEY',   { required: false, defaultValue: '' }),
PINECONE_INDEX_NAME:getEnv('PINECONE_INDEX_NAME', { required: false, defaultValue: 'interviewforge-questions' }),
USE_RAG:            getEnv('USE_RAG',             { required: false, defaultValue: 'false' }),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: Number(getEnv('RATE_LIMIT_WINDOW_MS', { defaultValue: '900000' })),
  RATE_LIMIT_MAX:       Number(getEnv('RATE_LIMIT_MAX',        { defaultValue: '100'    })),

  USE_AI_MOCK: getEnv('USE_AI_MOCK', { required: false, defaultValue: 'false' }),
};


if (_errors.length > 0) {
  console.error('\n  Environment validation failed:\n');
  _errors.forEach(e => console.error(e));
  console.error('\n  → Copy .env.example to .env and fill in all values.\n');
  process.exit(1);   // Exit code 1 = failure (monitored by process managers like PM2)
}


env.IS_PRODUCTION  = env.NODE_ENV === 'production';
env.IS_DEVELOPMENT = env.NODE_ENV === 'development';
env.IS_TEST        = env.NODE_ENV === 'test';


if (env.AI_PROVIDER === 'openai' && !env.OPENAI_API_KEY) {
  console.error('  AI_PROVIDER is "openai" but OPENAI_API_KEY is not set.');
  process.exit(1);
}
if (env.AI_PROVIDER === 'gemini' && !env.GEMINI_API_KEY) {
  console.error(' AI_PROVIDER is "gemini" but GEMINI_API_KEY is not set.');
  process.exit(1);
}

module.exports = env;