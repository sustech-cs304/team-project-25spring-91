//src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { authMiddleware } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { setupOAuth } = require('./config/oauth');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const exerciseRoutes = require('./routes/exercises.routes');
const plannedRoutes = require('./routes/planned.routes');
const actualRoutes = require('./routes/actual.routes');
const statisticsRoutes = require('./routes/statistics.routes');
const gymRoutes = require('./routes/gym.routes');
const membershipRoutes = require('./routes/membership.routes');
const classRoutes = require('./routes/class.routes');
const bookingRoutes = require('./routes/booking.routes');
const membershipPlanRoutes = require('./routes/membershipPlan.routes');
const competitionRoutes = require('./routes/competition.routes');
const foodItemRoutes = require('./routes/foodItem.routes');
const dietEntryRoutes = require('./routes/dietEntry.routes');
const aiRoutes = require('./routes/ai.routes');
const uploadRoutes = require('./routes/uploads.routes');
const stripeRoutes = require('./routes/stripe.routes'); 

// Initialize express app
const app = express();

//raw body parser for Stripe webhooks must come before other middleware ****important
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }));


// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false
}));

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Stripe-Signature']
}));

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Stripe-Signature');
  next();
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'workout-tracker-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  },
  proxy: true
}));

// Setup OAuth with Passport (only if not in test environment)
if (process.env.NODE_ENV !== 'test') {
  const passport = setupOAuth();
  app.use(passport.initialize());
  app.use(passport.session());
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/exercises', authMiddleware, exerciseRoutes);
app.use('/api/planned-workouts', authMiddleware, plannedRoutes);
app.use('/api/actual-workouts', authMiddleware, actualRoutes);
app.use('/api/statistics', authMiddleware, statisticsRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/membership-plans', membershipPlanRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/food-items', foodItemRoutes);
app.use('/api/diet', dietEntryRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/stripe', stripeRoutes); 

// Error handling middleware
app.use(errorHandler);

module.exports = app;