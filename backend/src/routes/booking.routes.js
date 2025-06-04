// src/routes/booking.routes.js
const express = require('express');
const { validate } = require('../middleware/validate');
const { bookingController } = require('../controllers/booking.controller');
const { bookingSchemas } = require('../validators/booking.validator');
const { asyncHandler } = require('../utils/asyncHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get(
  '/my-bookings',
  asyncHandler(bookingController.getUserBookings)
);

router.get(
  '/upcoming',
  asyncHandler(bookingController.getUpcomingBookings)
);

router.get(
    '/history',
    validate(bookingSchemas.listBookingHistoryQuery), // Apply validation
    asyncHandler(bookingController.getBookingHistory)
  );

router.get(
  '/:id',
  validate(bookingSchemas.getBooking),
  asyncHandler(bookingController.getBookingById)
);

router.post(
  '/',
  validate(bookingSchemas.createBooking),
  asyncHandler(bookingController.createBooking)
);

router.put(
  '/:id/cancel',
  validate(bookingSchemas.cancelBooking),
  asyncHandler(bookingController.cancelBooking)
);

router.put(
  '/:id/mark-attended',
  validate(bookingSchemas.markAttended),
  asyncHandler(bookingController.markBookingAttended)
);

module.exports = router;