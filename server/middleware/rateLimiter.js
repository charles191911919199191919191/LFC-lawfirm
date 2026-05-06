const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests. Please try again later.', error_code: 'TOO_MANY_REQUESTS' }
});

const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many requests. Please try again later.', error_code: 'TOO_MANY_REQUESTS' }
});

module.exports = { authLimiter, writeLimiter };
