import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    // Redirect to login if not authenticated, or home if wrong role
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
