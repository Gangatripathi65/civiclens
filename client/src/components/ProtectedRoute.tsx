import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role?: 'citizen' | 'admin' }) => {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};
