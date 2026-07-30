const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  doctorLogin,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Rate limiting for auth routes: 20 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes',
    code: 'TOO_MANY_REQUESTS'
  }
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/doctor/login', authLimiter, doctorLogin);
router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/reset-password/:token', authLimiter, resetPassword);
router.post('/logout', logout);
router.post('/refresh-token', authLimiter, refreshToken);
router.get('/me', protect, getMe);

module.exports = router;
