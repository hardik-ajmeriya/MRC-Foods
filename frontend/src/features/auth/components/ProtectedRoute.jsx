import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, roles = [] }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, user, getRoleHome } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Validating your session..." />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ fromPath: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to={getRoleHome(user?.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
