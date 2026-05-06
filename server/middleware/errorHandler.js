const AppError = require('../error/AppError');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.isOperational ? err.message : 'An unexpected error occurred.',
    error_code: err.errorCode || 'UNEXPECTED_ERROR'
  };
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
    response.details = err.details;
  }
  console.error(`[${new Date().toISOString()}]`, err);
  res.status(statusCode).json(response);
}

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: 'Route not found.', error_code: 'NOT_FOUND' });
}

module.exports = { errorHandler, notFoundHandler, AppError };
