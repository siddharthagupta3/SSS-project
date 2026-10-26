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
      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_development_mode_only';
      
      // Security warning if using fallback
      if (!process.env.JWT_SECRET) {
        console.warn('⚠️ SECURITY WARNING: Using fallback JWT_SECRET. Set JWT_SECRET in .env for production!');
      }
      
      const decoded = jwt.verify(token, jwtSecret);

      // Fetch user from database excluding password
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('User no longer exists. Authorization denied.');
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

module.exports = {
  verifyToken,
  requireAdmin,
};
