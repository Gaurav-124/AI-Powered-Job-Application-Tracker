# AI Job Application Tracker

An AI-powered job application tool built with MERN stack + Gemini API.

## Features
- **JD Extraction** — paste any job description → AI extracts role, required skills, experience, responsibilities as structured JSON
- **Gap Analysis** — upload your resume → AI compares it against the JD and shows matching skills, missing skills, and a match score
- **Cover Letter** — AI generates a tailored cover letter using your actual resume content + the specific JD
- **History** — all analyses saved to your account

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB Atlas (no vectors needed)
- AI: Gemini 2.0 Flash (structured JSON output + multi-document prompting)
- Auth: JWT

## Setup Instructions

### 1. Clone and install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Backend environment variables

Copy `.env.example` to `.env` and fill in:

```
PORT=5000
MONGO_URI=mongodb+srv://...your MongoDB Atlas URI...
JWT_SECRET=any_long_random_string_here
GEMINI_API_KEY=your_gemini_api_key_from_aistudio.google.com
CLIENT_URL=http://localhost:5173
```

Get your free Gemini API key at: https://aistudio.google.com/app/apikey

### 3. Run locally

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Frontend: http://localhost:5173
Backend:  http://localhost:5000

### 4. Deploy

**Backend → Render:**
- New Web Service → connect GitHub repo
- Root directory: `backend`
- Build command: `npm install`
- Start command: `node server.js`
- Add all environment variables in Render dashboard

**Frontend → Vercel:**
- Import project → set root directory to `frontend`
- Add env variable: `VITE_API_URL` = your Render backend URL
- Update `vite.config.js` proxy to point to your Render URL for production

## Project Structure

```
job-tracker/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── config/db.js           # MongoDB connection
│   ├── middleware/auth.js     # JWT middleware
│   ├── models/                # User, Resume, Analysis schemas
│   ├── controllers/           # Business logic
│   ├── routes/                # API routes
│   └── services/geminiService.js  # All 3 Gemini AI calls
└── frontend/
    └── src/
        ├── App.jsx            # Routes
        ├── context/AuthContext.jsx
        ├── pages/             # Login, Register, Dashboard, Analyse, Result, History
        └── components/        # Navbar
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Get current user |
| POST | /api/resume/upload | Upload PDF resume |
| GET  | /api/resume | List all resumes |
| DELETE | /api/resume/:id | Delete resume |
| POST | /api/analysis/run | Run full analysis (JD extract + gap + cover letter) |
| GET  | /api/analysis | Get history |
| GET  | /api/analysis/:id | Get single analysis |
| DELETE | /api/analysis/:id | Delete analysis |
