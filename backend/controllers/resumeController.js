const pdfParse = require('pdf-parse');
const fs       = require('fs');
const Resume   = require('../models/Resume');

// POST /api/resume/upload
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: 'No file uploaded' });

    // Extract text from the uploaded PDF (already in memory, no disk I/O needed)
    const parsed  = await pdfParse(req.file.buffer);
    const rawText = parsed.text.trim();

    if (!rawText || rawText.length < 50)
      return res.status(400).json({ message: 'Could not extract text from PDF. Make sure it is not a scanned image.' });

    // Save to MongoDB
    const resume = await Resume.create({
      userId:   req.user.id,
      filename: req.file.originalname,
      rawText
    });

    res.status(201).json({
      message: 'Resume uploaded successfully',
      resume: {
        id:       resume._id,
        filename: resume.filename,
        preview:  rawText.slice(0, 200) + '...',  // first 200 chars as preview
        uploadedAt: resume.uploadedAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/resume — get all resumes for logged-in user
const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id })
      .select('-rawText')  // Don't send full text in list view
      .sort({ createdAt: -1 });
    res.json(resumes);
  } catch (err) { next(err); }
};

// GET /api/resume/:id — get single resume (including raw text for analysis)
const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json(resume);
  } catch (err) { next(err); }
};

// DELETE /api/resume/:id
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json({ message: 'Resume deleted' });
  } catch (err) { next(err); }
};

module.exports = { uploadResume, getResumes, getResumeById, deleteResume };