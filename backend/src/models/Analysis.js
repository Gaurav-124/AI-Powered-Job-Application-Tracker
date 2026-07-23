const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Raw JD text the user pasted
    jdText: {
      type: String,
      required: true,
    },
    // Structured JSON extracted from the JD by Gemini
    extractedJD: {
      role: String,
      company: String,
      requiredSkills: [String],
      niceToHave: [String],
      experienceYears: Number,
      keyResponsibilities: [String],
      salaryRange: String,
    },
    // Gap analysis result
    gapAnalysis: {
      matchScore: Number,           // 0-100
      youHave: [String],            // skills from resume that match JD
      missing: [String],            // required skills you don't have
      suggestions: [String],        // what to learn / how to improve
    },
    // Generated cover letter
    coverLetter: {
      type: String,
      default: "",
    },
    // Which resume was used
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analysis", analysisSchema);
