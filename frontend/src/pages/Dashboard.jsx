import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const StatCard = ({ value, label, color }) => (
  <div className="card text-center">
    <div className={`text-3xl font-bold ${color}`}>{value}</div>
    <div className="text-sm text-gray-500 mt-1">{label}</div>
  </div>
);

const ScoreBadge = ({ score }) => {
  if (score >= 70) return <span className="badge-green">{score}% match</span>;
  if (score >= 40) return <span className="badge-yellow">{score}% match</span>;
  return <span className="badge-red">{score}% match</span>;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [history,  setHistory]  = useState([]);
  const [resumes,  setResumes]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [h, r] = await Promise.all([
          api.get('/analysis'),
          api.get('/resume')
        ]);
        setHistory(h.data);
        setResumes(r.data);
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const avgScore = history.length
    ? Math.round(history.reduce((s, a) => s + (a.gapAnalysis?.matchScore || 0), 0) / history.length)
    : 0;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 mt-1">Here's your job application overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard value={history.length} label="Analyses done"     color="text-primary" />
        <StatCard value={resumes.length} label="Resumes uploaded"  color="text-purple-600" />
        <StatCard value={`${avgScore}%`} label="Avg match score"   color={avgScore >= 60 ? "text-green-600" : "text-orange-500"} />
        <StatCard value={history.filter(a => (a.gapAnalysis?.matchScore||0) >= 70).length} label="Strong matches" color="text-green-600" />
      </div>

      {/* Quick action */}
      {history.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-xl font-bold text-navy mb-2">Start your first analysis</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Upload your resume and paste a job description to get an AI-powered gap analysis and tailored cover letter.
          </p>
          <Link to="/analyse" className="btn-primary inline-block">Run First Analysis →</Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy">Recent Analyses</h2>
            <Link to="/analyse" className="btn-primary text-sm">+ New Analysis</Link>
          </div>
          <div className="space-y-3">
            {history.slice(0, 5).map(a => (
              <Link to={`/result/${a._id}`} key={a._id}
                className="card flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
                <div>
                  <div className="font-semibold text-navy">{a.extractedJD?.role || 'Unknown Role'}</div>
                  <div className="text-sm text-gray-500">
                    {a.extractedJD?.company || 'Company not mentioned'} · {new Date(a.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <ScoreBadge score={a.gapAnalysis?.matchScore || 0} />
              </Link>
            ))}
            {history.length > 5 && (
              <Link to="/history" className="text-primary text-sm font-medium hover:underline block text-center mt-2">
                View all {history.length} analyses →
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
