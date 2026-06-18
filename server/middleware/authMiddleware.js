const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

/**
 * protect – Verify JWT and attach user to req.user
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Not authorized — no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return sendError(res, 401, 'Not authorized — user no longer exists');
    }

    next();
  } catch (err) {
    return sendError(res, 401, 'Not authorized — token is invalid or expired');
  }
};

/**
 * authorize – Role-based access control
 * Usage: authorize('admin', 'manager')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 500, 'Authorization middleware used without protect');
    }
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Role '${req.user.role}' is not permitted to access this resource`
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
