// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { authMiddleware } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { setupOAuth } = require('./config/oauth');

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

const app = express();

console.log('--- Initializing Backend Application ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Raw FRONTEND_URL from env:', process.env.FRONTEND_URL);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.FRONTEND_URL,
].filter(Boolean);

console.log('Allowed Origins for CORS:', allowedOrigins);

if (allowedOrigins.length === 0 && process.env.NODE_ENV === 'production') {
  console.warn(
    'CRITICAL: No allowed origins configured for CORS in production! FRONTEND_URL might be missing.'
  );
}

const corsOptions = {
  origin: function (origin, callback) {
    console.log(`CORS Check: Request Origin: ${origin}`);
    if (!origin || allowedOrigins.includes(origin)) {
      console.log(`CORS Check: Origin ${origin} ALLOWED.`);
      callback(null, true);
    } else {
      console.error(`CORS Check: Origin ${origin} DENIED.`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Stripe-Signature',
    'X-Requested-With',
  ],
  optionsSuccessStatus: 204,
};

app.use((req, res, next) => {
  console.log(
    `Incoming Request: ${req.method} ${req.path}, Origin: ${req.headers.origin}`
  );
  next();
});

app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    console.log('Stripe webhook /api/stripe/webhook hit with raw body parser.');

    res.status(200).send('Webhook Handled');
  }
);

app.use(cors(corsOptions));

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default-dev-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
    },
    proxy: process.env.NODE_ENV === 'production',
  })
);

if (process.env.NODE_ENV !== 'test') {
  const passport = setupOAuth();
  app.use(passport.initialize());
  app.use(passport.session());
}

app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/exercises', authMiddleware, exerciseRoutes);
app.use('/api/planned-workouts', authMiddleware, plannedRoutes);
app.use('/api/actual-workouts', authMiddleware, actualRoutes);
app.use('/api/statistics', authMiddleware, statisticsRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/memberships', authMiddleware, membershipRoutes);
app.use('/api/membership-plans', authMiddleware, membershipPlanRoutes);
app.use('/api/classes', authMiddleware, classRoutes);
app.use('/api/bookings', authMiddleware, bookingRoutes);
app.use('/api/competitions', authMiddleware, competitionRoutes);
app.use('/api/food-items', authMiddleware, foodItemRoutes);
app.use('/api/diet', authMiddleware, dietEntryRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/uploads', authMiddleware, uploadRoutes);
app.use('/api/stripe', authMiddleware, stripeRoutes);

app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

app.use(errorHandler);

module.exports = app;