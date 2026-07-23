import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLink = (to, label) => (
    <Link to={to} className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors
      ${pathname === to ? 'bg-blue-100 text-primary' : 'text-gray-600 hover:text-primary hover:bg-gray-100'}`}>
      {label}
    </Link>
  );

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="font-bold text-navy text-lg flex items-center gap-2">
          💼 <span>AI Job Tracker</span>
        </Link>
        <div className="flex items-center gap-1">
          {navLink('/dashboard', 'Dashboard')}
          {navLink('/analyse', 'New Analysis')}
          {navLink('/history', 'History')}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:block">Hi, {user?.name?.split(' ')[0]}</span>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 font-medium">Logout</button>
        </div>
      </div>
    </nav>
  );
}
