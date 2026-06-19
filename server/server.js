const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const connectDB        = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// ─── Connect Database ─────────────────────────────────────────────────────────
connectDB();

// ─── Express App ──────────────────────────────────────────────────────────────
const app = express();

// Security headers
app.use(helmet());

// CORS — allow Vite dev server and production client
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, Postman, mobile)
      if (!origin) return cb(null, true);
      
      // In development/local testing, dynamically allow any localhost origin/port
      const isLocalhost = origin.startsWith('http://localhost:') || origin === 'http://localhost';
      
      if (isLocalhost || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logger (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Database connection health check middleware ─────────────────────────────
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is currently offline. Please ensure MongoDB is running (e.g. on port 27017) or verify your MONGO_URI in the environment configuration.',
      });
    }
  }
  next();
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Mini CRM API is running',
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/leads',     require('./routes/leadRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// ─── Serve Frontend / Redirect ────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));
  
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} else {
  // In development, redirect non-API requests on backend port to Vite server
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    
    // Dynamically detect local client port if referred from another page
    const referer = req.headers.referer;
    let clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    if (referer && referer.startsWith('http://localhost:')) {
      try {
        const url = new URL(referer);
        clientUrl = url.origin;
      } catch (e) {
        // Fallback to default
      }
    }
    res.redirect(`${clientUrl}${req.originalUrl}`);
  });
}

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
