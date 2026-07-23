const express    = require('express');
const rateLimit  = require('express-rate-limit');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' }
});

router.post('/register', authLimiter, register);
router.post('/login',    authLimiter, login);
router.get('/me',        protect, getMe);

module.exports = router;
