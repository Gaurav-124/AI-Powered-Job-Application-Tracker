const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  jdText:       { type: String, required: true },

  // Structured data extracted from JD
  extractedJD:  {
    role:                { type: String },
    company:             { type: String },
    requiredSkills:      [String],
    niceToHave:          [String],
    experienceYears:     { type: Number },
    keyResponsibilities: [String],
    salaryRange:         { type: String }
  },

  // Gap analysis result
  gapAnalysis: {
    matchScore:       { type: Number },  // 0-100
    matchingSkills:   [String],
    missingSkills:    [String],
    partialMatches:   [String],
    recommendation:   { type: String }
  },

  // Generated cover letter
  coverLetter:  { type: String },

}, { timestamps: true });

module.exports = mongoose.model('Analysis', analysisSchema);
