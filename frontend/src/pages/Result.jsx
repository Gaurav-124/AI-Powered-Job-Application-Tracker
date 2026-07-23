import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const SkillTag = ({ skill, type }) => {
  const classes = {
    match:   'badge-green',
    missing: 'badge-red',
    partial: 'badge-yellow'
  };
  return <span className={`${classes[type]} mr-1 mb-1 inline-block`}>{skill}</span>;
};

const ScoreRing = ({ score }) => {
  const color = score >= 70 ? '#27AE60' : score >= 40 ? '#E67E22' : '#E74C3C';
  const label = score >= 70 ? 'Strong Match' : score >= 40 ? 'Moderate Match' : 'Weak Match';
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" strokeWidth="10" />
          <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - score / 100)}`}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{score}%</span>
        </div>
      </div>
      <span className="text-sm font-semibold mt-2" style={{ color }}>{label}</span>
    </div>
  );
};

export default function Result() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [copied,   setCopied]   = useState(false);
  const [tab,      setTab]      = useState('gap');

  useEffect(() => {
    api.get(`/analysis/${id}`)
      .then(r => setAnalysis(r.data))
      .catch(() => setError('Analysis not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const copyLetter = () => {
    navigator.clipboard.writeText(analysis.coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this analysis?')) return;
    await api.delete(`/analysis/${id}`);
    navigate('/history');
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (error)   return <div className="max-w-xl mx-auto mt-20 text-center"><p className="text-red-500">{error}</p><Link to="/history" className="btn-primary mt-4 inline-block">Back to History</Link></div>;

  const { extractedJD: jd, gapAnalysis: gap, coverLetter } = analysis;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">{jd.role}</h1>
          <p className="text-gray-500">{jd.company || 'Company not mentioned'} · {new Date(analysis.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/analyse" className="btn-primary text-sm">New Analysis</Link>
          <button onClick={handleDelete} className="text-sm text-red-500 hover:text-red-700 border border-red-200 px-3 py-2 rounded-lg">Delete</button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Score */}
        <div className="card flex flex-col items-center justify-center">
          <ScoreRing score={gap.matchScore} />
        </div>

        {/* JD Summary */}
        <div className="card md:col-span-2">
          <h2 className="font-bold text-navy mb-3">📋 Role Summary</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Role:</span> <span className="font-medium">{jd.role}</span></div>
            <div><span className="text-gray-500">Experience:</span> <span className="font-medium">{jd.experienceYears > 0 ? `${jd.experienceYears}+ years` : 'Not specified'}</span></div>
            <div><span className="text-gray-500">Salary:</span> <span className="font-medium">{jd.salaryRange || 'Not mentioned'}</span></div>
          </div>
          {jd.keyResponsibilities?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 font-medium mb-1">KEY RESPONSIBILITIES</p>
              <ul className="text-sm space-y-1">
                {jd.keyResponsibilities.map((r, i) => <li key={i} className="flex gap-2"><span className="text-primary">•</span>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        {[['gap', '🔍 Gap Analysis'], ['jd', '📋 JD Details'], ['letter', '✉️ Cover Letter']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${tab === t ? 'bg-white shadow text-navy' : 'text-gray-500 hover:text-gray-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* GAP ANALYSIS TAB */}
      {tab === 'gap' && (
        <div className="space-y-4">
          {gap.matchingSkills?.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-green-700 mb-3">✅ Skills You Have ({gap.matchingSkills.length})</h3>
              <div className="flex flex-wrap">{gap.matchingSkills.map(s => <SkillTag key={s} skill={s} type="match" />)}</div>
            </div>
          )}
          {gap.missingSkills?.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-red-600 mb-3">❌ Missing Skills ({gap.missingSkills.length})</h3>
              <div className="flex flex-wrap">{gap.missingSkills.map(s => <SkillTag key={s} skill={s} type="missing" />)}</div>
              <p className="text-xs text-gray-400 mt-3">Focus on learning these to improve your match score for similar roles.</p>
            </div>
          )}
          {gap.partialMatches?.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-yellow-600 mb-3">⚡ Partial Matches ({gap.partialMatches.length})</h3>
              <div className="flex flex-wrap">{gap.partialMatches.map(s => <SkillTag key={s} skill={s} type="partial" />)}</div>
            </div>
          )}
          <div className="card bg-blue-50 border border-blue-200">
            <h3 className="font-bold text-navy mb-2">🧠 AI Recommendation</h3>
            <p className="text-sm text-gray-700">{gap.recommendation}</p>
          </div>
        </div>
      )}

      {/* JD DETAILS TAB */}
      {tab === 'jd' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-bold text-navy mb-3">Required Skills</h3>
            <div className="flex flex-wrap">{jd.requiredSkills?.map(s => <SkillTag key={s} skill={s} type="match" />)}</div>
          </div>
          {jd.niceToHave?.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-navy mb-3">Nice to Have</h3>
              <div className="flex flex-wrap">{jd.niceToHave.map(s => <SkillTag key={s} skill={s} type="partial" />)}</div>
            </div>
          )}
          <div className="card">
            <h3 className="font-bold text-navy mb-3">Raw Job Description</h3>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
              {analysis.jdText}
            </pre>
          </div>
        </div>
      )}

      {/* COVER LETTER TAB */}
      {tab === 'letter' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-navy">✉️ Tailored Cover Letter</h3>
            <button onClick={copyLetter} className="btn-secondary text-sm">
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
            {coverLetter}
          </div>
          <p className="text-xs text-gray-400 mt-3">✏️ Review and personalise before sending. AI-generated letters should be edited to match your voice.</p>
        </div>
      )}
    </div>
  );
}
