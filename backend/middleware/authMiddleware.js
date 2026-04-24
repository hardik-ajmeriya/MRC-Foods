const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Token is missing.'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Token is missing.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mrc_foods_secret_key');

    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User is inactive or does not exist.'
      });
    }

    req.user = {
      id: user._id.toString(),
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    };

    return next();
  } catch (error) {
    console.error('Protect middleware error:', error);

    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid or expired token.'
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User context is missing.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access this resource.'
      });
    }

    return next();
  };
};

module.exports = {
  protect,
  authorizeRoles
};
