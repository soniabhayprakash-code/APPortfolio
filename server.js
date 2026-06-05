// server.js — Abhay Prakash Portfolio Backend
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security Middleware ───────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com", "fonts.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "fonts.gstatic.com", "cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "avatars.githubusercontent.com", "github.com", "data:"],
      connectSrc: ["'self'", "api.github.com"]
    }
  }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com']
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-admin-token']
}));

// ─── Rate Limiting ────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests. Try again later.' }
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, message: 'Too many messages. Try again in an hour.' }
});

app.use('/api/', limiter);
app.use('/api/contact', contactLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Static Files ─────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '7d',
  etag: true
}));

// ─── Visitor Tracking Middleware ──────────────────────────────────────
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.includes('.')) {
    const { Visitor } = require('./models');
    Visitor.create({
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      page: req.path,
      referrer: req.get('Referrer') || ''
    }).catch(() => {});
  }
  next();
});

// ─── API Routes ───────────────────────────────────────────────────────
app.use('/api', require('./routes/api'));

// ─── SPA Fallback ─────────────────────────────────────────────────────
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// ─── Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── MongoDB Connection ───────────────────────────────────────────────
async function start() {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('✅ MongoDB Connected');
    } else {
      console.log('⚠️  No MONGODB_URI — running without database (set in .env)');
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Abhay Prakash Portfolio Server`);
      console.log(`   URL: http://localhost:${PORT}`);
      console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   DB: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}\n`);
    });
  } catch (err) {
    console.error('❌ Startup error:', err.message);
    // Run without DB in demo mode
    app.listen(PORT, () => {
      console.log(`\n⚠️  Running in DEMO mode (no DB) on port ${PORT}`);
    });
  }
}

start();
