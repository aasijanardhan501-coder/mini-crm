const { validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

/**
 * Middleware: collect express-validator errors and short-circuit if any exist
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return sendError(res, 422, messages[0], errors.array());
  }
  next();
};

module.exports = validate;
