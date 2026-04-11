const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// Make protect middleware optional by creating a custom one?
// The prompt says "Logged-in user data: {userAppointments}". 
// So the AI assistant can be used by public users, but also logged-in users.
// Let's create an optionalAuth middleware.

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      console.error('Invalid token in optional auth');
    }
  }
  next();
};

router.post('/chat', optionalAuth, chat);

module.exports = router;
