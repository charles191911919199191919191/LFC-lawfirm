const { validationResult } = require('express-validator');
const AppError = require('../error/AppError');

function validateInput(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Invalid input data.', 400, 'VALIDATION_ERROR', { errors: errors.array() }));
  }
  next();
}

module.exports = validateInput;
