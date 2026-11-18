const jwt = require('jsonwebtoken');

/**
 * Generate a signed JSON Web Token (JWT)
 * @param {string} id - The MongoDB User ObjectId
 * @param {string} role - User role ('user' or 'admin')
 * @returns {string} Signed JWT token
 */
const generateToken = (id, role = 'user', expiresInOverride) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = expiresInOverride || process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET is not set in .env');
  }

  return jwt.sign({ id, role }, secret, {
    expiresIn,
  });
};

module.exports = generateToken;
