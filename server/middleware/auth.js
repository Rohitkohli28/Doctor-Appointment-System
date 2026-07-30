const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Read token from HttpOnly cookies first
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  // 2. Fallback to Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token', code: 'UNAUTHORIZED' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
       return res.status(401).json({ success: false, message: 'Not authorized, user not found', code: 'UNAUTHORIZED' });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed', code: 'UNAUTHORIZED' });
  }
};

module.exports = { protect };
