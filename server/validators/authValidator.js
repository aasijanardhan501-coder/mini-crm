const { body } = require('express-validator');

// ─── Register Validator ───────────────────────────────────────────────────────
const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address')
    .customSanitizer((val) => val.toLowerCase()),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  body('role')
    .optional()
    .isIn(['admin', 'manager', 'viewer'])
    .withMessage('Role must be admin, manager, or viewer'),
];

// ─── Login Validator ──────────────────────────────────────────────────────────
const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address')
    .customSanitizer((val) => val.toLowerCase()),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ─── Update Profile Validator ─────────────────────────────────────────────────
const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .customSanitizer((val) => val.toLowerCase()),
];

module.exports = { registerValidator, loginValidator, updateProfileValidator };
