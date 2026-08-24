const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    {
      userId,
      role
    },
    process.env.JWT_SECRET || 'mrc_foods_secret_key',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    }
  );
};

module.exports = generateToken;
