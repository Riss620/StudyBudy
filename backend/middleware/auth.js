const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes with JWT authentication
 * Verifies token from Authorization header and attaches user to request
 * Usage: app.use('/protected-route', protect, handler)
 */
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify token and decode payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token ID and attach to request
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // No token found
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };

