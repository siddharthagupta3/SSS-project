const jwt = require('jsonwebtoken');

/**
 * Generate a signed JSON Web Token (JWT)
 * @param {string} id - The MongoDB User ObjectId
 * @param {string} role - User role ('user' or 'admin')
 * @returns {string} Signed JWT token
 */
const generateToken = (id, role = 'user') => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_for_development_mode_only';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ id, role }, secret, {
    expiresIn,
  });
};

module.exports = generateToken;
