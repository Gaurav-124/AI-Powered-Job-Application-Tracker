import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

const SkillBadge = ({ skill, color }) => (
  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2 ${color}`}>
    {skill}
  </span>
);

const AnalysisDetail = () => {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/analysis/${id}`)
      .then(({ data }) => setAnalysis(data.analysis))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(analysis?.coverLetter || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreColor = (score) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="card text-center py-16">
        <p className="text-gray-500">Analysis not found</p>
        <Link to="/history" className="btn-primary mt-4 inline-block">← Back to History</Link>
      </div>
    );
  }

  const { extractedJD, gapAnalysis, coverLetter } = analysis;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back */}
      <Link to="/history" className="text-primary hover:underline text-sm">
        ← Back to History
      </Link>

      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy">{extractedJD.role}</h1>
            <p className="text-gray-500">{extractedJD.company || "Company not specified"}</p>
            <p className="text-xs text-gray-400 mt-1">
              Analysed on {new Date(analysis.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric"
              })}
            </p>
          </div>
          <div className={`text-4xl font-black ${scoreColor(gapAnalysis.matchScore)}`}>
            {gapAnalysis.matchScore}%
          </div>
        </div>
      </div>

      {/* Required Skills */}
      <div className="card">
        <h2 className="font-bold text-navy mb-3">Required Skills (from JD)</h2>
        {extractedJD.requiredSkills.map((s) => (
          <SkillBadge key={s} skill={s} color="bg-blue-100 text-blue-800" />
        ))}
      </div>

      {/* Gap Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card border-l-4 border-green-500">
          <h3 className="font-bold text-green-700 mb-3">✅ You Have</h3>
          {gapAnalysis.youHave.map((s) => (
            <SkillBadge key={s} skill={s} color="bg-green-100 text-green-800" />
          ))}
        </div>
        <div className="card border-l-4 border-red-400">
          <h3 className="font-bold text-red-600 mb-3">❌ Missing</h3>
          {gapAnalysis.missing.length > 0
            ? gapAnalysis.missing.map((s) => (
                <SkillBadge key={s} skill={s} color="bg-red-100 text-red-700" />
              ))
            : <p className="text-gray-400 text-sm italic">No critical gaps 🎉</p>}
        </div>
      </div>

      {/* Suggestions */}
      {gapAnalysis.suggestions.length > 0 && (
        <div className="card border-l-4 border-yellow-400">
          <h3 className="font-bold text-yellow-700 mb-3">💡 Suggestions</h3>
          <ul className="space-y-2">
            {gapAnalysis.suggestions.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-yellow-500 shrink-0">→</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cover Letter */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-navy text-lg">📝 Cover Letter</h3>
          <button onClick={handleCopy} className="btn-secondary text-sm px-4">
            {copied ? "✅ Copied!" : "📋 Copy"}
          </button>
        </div>
        <div className="bg-gray-50 rounded-xl p-5 whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-mono border border-gray-200">
          {coverLetter}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetail;
