import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar    from './components/Navbar';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analyse   from './pages/Analyse';
import History   from './pages/History';
import Result    from './pages/Result';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => (
  <div className="min-h-screen bg-gray-50">
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Navbar /><Dashboard /></ProtectedRoute>} />
      <Route path="/analyse"   element={<ProtectedRoute><Navbar /><Analyse /></ProtectedRoute>} />
      <Route path="/history"   element={<ProtectedRoute><Navbar /><History /></ProtectedRoute>} />
      <Route path="/result/:id" element={<ProtectedRoute><Navbar /><Result /></ProtectedRoute>} />
    </Routes>
  </div>
);

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>;
}
