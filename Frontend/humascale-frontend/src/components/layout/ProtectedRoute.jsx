import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FullPageSpinner } from '../ui/Spinner';

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, admin, bootstrapping } = useAuth();
  const location = useLocation();

  if (bootstrapping) return <FullPageSpinner />;

  if (requireAdmin) {
    if (!admin) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
  } else if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const { user, admin, bootstrapping } = useAuth();

  if (bootstrapping) return <FullPageSpinner />;

  if (user) return <Navigate to="/dashboard" replace />;
  if (admin) return <Navigate to="/admin" replace />;

  return children;
}
