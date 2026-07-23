import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const steps = ['Upload Resume', 'Paste Job Description', 'Run Analysis'];

export default function Analyse() {
  const [step,        setStep]        = useState(0);
  const [resumes,     setResumes]     = useState([]);
  const [selectedId,  setSelectedId]  = useState('');
  const [uploading,   setUploading]   = useState(false);
  const [jdText,      setJdText]      = useState('');
  const [running,     setRunning]     = useState(false);
  const [error,       setError]       = useState('');
  const fileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/resume').then(r => {
      setResumes(r.data);
      if (r.data.length > 0) setSelectedId(r.data[0]._id);
    });
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('resume', file);
    setUploading(true); setError('');
    try {
      const { data } = await api.post('/resume/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newResume = { _id: data.resume.id, filename: data.resume.filename };
      setResumes(prev => [newResume, ...prev]);
      setSelectedId(newResume._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleRun = async () => {
    if (!selectedId) { setError('Please select or upload a resume first'); return; }
    if (jdText.trim().length < 100) { setError('Please paste a full job description (at least 100 characters)'); return; }
    setRunning(true); setError('');
    try {
      const { data } = await api.post('/analysis/run', { resumeId: selectedId, jdText });
      navigate(`/result/${data.analysis._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
      setRunning(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-navy mb-2">New Analysis</h1>
      <p className="text-gray-500 mb-8">Paste a job description and select your resume to get a full AI analysis</p>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 ${i <= step ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                ${i < step ? 'bg-primary text-white' : i === step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-primary' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>}

      {/* STEP 0: Resume */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-navy">1. Select Resume</h2>
          <button onClick={() => fileRef.current.click()} disabled={uploading}
            className="btn-secondary text-sm">
            {uploading ? 'Uploading...' : '+ Upload New PDF'}
          </button>
          <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
        </div>
        {resumes.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-3xl mb-2">📄</div>
            <p className="text-gray-500 text-sm">No resumes yet. Upload a PDF to get started.</p>
            <button onClick={() => fileRef.current.click()} className="btn-primary mt-3 text-sm">Upload Resume</button>
          </div>
        ) : (
          <div className="space-y-2">
            {resumes.map(r => (
              <label key={r._id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                ${selectedId === r._id ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="resume" value={r._id} checked={selectedId === r._id}
                  onChange={() => { setSelectedId(r._id); setStep(Math.max(step, 1)); }} className="text-primary" />
                <span className="text-sm font-medium">{r.filename}</span>
                {selectedId === r._id && <span className="badge-blue ml-auto">Selected</span>}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* STEP 1: JD */}
      <div className="card mb-4">
        <h2 className="font-bold text-navy mb-3">2. Paste Job Description</h2>
        <textarea
          className="input resize-none h-52 font-mono text-xs"
          placeholder="Paste the full job description here...

Example:
We are looking for a Backend Developer with 2+ years of experience in Node.js, Express, MongoDB...
Required skills: Node.js, REST APIs, MongoDB, Git
Nice to have: Docker, AWS, PostgreSQL..."
          value={jdText}
          onChange={e => { setJdText(e.target.value); if (e.target.value.length > 50) setStep(Math.max(step, 2)); }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-400">{jdText.length} characters {jdText.length < 100 && '(min 100)'}</span>
          {jdText.length >= 100 && <span className="text-xs text-green-600 font-medium">✓ Ready</span>}
        </div>
      </div>

      {/* STEP 2: Run */}
      <div className="card">
        <h2 className="font-bold text-navy mb-3">3. Run AI Analysis</h2>
        <p className="text-sm text-gray-500 mb-4">
          This will run <strong>3 AI calls</strong> in sequence:
          extract JD → gap analysis → cover letter generation. Takes about 15–30 seconds.
        </p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: '📋', label: 'JD Extraction', desc: 'Structured skills & requirements' },
            { icon: '🔍', label: 'Gap Analysis',  desc: 'What you have vs what they need' },
            { icon: '✉️', label: 'Cover Letter',  desc: 'Tailored to this specific role' }
          ].map(f => (
            <div key={f.label} className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-xs font-semibold text-navy">{f.label}</div>
              <div className="text-xs text-gray-500">{f.desc}</div>
            </div>
          ))}
        </div>
        <button onClick={handleRun} disabled={running || !selectedId || jdText.length < 100}
          className="btn-primary w-full text-base py-3">
          {running ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Analysing... (15–30 seconds)
            </span>
          ) : 'Run Analysis →'}
        </button>
      </div>
    </div>
  );
}
