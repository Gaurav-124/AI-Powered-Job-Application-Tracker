const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'openai/gpt-oss-20b:free';// free model on OpenRouter

// ─── Helper: call OpenRouter ────────────────────────────────────────────────
const callAI = async (prompt, jsonMode = false) => {
  const body = {
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
  };
  if (jsonMode) body.response_format = { type: 'json_object' };

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5000',
      'X-Title': 'AI Job Tracker'
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || `OpenRouter error: ${res.status}`);
  }

  return data.choices[0].message.content;
};

// ─── 1. EXTRACT STRUCTURED DATA FROM JD ────────────────────────────────────
const extractJD = async (jdText) => {
  const prompt = `
    Extract structured information from the following job description.
    Return ONLY a valid JSON object with exactly these fields:
    {
      "role": "job title/role as string",
      "company": "company name or empty string if not mentioned",
      "requiredSkills": ["array", "of", "required", "skills"],
      "niceToHave": ["array", "of", "optional", "skills"],
      "experienceYears": 0,
      "keyResponsibilities": ["array", "of", "max", "5", "responsibilities"],
      "salaryRange": "salary range or empty string"
    }
    
    Be precise — only extract what is explicitly mentioned.
    If something is not mentioned, use empty string or 0.
    Return ONLY the JSON object, no extra text.

    JOB DESCRIPTION:
    ${jdText}
  `;

  const text = await callAI(prompt, true);
  
  // Clean and parse JSON
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
};

// ─── 2. GAP ANALYSIS ────────────────────────────────────────────────────────
const analyseGap = async (resumeText, extractedJD) => {
  const prompt = `
    You are an expert technical recruiter. Compare the candidate's resume against the job requirements.
    Return ONLY a valid JSON object with exactly these fields:
    {
      "matchScore": 75,
      "matchingSkills": ["skills", "candidate", "has"],
      "missingSkills": ["skills", "candidate", "lacks"],
      "partialMatches": ["skills", "with", "partial", "experience"],
      "recommendation": "2-3 sentence honest assessment"
    }

    matchScore should be 0-100 based on how many required skills and experience requirements are met.
    Return ONLY the JSON object, no extra text.

    CANDIDATE RESUME:
    ${resumeText}

    JOB REQUIREMENTS:
    Role: ${extractedJD.role}
    Required Skills: ${extractedJD.requiredSkills.join(', ')}
    Nice to Have: ${extractedJD.niceToHave.join(', ')}
    Experience Required: ${extractedJD.experienceYears} years
    Responsibilities: ${extractedJD.keyResponsibilities.join('; ')}
  `;

  const text = await callAI(prompt, true);
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
};

// ─── 3. COVER LETTER GENERATION ─────────────────────────────────────────────
const generateCoverLetter = async (resumeText, extractedJD) => {
  const prompt = `
    Write a professional, tailored cover letter for this specific job application.
    
    RULES:
    - Reference specific skills from the resume that match the job requirements
    - Mention the company name and role specifically if available
    - Keep it to 3 paragraphs: intro, why I am a fit, closing
    - Do NOT use generic phrases like "I am a hardworking individual"
    - Make it sound human and specific, not AI-generated
    - Do not include placeholders like [Your Name] or [Date]
    - Return only the cover letter text, nothing else
    
    CANDIDATE RESUME:
    ${resumeText}

    JOB DETAILS:
    Role: ${extractedJD.role}
    Company: ${extractedJD.company || 'the company'}
    Required Skills: ${extractedJD.requiredSkills.join(', ')}
    Key Responsibilities: ${extractedJD.keyResponsibilities.join('; ')}
  `;

  return await callAI(prompt, false);
};

module.exports = { extractJD, analyseGap, generateCoverLetter };