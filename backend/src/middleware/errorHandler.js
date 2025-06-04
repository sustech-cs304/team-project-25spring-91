// src/middleware/errorHandler.js
const { Prisma } = require('@prisma/client');
const { ApiError } = require('../utils/ApiError');
const { cleanupImageOnError } = require('./upload');

const errorHandler = async (err, req, res, next) => {
  console.error(err);

  // Add CORS headers to error responses
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  // Clean up processed image if validation failed
  if (req.processedImage && (err.statusCode === 400 || err.name === 'ZodError')) {
    await cleanupImageOnError(req);
  }

  // Prisma specific errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Clean up image for database errors too
    if (req.processedImage) {
      await cleanupImageOnError(req);
    }
    
    if (err.code === 'P2002') {
      return res.status(409).json({
        status: 'error',
        message: 'A resource with this data already exists',
        error: err.meta?.target || 'Unique constraint violation'
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found',
        error: err.meta?.cause || 'Record not found'
      });
    }
    return res.status(400).json({
      status: 'error',
      message: 'Database error',
      error: err.message
    });
  }

  // Handle our custom API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      error: err.error || undefined
    });
  }

  // Default error handling
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  return res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500 ? 'Internal Server Error' : message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = { errorHandler };