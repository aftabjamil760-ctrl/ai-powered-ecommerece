/**
 * Request Validation Middleware
 * Validates incoming requests against defined rules
 */

const { AppError } = require('./errorHandler');

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Min 8 chars, at least one uppercase, one lowercase, one number
  return password.length >= 8;
};

const validateAuthRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required', 400);
  }

  if (!validateEmail(email)) {
    throw new AppError('Invalid email format', 400);
  }

  if (!validatePassword(password)) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  if (name.length < 2) {
    throw new AppError('Name must be at least 2 characters', 400);
  }

  next();
};

const validateAuthLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  if (!validateEmail(email)) {
    throw new AppError('Invalid email format', 400);
  }

  next();
};

const validatePagination = (req, res, next) => {
  let { page, limit } = req.query;
  page = Math.max(1, parseInt(page) || 1);
  limit = Math.max(1, Math.min(100, parseInt(limit) || 10));

  req.pagination = { page, limit, skip: (page - 1) * limit };
  next();
};

const validateMongoId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || id.length !== 24) {
    throw new AppError('Invalid ID format', 400);
  }

  next();
};

module.exports = {
  validateAuthRegister,
  validateAuthLogin,
  validatePagination,
  validateMongoId,
  validateEmail,
  validatePassword
};
