const pdf = require("pdf-parse");
const fs = require("fs");
const Resume = require("../models/Resume");

// POST /api/resume/upload
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read the uploaded PDF and extract text
    const fileBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdf(fileBuffer);
    const rawText = pdfData.text;

    if (!rawText || rawText.trim().length < 50) {
      // Clean up temp file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Could not extract text from PDF. Make sure it is not a scanned image." });
    }

    // Delete the temp file (we store text in DB, not the file)
    fs.unlinkSync(req.file.path);

    // Save or update resume for this user (one resume per user)
    const resume = await Resume.findOneAndUpdate(
      { userId: req.user._id },
      { filename: req.file.originalname, rawText },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: "Resume uploaded successfully",
      resume: {
        id: resume._id,
        filename: resume.filename,
        uploadedAt: resume.updatedAt,
        preview: rawText.substring(0, 200) + "...",
      },
    });
  } catch (err) {
    console.error("Resume upload error:", err);
    // Clean up file if it exists
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Failed to process resume" });
  }
};

// GET /api/resume
const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: "No resume uploaded yet" });
    }
    res.json({
      id: resume._id,
      filename: resume.filename,
      uploadedAt: resume.updatedAt,
      preview: resume.rawText.substring(0, 300) + "...",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { uploadResume, getResume };
