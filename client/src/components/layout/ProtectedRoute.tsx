import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from '../common/Loader';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Loader label="Restoring your session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return <Outlet />;
}
