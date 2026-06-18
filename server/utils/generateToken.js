const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token
 * @param {string} id   - MongoDB user _id
 * @param {string} role - User role
 * @returns {string}    - Signed JWT string
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

module.exports = generateToken;
