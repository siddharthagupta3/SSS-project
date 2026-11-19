const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes: Validates Bearer JWT from Authorization header
 * Attaches the authenticated user object to `req.user`
 */
const verifyToken = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not set in .env');
      }

      const decoded = jwt.verify(token, jwtSecret);

      // Fetch user from database excluding password
      req.user = await User.findById(decoded.id).select('-password +authVersion');

      if (!req.user) {
        res.status(401);
        throw new Error('User no longer exists. Authorization denied.');
      }
      const currentVersion = Number(req.user.authVersion || 0);
      if (Number(decoded.tokenVersion) !== currentVersion) {
        res.status(401);
        throw new Error('Session has been invalidated');
      }

      return next();
    } catch (error) {
      res.status(401);
      return next(new Error('Not authorized. Token verification failed.'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized. No token provided in header.'));
  }
};

/**
 * Role-Based Access Control: Ensures authenticated user has admin role
 */
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  return next(new Error('Access forbidden. Admin role required for this action.'));
};

const requireSeller = (req, res, next) => {
  if (req.user) {
    return next();
  }
  res.status(403);
  return next(new Error('Seller access required for this action.'));
};

const optionalVerifyToken = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) return next();

  try {
    const token = authorization.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return next();
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id).select('-password +authVersion');
    if (user) {
      const currentVersion = Number(user.authVersion || 0);
      if (Number(decoded.tokenVersion) === currentVersion) req.user = user;
    }
  } catch {
    // Public seller setup may continue without a valid optional session.
  }
  return next();
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireSeller,
  optionalVerifyToken,
};
