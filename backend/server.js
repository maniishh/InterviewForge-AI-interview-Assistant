 

'use strict';

 
const env       = require('./config/env');
const connectDB = require('./config/db');

 
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

 
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler        = require('./middleware/errorHandler');
 const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const historyRoutes = require('./routes/historyRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');

 
const app = express();
 
connectDB();

 
app.use(helmet());

const allowedOrigins = Array.from(new Set([
  'http://localhost:5173',
  'http://localhost:3000',
  env.CLIENT_URL,
].filter(Boolean)));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS error: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));
 
app.use(express.json({ limit: '10kb' }));

 
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

 
if (!env.IS_TEST) {
  app.use(morgan('dev'));
}



app.use('/api/v1', generalLimiter);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/history', historyRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/roadmap', roadmapRoutes);



 
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status:      'ok',
      environment: env.NODE_ENV,
      timestamp:   new Date().toISOString(),
    },
  });
});

 
app.use((req, res, next) => {
  next(require('./utils/AppError').notFound(
    `Route ${req.method} ${req.originalUrl} not found`
  ));
});

 
app.use(errorHandler);

 
const PORT = Number(env.PORT);

const server = app.listen(PORT, () => {
  console.log(`\n🚀  Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/v1/health\n`);
});

 
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥  Unhandled Promise Rejection:', reason);
  server.close(() => process.exit(1));
});

module.exports = app;  