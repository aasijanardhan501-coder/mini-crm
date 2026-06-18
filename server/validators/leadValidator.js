const { body, param } = require('express-validator');

const createLeadValidator = [
  body('name')
    .notEmpty()
    .withMessage('Lead name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Lead name must be between 2 and 100 characters')
    .trim(),
  body('email')
    .notEmpty()
    .withMessage('Lead email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('company')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'converted', 'lost'])
    .withMessage('Invalid status value'),
  body('source')
    .optional()
    .isIn(['website', 'referral', 'social', 'advertisement', 'other'])
    .withMessage('Invalid source value'),
  body('value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Lead value must be a positive number'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid User ID format for assignedTo'),
];

const updateLeadValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid lead ID format'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Lead name must be between 2 and 100 characters')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('company')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'converted', 'lost'])
    .withMessage('Invalid status value'),
  body('source')
    .optional()
    .isIn(['website', 'referral', 'social', 'advertisement', 'other'])
    .withMessage('Invalid source value'),
  body('value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Lead value must be a positive number'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid User ID format for assignedTo'),
];

const updateStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid lead ID format'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['new', 'contacted', 'qualified', 'converted', 'lost'])
    .withMessage('Invalid status value'),
];

const addNoteValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid lead ID format'),
  body('content')
    .notEmpty()
    .withMessage('Note content cannot be empty')
    .trim(),
];

module.exports = {
  createLeadValidator,
  updateLeadValidator,
  updateStatusValidator,
  addNoteValidator,
};
