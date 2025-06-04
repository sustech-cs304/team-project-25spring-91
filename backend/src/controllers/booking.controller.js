// src/controllers/booking.controller.js
const { bookingService } = require('../services/booking.service');

const bookingController = {
  getUserBookings: async (req, res) => {
    const userId = req.user.id;
    const bookings = await bookingService.getUserBookings(userId);
    
    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: bookings
    });
  },
  
  getUpcomingBookings: async (req, res) => {
    const userId = req.user.id;
    const bookings = await bookingService.getUpcomingBookings(userId);
    
    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: bookings
    });
  },
  
 getBookingHistory: async (req, res) => {
      const userId = req.user.id;
      const { page, limit, paginate } = req.query;

      const history = await bookingService.getBookingHistory(userId, {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        paginate: paginate !== 'false',
      });

      if (!history.paginationApplied) {
        res.status(200).json({
          status: 'success',
          results: history.totalItems,
          data: history.bookings,
        });
      } else {
        res.status(200).json({
          status: 'success',
          results: history.bookings.length,
          pagination: {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            totalPages: history.totalPages,
            totalItems: history.totalItems,
          },
          data: history.bookings,
        });
      }
    },
  
  getBookingById: async (req, res) => {
    const userId = req.user.id;
    const bookingId = parseInt(req.params.id);
    
    const booking = await bookingService.getBookingById(userId, bookingId);
    
    res.status(200).json({
      status: 'success',
      data: booking
    });
  },
  
  createBooking: async (req, res) => {
    const userId = req.user.id;
    const bookingData = {
      ...req.body,
      userId
    };
    
    const newBooking = await bookingService.createBooking(bookingData);
    
    res.status(201).json({
      status: 'success',
      message: 'Class booked successfully',
      data: newBooking
    });
  },
  
  cancelBooking: async (req, res) => {
    const userId = req.user.id;
    const bookingId = parseInt(req.params.id);
    const { cancellationReason } = req.body;
    
    await bookingService.cancelBooking(userId, bookingId, cancellationReason);
    
    res.status(200).json({
      status: 'success',
      message: 'Booking cancelled successfully'
    });
  },
  
  markBookingAttended: async (req, res) => {
    const userId = req.user.id;
    const bookingId = parseInt(req.params.id);
    
    await bookingService.markBookingAttended(userId, bookingId);
    
    res.status(200).json({
      status: 'success',
      message: 'Booking marked as attended'
    });
  }
};

module.exports = { bookingController };