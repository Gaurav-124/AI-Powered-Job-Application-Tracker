const express = require('express');
const multer  = require('multer');
const path    = require('path');
const { protect } = require('../middleware/auth');
const {
  uploadResume, getResumes, getResumeById, deleteResume
} = require('../controllers/resumeController');

const router = express.Router();

// Multer config — store temp files on disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  }
});

router.post('/upload',  protect, upload.single('resume'), uploadResume);
router.get('/',         protect, getResumes);
router.get('/:id',      protect, getResumeById);
router.delete('/:id',   protect, deleteResume);

module.exports = router;
