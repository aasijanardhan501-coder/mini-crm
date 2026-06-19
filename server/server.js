const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const mongoose = require('mongoose');

const connectDB                  = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// ─── Connect Database ─────────────────────────────────────────────────────────
connectDB();

// ─── Express App ──────────────────────────────────────────────────────────────
const app = express();

// Security headers
app.use(helmet());

// CORS — allow any localhost port in dev, and specific origins in production
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, Postman, mobile apps)
      if (!origin) return cb(null, true);

      // Allow any localhost or 127.0.0.1 port during local development
      if (
        origin.startsWith('http://localhost:') || origin === 'http://localhost' ||
        origin.startsWith('http://127.0.0.1:') || origin === 'http://127.0.0.1'
      ) {
        return cb(null, true);
      }

      // Allow configured production client URL
      const clientUrl = process.env.CLIENT_URL || '';
      if (clientUrl && origin === clientUrl) {
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

// ─── Database health check for API routes ────────────────────────────────────
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message:
        'Database is currently offline. Please ensure MongoDB is running or verify your MONGO_URI configuration.',
    });
  }
  next();
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Mini CRM API is running',
    environment: process.env.NODE_ENV || 'development',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/leads',     require('./routes/leadRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// ─── One-Time Seed Route (remove after use) ───────────────────────────────────
app.get('/seed-now', async (_req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, message: 'Database not connected.' });
  }
  try {
    const User     = require('./models/User');
    const Lead     = require('./models/Lead');
    const Activity = require('./models/Activity');

    await User.deleteMany();
    await Lead.deleteMany();
    await Activity.deleteMany();

    const users = await User.create([
      { name: 'Sarah Jenkins',  email: 'admin@crm.com',   password: 'password123', role: 'admin'   },
      { name: 'Michael Chen',   email: 'manager@crm.com', password: 'password123', role: 'manager' },
      { name: 'David Miller',   email: 'viewer@crm.com',  password: 'password123', role: 'viewer'  },
    ]);

    const adminId   = users[0]._id;
    const managerId = users[1]._id;
    const daysAgo = (d) => { const dt = new Date(); dt.setDate(dt.getDate() - d); return dt; };

    const leadsData = [
      { name: 'John Doe',        email: 'john.doe@acme.com',             phone: '+1 555-0199', company: 'Acme Corporation',     status: 'new',           source: 'website',       value: 5000,  assignedTo: adminId,   createdAt: daysAgo(2),  notes: [{ content: 'Lead filled out website contact form.',           createdBy: adminId   }] },
      { name: 'Alice Smith',     email: 'alice.smith@techflow.io',       phone: '+1 555-0144', company: 'TechFlow Solutions',   status: 'contacted',     source: 'referral',      value: 12500, assignedTo: managerId, createdAt: daysAgo(7),  notes: [{ content: 'Initial call completed.',                         createdBy: managerId }] },
      { name: 'Robert Johnson',  email: 'rjohnson@apex.org',             phone: '+1 555-0182', company: 'Apex Global',          status: 'qualified',     source: 'social',        value: 8000,  assignedTo: adminId,   createdAt: daysAgo(14), notes: [{ content: 'Budget verified. Qualifies as enterprise.',        createdBy: adminId   }] },
      { name: 'Emma Watson',     email: 'emma@innovate.co',              phone: '+1 555-0155', company: 'Innovate LLC',         status: 'won',           source: 'advertisement', value: 25000, assignedTo: managerId, createdAt: daysAgo(21), notes: [{ content: 'Contract signed!',                                 createdBy: managerId }] },
      { name: 'James Cooper',    email: 'jcooper@lostcorp.com',          phone: '+1 555-0121', company: 'Lost Solutions Inc',   status: 'lost',          source: 'other',         value: 3000,  assignedTo: adminId,   createdAt: daysAgo(30), notes: [{ content: 'Chose competitor due to pricing.',                 createdBy: adminId   }] },
      { name: 'Olivia Brown',    email: 'olivia.brown@retailtech.com',   phone: '+1 555-0177', company: 'Retail Tech Group',    status: 'proposal sent', source: 'website',       value: 4500,  assignedTo: managerId, createdAt: daysAgo(38), notes: [] },
      { name: 'William Davis',   email: 'wdavis@cyberguard.net',         phone: '+1 555-0163', company: 'CyberGuard Systems',   status: 'contacted',     source: 'referral',      value: 18000, assignedTo: adminId,   createdAt: daysAgo(47), notes: [{ content: 'Sent API documentation and compliance sheets.',   createdBy: adminId   }] },
      { name: 'Sophia Martinez', email: 'sophia@marketpulse.com',        phone: '+1 555-0105', company: 'MarketPulse Agency',   status: 'qualified',     source: 'social',        value: 9500,  assignedTo: managerId, createdAt: daysAgo(60), notes: [{ content: 'Decision-maker is CEO.',                          createdBy: managerId }] },
      { name: 'Liam Wilson',     email: 'liam@wilsonlogistics.com',      phone: '+1 555-0130', company: 'Wilson Logistics',     status: 'won',           source: 'website',       value: 15000, assignedTo: adminId,   createdAt: daysAgo(75), notes: [{ content: 'Closed deal. Invoice processed.',                  createdBy: adminId   }] },
      { name: 'Mia Anderson',    email: 'mia.a@pixelperfect.design',     phone: '+1 555-0111', company: 'PixelPerfect Design',  status: 'new',           source: 'advertisement', value: 6200,  assignedTo: managerId, createdAt: daysAgo(90), notes: [] },
    ];

    const leads = await Lead.insertMany(leadsData, { timestamps: false });

    await Activity.create([
      { leadId: leads[0]._id, userId: adminId,   action: 'created',        description: `Lead '${leads[0].name}' created from web contact form.` },
      { leadId: leads[1]._id, userId: managerId, action: 'created',        description: `Lead '${leads[1].name}' created via referral.` },
      { leadId: leads[1]._id, userId: managerId, action: 'note_added',     description: `Note added to '${leads[1].name}' by Michael Chen` },
      { leadId: leads[3]._id, userId: managerId, action: 'status_changed', description: `Status changed to 'won' by Michael Chen`, changes: { status: { old: 'qualified', new: 'won' } } },
      { leadId: leads[4]._id, userId: adminId,   action: 'status_changed', description: `Status changed to 'lost' by Sarah Jenkins`, changes: { status: { old: 'contacted', new: 'lost' } } },
    ]);

    return res.json({
      success: true,
      message: `✅ Database seeded! ${users.length} users, ${leads.length} leads, 5 activities created.`,
      logins: [
        { role: 'admin',   email: 'admin@crm.com',   password: 'password123' },
        { role: 'manager', email: 'manager@crm.com', password: 'password123' },
        { role: 'viewer',  email: 'viewer@crm.com',  password: 'password123' },
      ],
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Serve Frontend (Production only) ────────────────────────────────────────
// In production, serve the built React app for all non-API routes.
// In development, the frontend runs on Vite's own dev server (port 5173/5174).
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));

  // SPA fallback — return index.html for all non-API GET requests
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

// ─── Error Handling (must be last) ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});
