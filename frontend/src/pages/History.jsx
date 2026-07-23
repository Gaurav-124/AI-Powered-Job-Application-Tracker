import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const ScoreBadge = ({ score }) => {
  if (score >= 70) return <span className="badge-green">{score}%</span>;
  if (score >= 40) return <span className="badge-yellow">{score}%</span>;
  return <span className="badge-red">{score}%</span>;
};

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/analysis')
      .then(r => setAnalyses(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm('Delete this analysis?')) return;
    await api.delete(`/analysis/${id}`);
    setAnalyses(prev => prev.filter(a => a._id !== id));
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Analysis History</h1>
          <p className="text-gray-500 mt-1">{analyses.length} total analyses</p>
        </div>
        <Link to="/analyse" className="btn-primary">+ New Analysis</Link>
      </div>

      {analyses.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">📂</div>
          <h2 className="text-lg font-bold text-navy mb-2">No analyses yet</h2>
          <p className="text-gray-500 mb-6">Run your first analysis to see it here</p>
          <Link to="/analyse" className="btn-primary inline-block">Run Analysis</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {analyses.map(a => (
            <Link to={`/result/${a._id}`} key={a._id}
              className="card flex items-center justify-between hover:shadow-md transition-shadow group">
              <div className="flex-1">
                <div className="font-semibold text-navy group-hover:text-primary transition-colors">
                  {a.extractedJD?.role || 'Unknown Role'}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">
                  {a.extractedJD?.company || 'No company'} · {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ScoreBadge score={a.gapAnalysis?.matchScore || 0} />
                <button onClick={(e) => handleDelete(a._id, e)}
                  className="text-gray-300 hover:text-red-500 transition-colors text-lg">×</button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
