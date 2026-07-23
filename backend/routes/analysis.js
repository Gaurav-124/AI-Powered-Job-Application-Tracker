const express    = require('express');
const rateLimit  = require('express-rate-limit');
const { protect } = require('../middleware/auth');
const {
  runAnalysis, getHistory, getAnalysisById, deleteAnalysis
} = require('../controllers/analysisController');

const router = express.Router();

// Rate limit AI calls — Gemini free tier has limits
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 5,
  message: { message: 'Too many AI requests. Please wait a moment.' }
});

router.post('/run',   protect, aiLimiter, runAnalysis);
router.get('/',       protect, getHistory);
router.get('/:id',    protect, getAnalysisById);
router.delete('/:id', protect, deleteAnalysis);

module.exports = router;
