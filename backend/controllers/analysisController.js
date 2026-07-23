const Analysis = require('../models/Analysis');
const Resume   = require('../models/Resume');
const { extractJD, analyseGap, generateCoverLetter } = require('../services/geminiService');

// POST /api/analysis/run
// Main endpoint: takes resumeId + jdText → runs all 3 AI calls → saves + returns result
const runAnalysis = async (req, res, next) => {
  try {
    const { resumeId, jdText } = req.body;

    if (!resumeId || !jdText)
      return res.status(400).json({ message: 'resumeId and jdText are required' });

    if (jdText.trim().length < 100)
      return res.status(400).json({ message: 'Job description is too short. Please paste the full JD.' });

    // 1. Fetch the resume (make sure it belongs to this user)
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    // 2. Run the 3 AI calls in sequence
    // Step 1: Extract structured data from JD
    const extractedJD = await extractJD(jdText);

    // Step 2: Gap analysis (resume vs extracted JD)
    const gapAnalysis = await analyseGap(resume.rawText, extractedJD);

    // Step 3: Generate tailored cover letter
    const coverLetter = await generateCoverLetter(resume.rawText, extractedJD);

    // 3. Save the full analysis to MongoDB
    const analysis = await Analysis.create({
      userId:     req.user.id,
      resumeId:   resume._id,
      jdText,
      extractedJD,
      gapAnalysis,
      coverLetter
    });

    res.status(201).json({
      message: 'Analysis complete',
      analysis
    });
  } catch (err) { next(err); }
};

// GET /api/analysis — get all analyses for logged-in user (history)
const getHistory = async (req, res, next) => {
  try {
    const analyses = await Analysis.find({ userId: req.user.id })
      .select('extractedJD.role extractedJD.company gapAnalysis.matchScore createdAt resumeId')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(analyses);
  } catch (err) { next(err); }
};

// GET /api/analysis/:id — get one analysis in full
const getAnalysisById = async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user.id });
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
    res.json(analysis);
  } catch (err) { next(err); }
};

// DELETE /api/analysis/:id
const deleteAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
    res.json({ message: 'Analysis deleted' });
  } catch (err) { next(err); }
};

module.exports = { runAnalysis, getHistory, getAnalysisById, deleteAnalysis };
