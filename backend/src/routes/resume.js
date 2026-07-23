const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect } = require("../middleware/auth");
const { uploadResume, getResume } = require("../controllers/resumeController");

// Store uploaded file temporarily on disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user._id}-${Date.now()}-${file.originalname}`);
  },
});

// Only allow PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

router.get("/", protect, getResume);
router.post("/upload", protect, upload.single("resume"), uploadResume);

// Multer error handler
router.use((err, req, res, next) => {
  if (err.message === "Only PDF files are allowed") {
    return res.status(400).json({ message: "Only PDF files are allowed" });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large. Maximum size is 5MB" });
  }
  next(err);
});

module.exports = router;
