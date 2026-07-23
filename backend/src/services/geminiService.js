const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 1: Extract structured data from a raw JD text
// This is the NEW SKILL — responseSchema forces Gemini to return exact JSON
// ─────────────────────────────────────────────────────────────────────────────
const extractJD = async (jdText) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          role: {
            type: SchemaType.STRING,
            description: "The job title or role name",
          },
          company: {
            type: SchemaType.STRING,
            description: "Company name if mentioned, otherwise empty string",
          },
          requiredSkills: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Skills explicitly required for this role",
          },
          niceToHave: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Skills that are preferred but not mandatory",
          },
          experienceYears: {
            type: SchemaType.NUMBER,
            description: "Minimum years of experience required, 0 if not mentioned",
          },
          keyResponsibilities: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Main responsibilities of the role (max 6 points)",
          },
          salaryRange: {
            type: SchemaType.STRING,
            description: "Salary range if mentioned, otherwise empty string",
          },
        },
        required: ["role", "requiredSkills", "niceToHave", "keyResponsibilities"],
      },
    },
  });

  const prompt = `
You are a job description analyser. Extract structured information from the job description below.

Job Description:
${jdText}

Extract all technical skills, tools, frameworks, and soft skills mentioned.
Be specific — list individual skills like "Node.js", "Docker", "REST APIs" not just "backend development".
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Parse the guaranteed JSON response
  return JSON.parse(text);
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 2: Gap analysis — compare resume vs extracted JD
// Multi-document prompting: both resume text + JD JSON go into one prompt
// ─────────────────────────────────────────────────────────────────────────────
const analyseGap = async (resumeText, extractedJD) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          matchScore: {
            type: SchemaType.NUMBER,
            description: "Overall match percentage 0-100 based on required skills match",
          },
          youHave: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Skills from the resume that match the job requirements",
          },
          missing: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Required skills from the JD that are not found in the resume",
          },
          suggestions: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Specific, actionable suggestions for what to learn or improve (max 5)",
          },
        },
        required: ["matchScore", "youHave", "missing", "suggestions"],
      },
    },
  });

  const prompt = `
You are a career coach reviewing a candidate's resume against a job description.

--- CANDIDATE RESUME ---
${resumeText}

--- JOB REQUIREMENTS ---
Role: ${extractedJD.role}
Required Skills: ${extractedJD.requiredSkills.join(", ")}
Nice to Have: ${extractedJD.niceToHave.join(", ")}
Experience Required: ${extractedJD.experienceYears} years
Key Responsibilities: ${extractedJD.keyResponsibilities.join("; ")}

--- YOUR TASK ---
1. Find which required skills the candidate already has (look for them in resume text, projects, and experience)
2. Find which required skills are missing from the resume
3. Calculate a match score: (skills matched / total required skills) * 100
4. Give specific, honest suggestions for improvement

Be thorough — if a skill is mentioned in a project, count it as present.
Be honest — do not inflate the match score.
  `;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 3: Generate a tailored cover letter
// Uses both resume + JD to write something specific, not generic
// ─────────────────────────────────────────────────────────────────────────────
const generateCoverLetter = async (resumeText, extractedJD, gapAnalysis) => {
  // For cover letter we want free text, not JSON
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const prompt = `
You are an expert career coach writing a tailored cover letter for a job applicant.

--- CANDIDATE RESUME ---
${resumeText}

--- JOB DETAILS ---
Role: ${extractedJD.role}
Company: ${extractedJD.company || "the company"}
Required Skills: ${extractedJD.requiredSkills.join(", ")}
Key Responsibilities: ${extractedJD.keyResponsibilities.join("; ")}

--- CANDIDATE'S MATCHING SKILLS ---
${gapAnalysis.youHave.join(", ")}

--- INSTRUCTIONS ---
Write a professional 3-paragraph cover letter that:
1. Opening paragraph: Express genuine interest in the ${extractedJD.role} role. Mention 2-3 specific matching skills from the candidate's background.
2. Middle paragraph: Give a specific example from the candidate's projects/experience that directly demonstrates their ability to handle the key responsibilities.
3. Closing paragraph: Brief, confident closing. Express enthusiasm to discuss further.

Rules:
- Write in first person as the candidate
- Reference SPECIFIC projects, technologies, and skills from the resume — not generic phrases
- Do NOT mention missing skills or gaps
- Keep it under 300 words
- Do NOT include placeholder brackets like [your name] — just write the letter
- Start directly with "Dear Hiring Manager,"
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

module.exports = { extractJD, analyseGap, generateCoverLetter };
