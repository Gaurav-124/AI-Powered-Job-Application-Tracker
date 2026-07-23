import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💼</div>
          <h1 className="text-2xl font-bold text-navy">Create Account</h1>
          <p className="text-gray-500 mt-1">Start tracking your job applications</p>
        </div>
        <div className="card">
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 border border-red-200">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" className="input" placeholder="Gaurav Raj" required
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="input" placeholder="you@example.com" required
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" className="input" placeholder="Min 6 characters" required
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
