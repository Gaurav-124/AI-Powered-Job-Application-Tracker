const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  extractJobDescription,
  runFullAnalysis,
  getHistory,
  getAnalysis,
  deleteAnalysis,
} = require("../controllers/analysisController");

router.post("/extract-jd", protect, extractJobDescription);
router.post("/analyse", protect, runFullAnalysis);
router.get("/history", protect, getHistory);
router.get("/:id", protect, getAnalysis);
router.delete("/:id", protect, deleteAnalysis);

module.exports = router;
