const Resume = require("../models/Resume");
const Analysis = require("../models/Analysis");
const { extractJD, analyseGap, generateCoverLetter } = require("../services/geminiService");

// POST /api/analysis/extract-jd
// Step 1: User pastes a JD — extract structured data from it
const extractJobDescription = async (req, res) => {
  try {
    const { jdText } = req.body;
    if (!jdText || jdText.trim().length < 50) {
      return res.status(400).json({ message: "Please provide a valid job description (at least 50 characters)" });
    }

    const extractedJD = await extractJD(jdText);

    res.json({ extractedJD });
  } catch (err) {
    console.error("JD extraction error:", err);
    res.status(500).json({ message: "Failed to extract job description. Please try again." });
  }
};

// POST /api/analysis/analyse
// Step 2 + 3: Gap analysis + cover letter generation (runs together)
const runFullAnalysis = async (req, res) => {
  try {
    const { jdText, extractedJD } = req.body;

    if (!jdText || !extractedJD) {
      return res.status(400).json({ message: "jdText and extractedJD are required" });
    }

    // Check that the user has uploaded a resume
    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(400).json({ message: "Please upload your resume first" });
    }

    // Run gap analysis
    const gapAnalysis = await analyseGap(resume.rawText, extractedJD);

    // Generate cover letter
    const coverLetter = await generateCoverLetter(resume.rawText, extractedJD, gapAnalysis);

    // Save everything to DB
    const analysis = await Analysis.create({
      userId: req.user._id,
      resumeId: resume._id,
      jdText,
      extractedJD,
      gapAnalysis,
      coverLetter,
    });

    res.status(201).json({
      analysisId: analysis._id,
      extractedJD,
      gapAnalysis,
      coverLetter,
    });
  } catch (err) {
    console.error("Analysis error:", err);
    res.status(500).json({ message: "Analysis failed. Please try again." });
  }
};

// GET /api/analysis/history
// Get all past analyses for the logged-in user
const getHistory = async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("extractedJD.role extractedJD.company gapAnalysis.matchScore createdAt _id");

    res.json({ analyses });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/analysis/:id
// Get one full analysis by ID
const getAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/analysis/:id
const deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { extractJobDescription, runFullAnalysis, getHistory, getAnalysis, deleteAnalysis };
